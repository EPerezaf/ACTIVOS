async function cargarActivos() {
    const contenedor = document.getElementById("contenedorActivos");
    contenedor.innerHTML = "";

    try{
        const res = await fetch("/api/routeRegistroActivo/traerActivo");
        const activo = await res.json();

        if(activo.length === 0){
            contenedor.innerHTML = "<p>No hay Activos registrados</p>";
            return;
        }

        contenedor.innerHTML = activo.map(u => {
            const esCancelado = u.estatus && u.estatus.toLowerCase() === 'cancelado';
            const botones = esCancelado
            ? ""
            : `
                <button typeof="button" onclick="editarActivo(${u.id})" class="btn-accion btn-editar">Editar</button>
                <button typeof="button" onclick="eliminarActivo(${u.id})" class="btn-accion btn-eliminar">Eliminar</button>
            `;

            const claseCancelado = esCancelado ? "cancelado" : "";
            return(
                `
                    <div classname="solicitud ${claseCancelado}">
                        <div class="concepto-card">
                            <div class="concepto-header">
                                <h3 class="concepto-titulo">Activo #${u.id}</h3> 
                                <span class="concepto-estatus estatus-${u.estatus}">${u.estatus}</span>
                            </div>
                            <div class="concepto-body">
                                <p><strong>Familia:</strong>${u.familia}</p>
                                <p><strong>Sub Familia</strong>${u.subfamilia}</p>
                                <p><strong>Concepto Activo:</strong>${u.conceptoActivo}</p>
                                <p><strong>Nomenclatura:</strong>${u.nomenclatura}</p>
                                <p><strong>Marca:</strong>${u.marca}</p>
                                <p><strong>Modelo:</strong>${u.modelo}</p>
                                <p><strong>Descripcion Adicional</strong>${u.descripcionAdicional}</p>
                                <p><strong>Costo:</strong>${u.costo}</p>
                                <p><strong>Numero de Serie:</strong>${u.numSerie}</p>
                                <p><strong>ID Solicitud:</strong>${u.idSolicitud}</p>
                            </div>
                            <div class="concepto-meta">
                                <div class="concepto-fecha">
                                    <span>📅</span>
                                    <span>${u.fechaRegistro}</span>
                                </div>
                                <div class="concepto-acciones">
                                    <div>${botones}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br>
                    <br>
                `
            )
        }).join("");
    }catch(error){
        console.error("Hubo un error al encontrar los activos");
    }
}
function editarActivo(id){
    window.location.href = `/html/editarRegistroActivo.html?id=${id}`;
}

async function eliminarActivo(id) {
    if(!confirm(`¿Seguro que deseas eliminar la solicitud #${id}`)) return;

    try{
        const res = await fetch(`/api/routeRegistroActivo/listaRegistroActivoEliminacion/${id}`,{
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            window.location.reload();
        }
    }catch(error){
        console.error("Hubo un error al eliminar el Activo");
    }
}

document.addEventListener("DOMContentLoaded", cargarActivos);