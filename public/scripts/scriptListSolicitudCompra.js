
//FUNCION PARA TRAER LAS SOLCIITUDES GUARDADAS
//LISTASOLICITUDCOMPRA.HTML=========================================

//FUNCION PARA PODER TRAER LAS SOLICITUDES DE COMPRAS
async function cargarSolicitudes() {
    const contenedor = document.getElementById('contenedorSolicitudes'); // CORREGIDO
    contenedor.innerHTML = "<p>Cargando Solicitudesss...</p>";

    try {
        const res = await fetch('/api/routeListaSolicitudCompra/solicitudes');
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

            return `
            <div class="solicitud">
                <h2>Solicitud #${s.id}</h2>
                <p>Estatus: ${s.estatusCompras}</p>
                <p>Clasificacion: ${s.clasificacionCompras}</p>
                <p>Fecha: ${new Date(s.fechaCreacion).toLocaleDateString()}</p>
                <p>Descripcion: ${s.descripcionConceptoCompra}</p>

                <div class="section">
                    <strong>Personal</strong>
                    <ul>${personalHTML}</ul>
                </div>

                <div class="section">
                    <strong>Concepto Compra</strong>
                    <ul>${conceptoActivoHTML}</ul>
                </div>

                <div class="section">
                    <strong>Proveedores</strong>
                    <ul>${proveedorHTML}</ul>
                </div>

                <div class="acciones">
                    <button id="editarSolcitud" onclick="editarSolicitud(${s.id})">Editar</button>
                    <button  onclick="eliminarSolicitud(${s.id})">Eliminar</button>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        contenedor.innerHTML = "<p>Error al cargar solicitudes</p>";
    }
}

//FUNCION PARA ELIMINAR 
async function eliminarSolicitud(id) {
    if(!confirm(`¿Seguro que deseas eliminar la solicitud #${id}?`)) return;

    try {
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}`, {
            method: 'DELETE'
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

/*
async function editarSolicitud(id) {
    const modal = document.getElementById("modalEditar");
    modal.style.display = "block";

    const resultadoEditar = document.getElementById("resultadoEditar");
    resultadoEditar.innerHTML =`<p>Editando la solicitdud: #${id}</p>`;

    const contenedorEditar = document.getElementById("contenedorEditar");

    try{
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudes/${id}`);

        if(!res.ok){
            contenedorEditar.innerHTML ="<p>No se encontro la solicitud</p>";
            return;
        }

        const solicitudEditar = await res.json();
        const personal = solicitudEditar.personal[0] || {};
        const conceptoActivo = solicitudEditar.conceptoActivo[0] || {};
        const proveedor = solicitudEditar.proveedores[0] || {};

        contenedorEditar.innerHTML = `
            <form id="formEditar">
                <label>Estatus:</label>
                <label id="editEstatus">${solicitudEditar.estatusCompras}</label>
                <br>
                <br>

                <button type="button" id="abrirBusqueda" class="btn-add" onclick="inicializarAplicacion()">Abrir Busqueda</button>

                <label>Clasificacion:</label>
                <input type="text" id="editClasificacion" value="${solicitudEditar.clasificacionCompras}">
                <br>

                <label>Descripcion:</label>
                <textarea id="editDescripcion">${solicitudEditar.descripcionConceptoCompra}</textarea>
                <br><br>

                <label>Nombre:</label>
                <input type="text" id="editNombre" value="${personal.nombre || ''}" readonly>
                <br>

                <label>Apellido Paterno:</label>
                <input type="text" id="editAPaterno" value="${personal.aPaterno || ''}">
                <br>

                <label>Apellido Materno:</label>
                <input type="text" id="editAMaterno" value="${personal.aMaterno || ''}">
                <br>

                <label>Comentario (personal):</label>
                <input type="text" id="editComentarioPersonal" value="${personal.comentario || ''}">
                <br><br>

                <label>Concepto (familia):</label>
                <input type="text" id="editConcepto" value="${conceptoActivo.sc_cca_familia || ''}">
                <br>

                <label>Comentario (familia):</label>
                <input type="text" id="editComentarioFamilia" value="${conceptoActivo.sc_cca_subFamilia || ''}">
                <br><br>

                <label>Comentario (familia):</label>
                <input type="text" id="editComentarioFamilia" value="${conceptoActivo.sc_cca_descripcion || ''}">
                <br><br>

                <label>Proveedor</label>
                <input type="text" id="editProveedor" value="${proveedor.razonSocial || ''}">
                <br><br>
                <label>Monto</label>
                <input type="text" id="editMonto" value="${proveedor.sc_monto || ''}">
                <br><br>

                <button type="button" onclick="guardarCambios(${id})">Guardar cambios</button>
            </from>
        `;
    }catch(error){
        console.error("ERROR: No se encontro la solicitud");
    }
}

async function guardarCambios(id) {
    const clasificacion = document.getElementById("editClasificacion").value.trim();
    const descripcion = document.getElementById("editDescripcion").value.trim();
    
    const data ={
        clasificacionCompras: clasificacion,
        descripcionConceptoCompra: descripcion
    };

    try{
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if(result.success) {
            alert(result.success);
            document.getElementById("modalEditar").style.display = "none";
            cargarSolicitudes();
        }else{
            alert(result.message);
        }

    }catch(error){
        console.error("Error al guardar los cambios:", error);
        alert("Error al cambiar el cambio");
    }
}
 //CERRAR MODAL 
document.addEventListener("DOMContentLoaded", () => {
        const modal = document.getElementById("modalEditar");
        const cerrarBtn = document.getElementById("cerrarModal");
        const closeSpan = document.querySelector(".close");

        cerrarBtn.addEventListener("click", () => cerrarModal(modal));
        closeSpan.addEventListener("click", () => cerrarModal(modal));
    })
*/


//CARGAR AL PRINCIPIO DE LA PAGINA
document.addEventListener('DOMContentLoaded', cargarSolicitudes);
