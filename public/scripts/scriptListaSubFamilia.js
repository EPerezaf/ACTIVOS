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
                <button typeof="button" onClick="editarSubFamilia(${u.id})">Editar</button>
                <button typeof="button" onClick="eliminarSubFamilia(${u.id})">Eliminar</button>
            `;

            const claseCancelado = esCancelado ? "cancelado" : "";


            return(
            `<div className="solicitud ${claseCancelado}">
                <h2>Sub Familia #${u.id}</h2>
                <p><strong>Estatus: </strong>${u.estatus}</p>
                <p><strong>Familia: </strong>${u.conceptoFamilia}</p>
                <p><strong>Sub Familia: </strong>${u.conceptoSubFamilia}</p>
                <div className="acciones">${botones}</div>
            </div>`
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