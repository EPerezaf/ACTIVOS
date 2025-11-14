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

        contenedor.innerHTML = familias.map(u => {
            const esCancelado = u.estatus && u.estatus.toLowerCase() === 'cancelado';
            const botones = esCancelado
            ? ""
            : 
            `<button type="button" onclick="editarFamilia(${u.id})" class="btn-accion btn-editar">Editar</button>
            <button type="button" onclick="eliminarFamilia(${u.id})" class="btn-accion btn-eliminar">Borrar</button>`
            
            const claseCancelado = esCancelado ? "cancelado" : "";

            
            
            return(`
            <div classname="solicitud ${claseCancelado}">
                <div class="concepto-card">
                    <div class="concepto-header">
                        <h3 class="concepto-titulo">Familia: #${u.id}</h3>
                        <span class="concepto-estatus estatus-${u.estatus}">${u.estatus}</span>
                    </div>
                    <div class="concepto-body">
                        <p><strong>Familia:</strong> ${u.concepto}</p>
                    </div>
                    <div class="concepto-meta">
                        <div class="concepto-fecha">
                            <span></span>
                            <span></span>
                        </div>
                        <div class="concepto-acciones">
                            <div class="concepto-acciones">
                                <div>${botones}</div>
                        </div>
                    </div>
                </div>
            </div>
            <br>
            `)
        }).join("");

    }catch (error) {
        console.error("Hubo un error en encontrar las familias");
        return `<p>Hubo un error</p>`
    }
}

function editarFamilia(id) {
    window.location.href = `/html/conceptoFamiliaActivos.html?id=${id}`;   
}

document.addEventListener("DOMContentLoaded", cargarFamilias);