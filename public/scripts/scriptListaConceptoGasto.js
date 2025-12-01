let todosLosConceptos = [];

async function cargarConceptos() {
    const contenedor = document.getElementById("contenedorConceptos");
    contenedor.innerHTML = "<p>Cargando Conceptos...</p>";

    try{
        const res = await fetch('/api/routeListaConceptoGasto/listaConcepto');
        if(!res.ok){
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const response = await res.json();

        if(Array.isArray(response)){
            todosLosConceptos = response;
        }else if(response.data && Array.isArray(response.data)){
            todosLosConceptos = response.data;
        }else if (response.success && Array.isArray(response)){
            todosLosConceptos = response;
        }else {
            console.error("Estructura de respuesta no reconocida: ", response);
            todosLosConceptos = [];
        }
        console.log("Conceptos cargados: ", todosLosConceptos);
        if(todosLosConceptos.length === 0){
            contenedor.innerHTML = "<p>No hay Conceptos Registrados</p>";
            return;
        }
        mostrarConceptosGasto(todosLosConceptos);
    }catch(error){
        console.error("Error al cargar Conceptos: ", error);
        contenedor.innerHTML = "<p>Error al cargar los Conceptos. Verifica la consola.</p>";
    }
}

function mostrarConceptosGasto(conceptos){
    const contenedor = document.getElementById("contenedorConceptos");
    if(conceptos.length === 0){
        contenedor.innerHTML ="<p>No se encontraron conceptos con los filtros aplicados</p>";
        return;
    }

    contenedor.innerHTML = conceptos.map(concepto => {
        const id = concepto.id || 'N/A';
        const estatus = concepto.estatus || 'Sin estatus';
        const conceptoGasto = concepto.conceptoGasto || 'Sin concepto';

        const esCancelado = estatus.toLowerCase() === 'cancelado';
        const botones = esCancelado ? "" :
            `<button type="button" onclick="editarConcepto(${id})" class="btn-accion btn-editar">Editar</button>
            <button type="button" onclick="eliminarConcepto(${id})" class="btn-accion btn-eliminar">Eliminar</button>`;

        const claseCancelado = esCancelado ? "cancelado" : "";

        return `
            <div class="solicitud ${claseCancelado}">
                <div class="concepto-card">
                    <div class="concepto-header">
                        <h3 class="concepto-titulo">Concepto: #${id}</h3>
                        <span class="concepto-estatus estatus-${estatus}">${estatus}</span>
                    </div>
                    <div class="concepto-body">
                        <p><strong>Concepto Gasto: </strong> ${conceptoGasto}</p>
                    </div>
                    <div class="concepto-meta">
                        <div class="concepto-acciones"> <!-- Corregido typo "cocnepto" -->
                            ${botones}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function filtrarConcepto(){
    const filtroEstatus = document.getElementById("filtroEstatus").value; // Nombre corregido
    console.log("Aplicando filtro:", filtroEstatus);
    console.log("Conceptos disponibles: ", todosLosConceptos);

    if(filtroEstatus === ""){
        mostrarConceptosGasto(todosLosConceptos);
    } else {
        const conceptosFiltrados = todosLosConceptos.filter(concepto => {
            if(!concepto || !concepto.estatus) return false;
            return concepto.estatus.toLowerCase() === filtroEstatus.toLowerCase();
        });
        console.log("Resultado del filtro: ", conceptosFiltrados);
        mostrarConceptosGasto(conceptosFiltrados);
    }
}

function buscarConcepto(){
    const busquedaInput = document.querySelector('.busqueda-input');
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    const filtroEstatus = document.getElementById("filtroEstatus").value;

    let conceptosFiltrados = todosLosConceptos;

    if(terminoBusqueda){
        conceptosFiltrados = conceptosFiltrados.filter(concepto =>
            concepto && 
            concepto.conceptoGasto && concepto.conceptoGasto.toLowerCase().includes(terminoBusqueda)
        );
    }
    if(filtroEstatus !== ""){
        conceptosFiltrados = conceptosFiltrados.filter(concepto =>
            concepto &&
            concepto.estatus && concepto.estatus.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }
    mostrarConceptosGasto(conceptosFiltrados);
}

function editarConcepto(id){
    window.location.href = `/html/conceptoGasto.html?id=${id}`;
}

async function eliminarConcepto(id){
    if(!confirm('¿Estás seguro de que deseas eliminar este concepto?')){
        return;
    }

    try{
        const res = await fetch(`/api/routeListaConceptoGasto/listaConcepto/${id}/cancelar`,{
            method: 'PUT',
            headers: {
                "Content-Type" : "application/json"
            }
        });

        const result = await res.json();
        if(res.ok){
            alert(`Concepto Eliminado: ${result.message}`);
            cargarConceptos();
        }else{
            alert(`Error: ${result.message}`);
        }
    }catch(error){
        console.log("Error al eliminar el concepto: ", error);
        alert("Error al eliminar el concepto");
    }
}

document.addEventListener("DOMContentLoaded", cargarConceptos);