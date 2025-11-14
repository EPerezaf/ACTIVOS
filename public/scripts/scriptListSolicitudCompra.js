
//FUNCION PARA TRAER LAS SOLCIITUDES GUARDADAS
//LISTASOLICITUDCOMPRA.HTML=========================================


//FUNCION PARA PODER TRAER LAS SOLICITUDES DE COMPRAS
async function cargarSolicitudes() {
    const contenedor = document.getElementById('contenedorSolicitudes'); // CORREGIDO
    contenedor.innerHTML = "<p>Cargando Solicitudesss...</p>";

    //OBTENER EL ROL DEL USUARIO DESDE LOCALSTORAGE
    const useRole = localStorage.getItem("role");

    //VERIFICAR SI HAY UN USUARIO DESDE LOCALSTORAGE
    const token = localStorage.getItem("token");
    if(!token){
        window.location.href = "/html/index.html";
        return;
    }


    try {
        const res = await fetch('/api/routeListaSolicitudCompra/solicitudes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if(res.status === 401){
            //TOKEN INVALIDO O EXPIRADO 
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/html/index.html";
            return;
        }

        const solicitudes = await res.json();

        if (solicitudes.length == 0) {
            contenedor.innerHTML = "<p>No hay solicitudes registradas</p>";
            return;
        }

        contenedor.innerHTML = solicitudes.map(s => {
            const personalHTML = s.personal.map(p =>
                `<li>${p.nombre} ${p.aPaterno} ${p.aMaterno}</li>`
            ).join('');
            const conceptoActivoHTML = s.conceptoActivo.map(f =>
                `<li> Familia: ${f.sc_cca_familia} - Sub Familia: ${f.sc_cca_subFamilia} - Concepto: ${f.sc_cca_descripcion}</li>`
            ).join('');
            const proveedorHTML = s.proveedores.map(j =>
                `<li>Razon Social:${j.razonSocial} - NickName: ${j.nickname} - Costo:${j.sc_monto}</li>`
            ).join('');


            let botonesHTML = '';
            if(useRole === "Administrador"){
                botonesHTML = `
                    <button class=" btn-accion btn-autorizar" onclick="autorizarSolicitud(${s.id})">Autorizar</button>
                    <button onclick="editarSolicitud(${s.id})" class="btn-accion btn-editar">Editar</button>
                    <button onclick="eliminarSolicitud(${s.id})" class="btn-accion btn-eliminar">Eliminar</button>`
            }else if(useRole === "Gerente General"){
                    if(s.estatusCompras === "Proceso"){
                        botonesHTML = `
                        <button onclick="editarSolicitud(${s.id})" class="btn-accion btn-editar">Editar</button>
                        <button class="btn-accion btn-autorizar" onclick="autorizarSolicitud(${s.id})" class="btn-accion btn-eliminar">Autorizar</button>`;
                    }else{
                        botonesHTML = `
                        <button onclick="editarSolicitud(${s.id})" class="btn-accion btn-editar">Editar</button>`;
                    }
            }else if(useRole === "Jefe de Activos" && s.estatusCompras === "Pendiente"){
                botonesHTML = `
                    <button onclick="editarSolicitud(${s.id})" class="btn-accion btn-editar">Editar</button>
                    <button onclick="eliminarSolicitud(${s.id})" class="btn-accion btn-eliminar">Eliminar</button>`;
            }                

            return `

            <div class="concepto-card">
                <div class="concepto-header">
                    <h3 class="concepto-titulo">Solicitud Compra #${s.id}</h3>
                    <span class="concepto-estatus estatus-${s.estatusCompras}">${s.estatusCompras}</span>
                </div>
                <div class="concepto-body">
                    <p><strong>Clasificacion:</strong> ${s.clasificacionCompras}<p>
                    <p><strong>Fecha de Creacion:</strong>${new Date(s.fechaCreacion).toLocaleDateString()}</p>
                    ${s.fechaAutorizacion ? `<p>Fecha Autorizacion: ${new Date.UTC(s.fechaAutorizacion).toLocaleDateString()}</p>`: ''}
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
                        ${s.fechaAutorizacion ? `<p>Fecha Autorizacion: ${new Date.UTC(s.fechaAutorizacion).toLocaleDateString()}</p>`: ''}
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

    } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        contenedor.innerHTML = "<p>Error al cargar solicitudes</p>";
    }
}

async function autorizarSolicitud(id) {
    if(!confirm(`¿Seguro que deseas autorizar la solicitud #${id}?`)) return;

    try{
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}/autorizar`, {
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
        }else{
            alert(result.message || "Error al autorizar la solicitud");
        }
    }catch(e){
        console.error(e);
        alert("Error al autorizar la solicitud");
    }
}

//FUNCION PARA ELIMINAR 
async function eliminarSolicitud(id) {
    if(!confirm(`¿Seguro que deseas eliminar la solicitud #${id}?`)) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'}
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            // Eliminar del DOM
            const elem = document.getElementById(`solicitud-${id}`);
            if(elem) elem.remove();
            cargarSolicitudes();
        } else {
            alert(result.message);
        }
    } catch(error){
        console.error(error);
        alert("Error al eliminar la solicitud");
    }
}


//FUNCION PARA EDITAR 
function editarSolicitud(id){
    window.location.href = `/html/editarSolicitudes.html?id=${id}`;
}

//CARGAR AL PRINCIPIO DE LA PAGINA
document.addEventListener('DOMContentLoaded', function(){
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token || !role){
        window.location.href = "/html/index.html";
        return;
    }

    //VERIFICAR QUE EL ROL SI TENGA ACCESO A ESTA PAGINA
    const rolesPermitidos = ["Administrador", "Gerente General", "Jefe de Activos"];
    if(!rolesPermitidos.includes(role)){
        alert("No tienes permiso para acceder a esta pagina");
        window.location.href = "/html/index.html";
        return;
    }

    cargarSolicitudes();
});

function verSolicitud(id){
    window.location.href = `/html/editarSolicitudes.html?id=${id}`;
}

