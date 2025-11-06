//FUNCION PARA MOSTRAR LAS FAMILIAS GUARDADAS
//LISTAFAMILIA.HTML

async function cargarFamilias() {
    const contenedor = document.getElementById("contenedorFamilias");
    contenedor.innerHTML = "<p>Cargando</p>";

    try{
        const res = await fetch('/api/routeListaFamilia/listaFamilia');
        const familias = await res.json();

        if(familias.length === 0) {
            contenedor.innerHTML= "<p>No hay Familias Registradas</p>";
            return;
        }

        contenedor.innerHTML = familias.map(u => 
            `<div class="solicitud">
                <h2>Familia #${u.id}</h2>
                <p>Estatus: ${u.estatus}</p>
                <p>Familia: ${u.concepto}</p>
                <div class="acciones">
                    <button type="button" onclick="editarFamilia(${u.id})">Editar</button>
                    <button type="button" onclick="eliminarFamilia(${u.id})">Borrar</button>
                </div>
                
            </div>`
        ).join("");

    }catch (error) {
        console.error("Hubo un error en encontrar las familias");
        return `<p>Hubo un error</p>`
    }
}

function editarFamilia(id) {
    window.location.href = `/html/conceptoFamiliaActivos.html?id=${id}`;   
}

document.addEventListener("DOMContentLoaded", cargarFamilias);