//FUNCION DE LISTADO DE SUB FAMILIAS
//listaSubFamilia.html

async function cargarSubFamilia() {
    const contenedor = document.getElementById("contenedorSubFamilia");
    contenedor.innerHTML = "<p>Cargando</p>"

    try{
        const res = await fetch("/api/routeListaSubFamilia/listaSubFamilia");
        const subFamilia = await res.json();

        if(subFamilia.length === 0) {
            contenedor.innerHTML = "<p>No hay familias Registradas</p>"
            return;
        }

        contenedor.innerHTML = subFamilia.map(u => {
            //SI EL ESTATUS ES CANCELADO, NO MOSTRAMOS LOS BOTONES
            const esCancelado = u.estatus && u.estatus.toLowerCase() === 'cancelado';
            const botones = esCancelado
            ? ""
            :`
                <button typeof="button" onClick="editarSubFamilia(${u.id})" class="btn-accion btn-editar">Editar</button>
                <button typeof="button" onClick="eliminarSubFamilia(${u.id})" class="btn-accion btn-eliminar">Eliminar</button>
            `;

            const claseCancelado = esCancelado ? "cancelado" : "";


            return(
            `
            <div className="solicitud ${claseCancelado}">
            <div class="concepto-card">
                <div class="concepto-header">
                    <h3 class="concepto-titulo">Sub Familia #${u.id}</h3>
                    <span class="concepto-estatus estatus-${u.estatus}">${u.estatus}</span>
                </div>
                <div class="concepto-body">
                    <p><strong>Familia:</strong> ${u.conceptoFamilia}</p>
                    <p><strong>Sub Familia:</strong> ${u.conceptoSubFamilia}</p>
                </div>
                <div class="concepto-meta">
                    <div class="concepto-fecha">
                        <span>📅</span>
                        <span>12/11/25</span>
                    </div>
                    <div class="concepto-acciones">
                        <div className="acciones">${botones}</div>
                    </div>
                </div>
            </div>
            </div>
            <br>
            `
            )
        }).join("");
    }catch(error){
        console.error("Hubo un error al encontrar los conceptos");
    }
}

function editarSubFamilia(id) {
    window.location.href = `/html/conceptoSubFamilia.html?id=${id}`;
}

async function eliminarSubFamilia(id) {
    if(!confirm(`¿Seguro que deseas eliminar la solicitud #${id}?`)) return;

    try{
        const estatus = document.getElementById("estatus");
        const listaFamilia = document.getElementById("listaFamilia");
        const conceptoSubFamilia = document.getElementById("conceptoSubFamilia");

        data = {
            estatus,
            listaFamilia,
            conceptoSubFamilia
        }

        const res = await fetch(`/api/routeListaSubFamilia/listaSubFamiliaEliminacion/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
        }
    }catch{
        console.error("hubo un error al eliminar la sub familia");

    }
}
document.addEventListener("DOMContentLoaded", cargarSubFamilia);