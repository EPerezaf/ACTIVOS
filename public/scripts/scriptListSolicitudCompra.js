// FUNCION PARA TRAER LAS SOLICITUDES GUARDADAS
// LISTASOLICITUDCOMPRA.HTML

let todasLasSolicitudes = [];

// FUNCION PARA PODER TRAER LAS SOLICITUDES DE COMPRAS
async function cargarSolicitudes() {
    const contenedor = document.getElementById('contenedorSolicitudes');
    contenedor.innerHTML = "<p>Cargando Solicitudes...</p>";

    // OBTENER EL ROL DEL USUARIO DESDE LOCALSTORAGE
    const useRole = localStorage.getItem("role");

    // VERIFICAR SI HAY UN USUARIO DESDE LOCALSTORAGE
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/html/index.html";
        return;
    }

    try {
        const res = await fetch('/api/routeListaSolicitudCompra/solicitudes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            // TOKEN INVALIDO O EXPIRADO 
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/html/index.html";
            return;
        }

        const data = await res.json();
        
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(data)) {
            todasLasSolicitudes = data;
        } else if (data.data && Array.isArray(data.data)) {
            todasLasSolicitudes = data.data;
        } else {
            console.error("Estructura de respuesta no reconocida:", data);
            todasLasSolicitudes = [];
        }

        console.log("Solicitudes cargadas:", todasLasSolicitudes);

        if (todasLasSolicitudes.length == 0) {
            contenedor.innerHTML = "<p>No hay solicitudes registradas</p>";
            return;
        }

        // Cargar opciones de filtro
        cargarOpcionesFiltro();

        mostrarSolicitudes(todasLasSolicitudes);

    } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        contenedor.innerHTML = "<p>Error al cargar solicitudes</p>";
    }
}

function cargarOpcionesFiltro() {
    // Cargar clasificaciones únicas
    const clasificacionesUnicas = [...new Set(todasLasSolicitudes.map(s => s.clasificacionCompras))].filter(Boolean);
    const filtroClasificacion = document.getElementById('filtroClasificacion');
    filtroClasificacion.innerHTML = '<option value="">Todas las clasificaciones</option>';
    
    clasificacionesUnicas.forEach(clasificacion => {
        const option = document.createElement('option');
        option.value = clasificacion;
        option.textContent = clasificacion;
        filtroClasificacion.appendChild(option);
    });

    // Cargar proveedores únicos (de todos los proveedores en todas las solicitudes)
    const todosLosProveedores = todasLasSolicitudes.flatMap(s => 
        s.proveedores.map(p => p.razonSocial || p.nickname)
    ).filter(Boolean);
    const proveedoresUnicos = [...new Set(todosLosProveedores)];
    const filtroProveedor = document.getElementById('filtroProveedor');
    filtroProveedor.innerHTML = '<option value="">Todos los proveedores</option>';
    
    proveedoresUnicos.forEach(proveedor => {
        const option = document.createElement('option');
        option.value = proveedor;
        option.textContent = proveedor;
        filtroProveedor.appendChild(option);
    });
}

function mostrarSolicitudes(solicitudes) {
    const contenedor = document.getElementById('contenedorSolicitudes');
    const useRole = localStorage.getItem("role");

    if (solicitudes.length == 0) {
        contenedor.innerHTML = "<p>No hay solicitudes con los filtros aplicados</p>";
        return;
    }

    contenedor.innerHTML = solicitudes.map(s => {
        const personalHTML = s.personal.map(p =>
            `<li>${p.nombre} ${p.aPaterno} ${p.aMaterno}</li>`
        ).join('');
        const conceptoActivoHTML = s.conceptoActivo.map((f,index) =>{
            const proveedorSeleccionado = f.proveedorSeleccionado;
            const proveedorInfo = proveedorSeleccionado ?
             `<br><strong style="color: #28a745;">✓ Proveedor seleccionado: ${proveedorSeleccionado.razonSocial} (${proveedorSeleccionado.nickname}) - $${proveedorSeleccionado.sc_monto?.toLocaleString() || '0'}</strong>` : 
                '';
             return `<li> Familia: ${f.sc_cca_familia} - Sub Familia: ${f.sc_cca_subFamilia} - Concepto: ${f.sc_cca_descripcion}${proveedorInfo}</li>`
        }).join('');
        const proveedorHTML = s.proveedores.map(j =>
            `<li>Razon Social:${j.razonSocial} - NickName: ${j.nickname} - Costo:${j.sc_monto}</li>`
        ).join('');

        // Calcular monto total de proveedores seleccionados
        let montoTotalSeleccionado = 0;
        if (s.conceptoActivo && Array.isArray(s.conceptoActivo)) {
            s.conceptoActivo.forEach(activo => {
                if (activo.proveedorSeleccionado && activo.proveedorSeleccionado.sc_monto) {
                    montoTotalSeleccionado += parseFloat(activo.proveedorSeleccionado.sc_monto);
                }
            });
        }

        let botonesHTML = '';
        if(useRole === "Administrador"){
            //ADMINITRADOR: TODOS LOS PERMISOS
            botonesHTML = `
                <button class="btn-accion btn-autorizar" onclick="autorizarSolicitud(${s.id})">Autorizar</button>
                <button class="btn-accion btn-editar" onclick="editarSolicitud(${s.id})">Editar</button>
                <button class="btn-accion btn-eliminar" onclick="eliminarSolicitud(${s.id})">Eliminar</button>
            `;
        }else if(useRole === "Gerente General"){
            //GERENTE GENERAL: SOLO PUEDE AUTORIZAR SOLICITUDES EN PROCESO Y CANCELAR
           if(s.estatusCompras === "Proceso") {
            // Verificar si todos los activos tienen proveedor seleccionado
            const todosConProveedor = s.conceptoActivo && s.conceptoActivo.every(activo => activo.proveedorSeleccionado);
            botonesHTML = `
                <button class="btn-accion btn-autorizar" onclick="autorizarSolicitud(${s.id})" ${!todosConProveedor ? 'disabled' : ''}>Autorizar</button>
                <button class="btn-accion btn-eliminar" onclick="cancelarSolicitud(${s.id})">Cancelar</button>
                <button class="btn-accion btn-proveedor" onclick="seleccionarProveedorSolicitud(${s.id})">Seleccionar Proveedor</button>
            `;
            if (!todosConProveedor) {
                botonesHTML += `<span style="color: #dc3545; font-size: 12px; margin-left: 10px;">Faltan proveedores por seleccionar</span>`;
            }
           }else if(s.estatusCompras === "Autorizada"){
            botonesHTML = `
                <button class="btn-accion btn-proveedor" onclick="verDetalleSolicitud(${s.id})">Ver detalle</button>
            `
           }else{
            botonesHTML = `
                <button class="btn-accion btn-ver" onclick="verDetalleSolicitud(${s.id})">Ver Detalle</button>
            `
           }
        }else if(useRole === "Jefe de Activos"){
            //JEFE DE ACTIVOS: PUEDE EDITAR Y ELIMINAR SOLO SI ESTA EN PENDIENTE, PUEDE MANDAR A PROCESO
            if(s.estatusCompras === "Pendiente"){
                botonesHTML = `
                    <button class="btn-accion btn-editar" onclick="editarSolicitud(${s.id})">Editar</button>
                    <button class="btn-accion btn-eliminar" onclick="cancelarSolicitud(${s.id})">Eliminar</button>
                    <button class="btn-accion btn-proceso" onclick="mandarAProceso(${s.id})">Mandar a Proceso</button>
                `;
            }else if(s.estatusCompras === "Autorizada"){
                botonesHTML = `
                    <button class="btn-accion btn-registrar" onclick="registrarActivoDesdeLista(${s.id})">Registrar Activo</button>
                `;
            }else if(s.estatusCompras === "Cancelada"){
                botonesHTML = `
                    <button class="btn-accion btn-proveedor" onclick="verDetalleSolicitud(${s.id})">Ver detalle</button>
                `
            }else {
                botonesHTML = `
                    <button class="btn-accion btn-ver" onclick="verSolicitud(${s.id})">Ver Detalle</button>
                `;
            }
        }

        // CORRECCIÓN: Cambié new Date.UTC por new Date
        const fechaAutorizacion = s.fechaAutorizacion ? new Date(s.fechaAutorizacion).toLocaleDateString() : '';

        return `
            <div class="concepto-card">
                <div class="concepto-header">
                    <h3 class="concepto-titulo">Solicitud Compra #${s.id}</h3>
                    <span class="concepto-estatus estatus-${s.estatusCompras}">${s.estatusCompras}</span>
                </div>
                <div class="concepto-body">
                    <p><strong>Clasificacion:</strong> ${s.clasificacionCompras}<p>
                    <p><strong>Fecha de Creacion:</strong>${new Date(s.fechaCreacion).toLocaleDateString()}</p>
                    ${fechaAutorizacion ? `<p><strong>Fecha Autorizacion:</strong> ${fechaAutorizacion}</p>` : ''}
                    <p><strong>Descripcion:</strong>${s.descripcionConceptoCompra}</p>
                    <div>
                        <strong>Personal</strong>
                        <ul>${personalHTML}</ul>
                    </div>
                    <div>
                        <strong>Concepto Activo</strong>
                        <ul>${conceptoActivoHTML}</ul>
                    </div>
                    <div>
                        <strong>Proveedores</strong>
                        <ul>${proveedorHTML}</ul>
                    </div>
                </div>
                <div class="concepto-meta">
                    <div class="concepto-fecha">
                        <span>📅</span>
                        <p>${new Date(s.fechaCreacion).toLocaleDateString()}</p>
                        ${fechaAutorizacion ? `<p>Fecha Autorizacion: ${fechaAutorizacion}</p>` : ''}
                    </div>
                    <div class="concepto-acciones">
                        <div>${botonesHTML}</div>
                    </div>
                </div>
            </div>
            <br>
            <br>
        `;
    }).join('');
}

//PARA JEFE DE ACTIVOS: MANDAR A PROCESO
async function mandarAProceso(id) {
    if(!confirm(`¿Seguro que deseas mandar la solicitud #${id} a Proceso?`)) return;
    try{
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}/proceso`,{
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            cargarSolicitudes();
        }else {
            alert(result.message || "Error al mandar a proceso");
        }
    }catch(error){
        console.log(error);
        alert("Error al mandar a proceso");
    }
}

//PARA GERENTE GEENRAL: CANCELAR SOLICITUD
async function cancelarSolicitud(id) {
    if(!confirm(`¿Seguro que deseas cancelar la solicitud #${id}`)) return;
    try{
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}/cancelar`,{
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type':'application/json'
            }
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            window.location.reload();
        }else{
            alert(result.message || "Error al cancelar la solicitud");
        }
    }catch(error){
        console.log(error);
        alert("Error al cancelar la solicitud");
    }
}

//PARA GERENTE GENERAL: SELECCIONAR PROVEEDOR
async function seleccionarProveedorSolicitud(id) {
    /*const proveedorSeleccionado = prompt("Ingrese el nombre del proveedor seleccionado:");
    if(proveedorSeleccionado){
        try{
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}/seleccionarProveedor`,{
                method: 'PUT',
                headers: {
                    'Authorization':`Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ proveedor: proveedorSeleccionado})
            });

            const result = await res.json();
            if(result.success){
                alert("Proveedor seleccionado correctamente");
                cargarSolicitudes();
            }else{
                alert(result.message || "Error al seleccionar proveedor");
            }
        }catch(error){
            console.error(error);
            alert("Error al seleccionar al proveedor");
        }
    }*/
   window.location.href = `/html/detalleSolicitudCompra.html?id=${id}`;
}

//PARA JEFE DE ACTIVOS: REGISTRAR ACTIVO DESDE LA LISTA
function registrarActivoDesdeLista(id){
    window.location.href = `/html/editarSolicitudes.html?id=${id}`;
}

function filtrarSolicitudes() {
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroClasificacion = document.getElementById('filtroClasificacion').value;
    const filtroProveedor = document.getElementById('filtroProveedor').value;
    
    console.log("Aplicando filtros - Estatus:", filtroEstatus, "Clasificacion:", filtroClasificacion, "Proveedor:", filtroProveedor);

    let solicitudesFiltradas = todasLasSolicitudes;

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => 
            solicitud.estatusCompras === filtroEstatus
        );
    }

    // Aplicar filtro de clasificación
    if (filtroClasificacion !== "") {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => 
            solicitud.clasificacionCompras === filtroClasificacion
        );
    }

    // Aplicar filtro de proveedor
    if (filtroProveedor !== "") {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => 
            solicitud.proveedores.some(proveedor => 
                proveedor.razonSocial === filtroProveedor || proveedor.nickname === filtroProveedor
            )
        );
    }

    console.log("Resultado del filtro:", solicitudesFiltradas);
    mostrarSolicitudes(solicitudesFiltradas);
}

function buscarSolicitudes() {
    const busquedaInput = document.getElementById('busquedaInput');
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroClasificacion = document.getElementById('filtroClasificacion').value;
    const filtroProveedor = document.getElementById('filtroProveedor').value;

    let solicitudesFiltradas = todasLasSolicitudes;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda) {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud =>
            (solicitud.descripcionConceptoCompra && solicitud.descripcionConceptoCompra.toLowerCase().includes(terminoBusqueda)) ||
            (solicitud.clasificacionCompras && solicitud.clasificacionCompras.toLowerCase().includes(terminoBusqueda)) ||
            (solicitud.personal && solicitud.personal.some(p => 
                (p.nombre && p.nombre.toLowerCase().includes(terminoBusqueda)) ||
                (p.aPaterno && p.aPaterno.toLowerCase().includes(terminoBusqueda)) ||
                (p.aMaterno && p.aMaterno.toLowerCase().includes(terminoBusqueda))
            )) ||
            (solicitud.proveedores && solicitud.proveedores.some(proveedor => 
                (proveedor.razonSocial && proveedor.razonSocial.toLowerCase().includes(terminoBusqueda)) ||
                (proveedor.nickname && proveedor.nickname.toLowerCase().includes(terminoBusqueda))
            )) ||
            (solicitud.conceptoActivo && solicitud.conceptoActivo.some(concepto => 
                (concepto.sc_cca_familia && concepto.sc_cca_familia.toLowerCase().includes(terminoBusqueda)) ||
                (concepto.sc_cca_subFamilia && concepto.sc_cca_subFamilia.toLowerCase().includes(terminoBusqueda)) ||
                (concepto.sc_cca_descripcion && concepto.sc_cca_descripcion.toLowerCase().includes(terminoBusqueda))
            ))
        );
    }

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => 
            solicitud.estatusCompras === filtroEstatus
        );
    }

    // Aplicar filtro de clasificación
    if (filtroClasificacion !== "") {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => 
            solicitud.clasificacionCompras === filtroClasificacion
        );
    }

    // Aplicar filtro de proveedor
    if (filtroProveedor !== "") {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => 
            solicitud.proveedores.some(proveedor => 
                proveedor.razonSocial === filtroProveedor || proveedor.nickname === filtroProveedor
            )
        );
    }

    mostrarSolicitudes(solicitudesFiltradas);
}

async function autorizarSolicitud(id) {
    if (!confirm(`¿Seguro que deseas autorizar la solicitud #${id}?`)) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}/autorizar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();
        if (result.success) {
            alert(result.message);
            cargarSolicitudes();
        } else {
            alert(result.message || "Error al autorizar la solicitud");
        }
    } catch (e) {
        console.error(e);
        alert("Error al autorizar la solicitud");
    }
}

// FUNCION PARA ELIMINAR 
async function eliminarSolicitud(id) {
    if (!confirm(`¿Seguro que deseas eliminar la solicitud #${id}?`)) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();
        if (result.success) {
            alert(result.message);
            cargarSolicitudes();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error(error);
        alert("Error al eliminar la solicitud");
    }
}

// FUNCION PARA EDITAR 
function editarSolicitud(id) {
    window.location.href = `/html/editarSolicitudes.html?id=${id}`;
}

// Permitir búsqueda con Enter
document.addEventListener('DOMContentLoaded', function() {
    const busquedaInput = document.getElementById('busquedaInput');
    if (busquedaInput) {
        busquedaInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                buscarSolicitudes();
            }
        });
    }
});

// CARGAR AL PRINCIPIO DE LA PAGINA
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
        window.location.href = "/html/index.html";
        return;
    }

    // VERIFICAR QUE EL ROL SI TENGA ACCESO A ESTA PAGINA
    const rolesPermitidos = ["Administrador", "Gerente General", "Jefe de Activos"];
    if (!rolesPermitidos.includes(role)) {
        alert("No tienes permiso para acceder a esta pagina");
        window.location.href = "/html/index.html";
        return;
    }

    cargarSolicitudes();
});

function verSolicitud(id) {
    window.location.href = `/html/editarSolicitudes.html?id=${id}&modo=ver`;
}
// FUNCIÓN PARA QUE EL GERENTE GENERAL VEA EL DETALLE SIN EDITAR
function verDetalleSolicitud(id) {
    window.location.href = `/html/detalleSolicitudCompra.html?id=${id}`;
}