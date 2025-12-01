// FUNCION PARA TRAER LAS SOLICITUDES DE GASTO GUARDADAS
async function cargarSolicitudesGasto(filtros = {}) {
    const contenedor = document.getElementById('contenedorSolicitudGasto');
    contenedor.innerHTML = "<p>Cargando solicitudes de gasto...</p>";

    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    
    if(!token){
        window.location.href = "/html/index.html";
        return;
    }

    try {
        // CONSTRUIR PARÁMETROS DE FILTRO SIN DUPLICADOS
        const params = new URLSearchParams();
        
        // DETERMINAR EL FILTRO DE ESTATUS (NO DUPLICAR)
        let estatusFiltro = '';
        
        if (filtros.estatus && filtros.estatus !== '') {
            // SI EL USUARIO SELECCIONÓ UN FILTRO MANUAL, USAR ESE
            estatusFiltro = filtros.estatus;
        } else {
            // SI NO HAY FILTRO MANUAL, APLICAR FILTRO AUTOMÁTICO POR ROL
            if (userRole === "Jefe de Activos") {
                estatusFiltro = 'Autorizada,Pendiente, Proceso';
            } else if (userRole === "Administrador") {
                estatusFiltro = 'Proceso,Autorizada,Pendiente';
            }
            else if( userRole === "Gerente General"){
                estatusFiltro = 'Proceso';
            }
        }
        
        // AGREGAR PARÁMETROS SOLO SI TIENEN VALOR
        if (estatusFiltro && estatusFiltro !== '') {
            params.append('estatus', estatusFiltro);
        }
        
        if (filtros.tipoGasto && filtros.tipoGasto !== '') {
            params.append('tipoGasto', filtros.tipoGasto);
        }
        
        if (filtros.busqueda && filtros.busqueda !== '') {
            params.append('busqueda', filtros.busqueda);
        }

        const url = `/api/routeSolicitudGasto/solicitudesGasto?${params.toString()}`;
        
        console.log('🔍 URL de consulta CORREGIDA:', url);
        console.log('📋 Filtros aplicados:', { 
            estatus: estatusFiltro, 
            tipoGasto: filtros.tipoGasto, 
            busqueda: filtros.busqueda 
        });
        
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if(res.status === 401){
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/html/index.html";
            return;
        }

        const resultado = await res.json();
        
        console.log('📦 Respuesta del servidor:', resultado);
        
        if (!resultado.success) {
            contenedor.innerHTML = "<p>Error al cargar las solicitudes</p>";
            return;
        }

        const solicitudes = resultado.data;

        console.log(`📊 Total de solicitudes recibidas: ${solicitudes.length}`);
        
        // Mostrar detalles de cada solicitud para debug
        console.log('📋 Detalles de las solicitudes recibidas:');
        solicitudes.forEach(s => {
            console.log(`   Solicitud #${s.id} - Estatus: "${s.estatusCompras}" - Tipo Gasto: "${s.tipoGasto}"`);
        });

        if (solicitudes.length === 0) {
            let mensaje = "No hay solicitudes de gasto registradas";
            if (estatusFiltro || filtros.tipoGasto || filtros.busqueda) {
                mensaje += " con los filtros aplicados";
            }
            contenedor.innerHTML = `<p>${mensaje}</p>`;
            return;
        }

        // ACTUALIZAR LOS FILTROS VISUALES PARA REFLEJAR LO QUE SE ESTÁ MOSTRANDO
        actualizarFiltrosVisuales(estatusFiltro, filtros.tipoGasto);

        // ... (resto del código para mostrar las solicitudes se mantiene igual)
        contenedor.innerHTML = solicitudes.map(s => {
            const activosHTML = s.activos.map(activo => {
                const proveedorSeleccionado = activo.proveedorSeleccionado;
                const proveedoresCount = activo.proveedores ? activo.proveedores.length : 0;
                
                const infoProveedor = proveedorSeleccionado ? 
                    `<div><strong>Proveedor seleccionado:</strong> ${proveedorSeleccionado.razonSocial} - $${proveedorSeleccionado.monto.toLocaleString()}</div>` :
                    `<div><em>Sin proveedor seleccionado</em></div>`;

                return `
                <div class="activo-item">
                    <strong>${activo.conceptoActivo}</strong>
                    <div>${activo.conceptoGasto}</div>
                    ${infoProveedor}
                    <div><small>${proveedoresCount} proveedor(es) disponible(s)</small></div>
                </div>
                `;
            }).join('');

            let botonesHTML = '';
            if(userRole === "Administrador"){
                botonesHTML = `
                    <button onclick="editarSolicitudGasto(${s.id})" class="btn-accion btn-editar">Editar</button>
                    <button onclick="eliminarSolicitudGasto(${s.id})" class="btn-accion btn-eliminar">Eliminar</button>`;
            } else if(userRole === "Gerente General"){
                if(s.estatusCompras === "Proceso" && s.estatusCompras === "Autorizada"){
                    botonesHTML = `
                    <button class="btn-accion btn-autorizar" onclick="autorizarSolicitudGasto(${s.id})">Autorizar</button>`;
                }
            } else if(userRole === "Jefe de Activos" && s.estatusCompras === "Pendiente"){
                botonesHTML = `
                    <button onclick="editarSolicitudGasto(${s.id})" class="btn-accion btn-editar">Editar</button>
                    <button onclick="eliminarSolicitudGasto(${s.id})" class="btn-accion btn-eliminar">Eliminar</button>
                    <button onclick="mandarProceso(${s.id})" class="btn-accion btn-proceso">Proceso</button>`;
            }else if(userRole === "Jefe de Activos" && s.estatusCompras === "Proceso"){
                botonesHTML = `
                    <button onclick="editarSolicitudGasto(${s.id})" class="btn-accion btn-editar">Editar</button>
                    <button onclick="eliminarSolicitudGasto(${s.id})" class="btn-accion btn-eliminar">Eliminar</button>
                `;
            }                

            return `
            <div class="concepto-card" id="solicitud-${s.id}">
                <div class="concepto-header">
                    <h3 class="concepto-titulo">Solicitud Gasto #${s.id}</h3>
                    <span class="concepto-estatus estatus-${s.estatusCompras}">${s.estatusCompras}</span>
                </div>
                
                <div class="concepto-body">
                    <p><strong>Clasificación:</strong> ${s.clasificacionGasto}</p>
                    <p><strong>Tipo de Gasto:</strong> ${s.tipoGasto}</p>
                    <p><strong>Descripción:</strong> ${s.descripcionGasto}</p>
                    <p><strong>Monto Total:</strong> $${s.montoTotal.toLocaleString()}</p>
                    
                    <div class="activos-section">
                        <strong>Activos:</strong>
                        ${activosHTML}
                    </div>
                </div>
                
                <div class="concepto-meta">
                    <div class="solicitud-fecha">
                        <span>📅</span>
                        <p>Creado: ${new Date(s.fechaCreacion).toLocaleDateString()}</p>
                    </div>
                    
                    <div class="concepto-acciones">
                        ${botonesHTML}
                        <button onclick="verDetalleSolicitudGasto(${s.id})" class="btn-accion btn-ver">Ver Detalle</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error al cargar solicitudes de gasto:", error);
        contenedor.innerHTML = "<p>Error al cargar solicitudes de gasto</p>";
    }
}

// FUNCIÓN PARA ACTUALIZAR LOS FILTROS VISUALES
function actualizarFiltrosVisuales(estatusFiltro, tipoGastoFiltro) {
    const filtroEstatus = document.getElementById('filtroEstatus');
    const filtroTipoGasto = document.getElementById('filtroTipoGasto');
    
    if (filtroEstatus && estatusFiltro) {
        // Si hay un filtro automático aplicado, actualizar el select
        filtroEstatus.value = estatusFiltro;
    }
    
    if (filtroTipoGasto && tipoGastoFiltro) {
        filtroTipoGasto.value = tipoGastoFiltro;
    }
}

// FUNCION PARA AUTORIZAR SOLICITUD DE GASTO
async function autorizarSolicitudGasto(id) {
    if(!confirm(`¿Seguro que deseas autorizar la solicitud de gasto #${id}?`)) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}/autorizar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            cargarSolicitudesGasto();
        } else {
            alert(result.message || "Error al autorizar la solicitud de gasto");
        }
    } catch(e) {
        console.error(e);
        alert("Error al autorizar la solicitud de gasto");
    }
}

// FUNCION PARA ELIMINAR SOLICITUD DE GASTO
async function eliminarSolicitudGasto(id) {
    if(!confirm(`¿Seguro que deseas eliminar la solicitud de gasto #${id}?`)) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            cargarSolicitudesGasto();
        } else {
            alert(result.message);
        }
    } catch(error) {
        console.error(error);
        alert("Error al eliminar la solicitud de gasto");
    }
}

// FUNCION PARA EDITAR SOLICITUD DE GASTO
function editarSolicitudGasto(id) {
    window.location.href = `/html/solicitudGasto.html?id=${id}`;
}

// FUNCION PARA VER DETALLE DE SOLICITUD DE GASTO
function verDetalleSolicitudGasto(id) {
    window.location.href = `/html/detalleSolicitudGasto.html?id=${id}`;
}

// FUNCION PARA FILTRAR SOLICITUDES (CORREGIDA)
function filtrarSolicitudes() {
    try {
        const filtroEstatus = document.getElementById('filtroEstatus');
        const filtroTipoGasto = document.getElementById('filtroTipoGasto');
        const inputBusqueda = document.querySelector('.busqueda-input');
        
        if (!filtroEstatus || !filtroTipoGasto || !inputBusqueda) {
            console.warn('Algunos elementos de filtro no están disponibles');
            cargarSolicitudesGasto();
            return;
        }
        
        const filtros = {
            estatus: filtroEstatus.value,
            tipoGasto: filtroTipoGasto.value,
            busqueda: inputBusqueda.value.trim()
        };

        console.log('🎯 Aplicando filtros manuales:', filtros);
        cargarSolicitudesGasto(filtros);
        
    } catch (error) {
        console.error('Error en filtrarSolicitudes:', error);
        cargarSolicitudesGasto();
    }
}

// FUNCION PARA LIMPIAR FILTROS (ACTUALIZADA)
function limpiarFiltros() {
    const filtroEstatus = document.getElementById('filtroEstatus');
    const filtroTipoGasto = document.getElementById('filtroTipoGasto');
    const inputBusqueda = document.querySelector('.busqueda-input');
    
    if (filtroEstatus) filtroEstatus.value = '';
    if (filtroTipoGasto) filtroTipoGasto.value = '';
    if (inputBusqueda) inputBusqueda.value = '';
    
    // Al limpiar, se aplicarán los filtros automáticos por rol
    cargarSolicitudesGasto();
}


// CARGAR AL PRINCIPIO DE LA PAGINA
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token || !role) {
        window.location.href = "/html/index.html";
        return;
    }

    const rolesPermitidos = ["Administrador", "Gerente General", "Jefe de Activos"];
    if(!rolesPermitidos.includes(role)) {
        alert("No tienes permiso para acceder a esta página");
        window.location.href = "/html/index.html";
        return;
    }

    // Cargar todas las solicitudes al inicio
    cargarSolicitudesGasto();

    // Configurar event listeners después de un pequeño retraso
    setTimeout(() => {
        configurarEventListeners();
    }, 100);
});

// FUNCIÓN PARA CONFIGURAR EVENT LISTENERS
function configurarEventListeners() {
    const elementos = {
        filtroEstatus: document.getElementById('filtroEstatus'),
        filtroTipoGasto: document.getElementById('filtroTipoGasto'),
        btnBuscar: document.querySelector('.btn-buscar'),
        inputBusqueda: document.querySelector('.busqueda-input'),
        btnLimpiar: document.querySelector('.btn-limpiar') // Opcional: agregar botón limpiar
    };

    console.log('Buscando elementos en el DOM:', elementos);

    Object.entries(elementos).forEach(([nombre, elemento]) => {
        if (elemento) {
            console.log(`Elemento ${nombre} encontrado`);
            
            switch(nombre) {
                case 'filtroEstatus':
                case 'filtroTipoGasto':
                    elemento.addEventListener('change', filtrarSolicitudes);
                    break;
                case 'btnBuscar':
                    elemento.addEventListener('click', filtrarSolicitudes);
                    break;
                case 'inputBusqueda':
                    elemento.addEventListener('keypress', function(e) {
                        if(e.key === 'Enter') {
                            filtrarSolicitudes();
                        }
                    });
                    break;
                case 'btnLimpiar':
                    elemento.addEventListener('click', limpiarFiltros);
                    break;
            }
        } else {
            console.warn(`Elemento ${nombre} no encontrado en el DOM`);
        }
    });
}

//FUNCION PARA MANDAR A PROCESO
async function mandarProceso(id){
    if(!confirm(`¿Seguro que deseas mandar la solicitud #${id} a Proceso?`)) return;
    try{
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/:id/enviarProceso`,{
            method: 'PUT',
            headers: {
                'Authorization':`Bearer ${token}`,
                'Content-Type':'application/json'
            }
        });
        const result = await res.json();
        if(result.success){
            alert(result.message);
            cargarSolicitudesGasto();
        }else{
            alert(result.message || "Error al mandar a proceso");
        }
    }catch(error){
        console.log(error);
        alert("Error al mandar a proceso");
    }
}