async function cargarActivos(){
    const contenedor = document.getElementById("contenedorActivo");
    contenedor.innerHTML = `<p>Cargando..</p>`

    console.log("Entrando al try");

    try{
        const res = await fetch("/api/routeListaActivos/traerActivos");
        const activos = await res.json();

        console.log("datos obtenenidos");

        if(activos.length === 0){
            contenedor.innerHTML = `<p>No hay Conceptos de Activos registradas</p>`
            return;
        }
        console.log("Iniciando mapeo");
        console.log("Dtos: ",activos);
        contenedor.innerHTML = activos.map(u => {

            const esCancelado = u.estatus && u.estatus.toLowerCase() === 'cancelado';
            const botones = esCancelado
            ? ""
            :
            `<button type="button" onclick="editarActivos(${u.id})" class="btn-accion btn-editar">Editar</button>
            <button type="button" onclick="eliminarActivos(${u.id})" class="btn-accion btn-eliminar">Eliminar</button>`;

            const claseCancelado = esCancelado ? "cancelado" : "";

            return(
                `
                <div classname="solicitud ${claseCancelado}">
                    <div class="concepto-card">
                        <div class="concepto-header">
                            <h3 class="concepto-titulo">Concepto Activos #${u.id}</h3>
                            <span class="concepto-estatus estatus-${u.estatus}">${u.estatus}</span>
                        </div>
                        <div class="concepto-body">
                            <p><strong>Familia:</strong>${u.conceptoFamilia}</p>
                            <p><strong>Sub Familia:</strong>${u.conceptoSubFamilia}</p>
                            <p><strong>Concepto:</strong>${u.conceptoActivos}</p>
                        </div>
                        <di class="concepto-meta">
                            <div class="concepto-fecha">
                                <span>📅</span>
                                <span>12-11-25</span>
                            </div>
                            <div class="concepto-acciones">
                                <div">${botones}</div>
                            </div>
                        </div>
                    </div>
                </div>`
            )
            
            
        }).join("");
    }catch(e){
        console.error("Hubo un error al encontrar los conceptos");
    }
}
document.addEventListener("DOMContentLoaded", cargarActivos);

function editarActivos(id){
    window.location.href = `/html/conceptoActivos.html?id=${id}`;
}

async function eliminarActivos(id){
    if(!confirm(`Seguro que desea eliminar la solicitud #${id}`)) return;

    try{
        const estatus = document.getElementById("estatusConceptoActivos");
        const listaFamilia = document.getElementById("listaFamilia");
        const listaSubFamilia = document.getElementById("listaSubFamilia");
        const conceptoActivos = document.getElementById("conceptoActivos");

        data = {
            estatus,
            listaFamilia,
            listaSubFamilia,
            conceptoActivos
        }

        const res = await fetch(`/api/routeListaActivos/listaActivosEliminacion/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
        }
    }catch(e){
        console.error("Hubo un error al eliminar la sub familia");
    }
}