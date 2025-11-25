// FUNCION PARA MOSTRAR LAS FAMILIAS GUARDADAS
let todasLasFamilias = [];

async function cargarFamilias() {
    const contenedor = document.getElementById("contenedorFamilias");
    contenedor.innerHTML = "<p>Cargando...</p>";

    try {
        const res = await fetch('/api/routeListaFamilia/listaFamilia');
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const response = await res.json();
        
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(response)) {
            todasLasFamilias = response;
        } else if (response.data && Array.isArray(response.data)) {
            todasLasFamilias = response.data;
        } else if (response.success && Array.isArray(response)) {
            todasLasFamilias = response;
        } else {
            console.error("Estructura de respuesta no reconocida:", response);
            todasLasFamilias = [];
        }

        console.log("Familias cargadas:", todasLasFamilias);

        if (todasLasFamilias.length === 0) {
            contenedor.innerHTML = "<p>No hay Familias Registradas</p>";
            return;
        }

        mostrarFamilias(todasLasFamilias);

    } catch (error) {
        console.error("Error al cargar familias:", error);
        contenedor.innerHTML = "<p>Error al cargar las familias. Verifica la consola.</p>";
    }
}

function mostrarFamilias(familias) {
    const contenedor = document.getElementById("contenedorFamilias");

    if (familias.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron familias con los filtros aplicados</p>";
        return;
    }

    contenedor.innerHTML = familias.map(familia => {
        // Asegurarnos de que los datos existen
        const id = familia.id || 'N/A';
        const estatus = familia.estatus || 'Sin estatus';
        const concepto = familia.concepto || 'Sin concepto';
        
        const esCancelado = estatus.toLowerCase() === 'cancelado';
        const botones = esCancelado ? "" : 
            `<button type="button" onclick="editarFamilia(${id})" class="btn-accion btn-editar">Editar</button>
             <button type="button" onclick="eliminarFamilia(${id})" class="btn-accion btn-eliminar">Borrar</button>`;
        
        const claseCancelado = esCancelado ? "cancelado" : "";

        return `
        <div class="solicitud ${claseCancelado}">
            <div class="concepto-card">
                <div class="concepto-header">
                    <h3 class="concepto-titulo">Familia: #${id}</h3>
                    <span class="concepto-estatus estatus-${estatus}">${estatus}</span>
                </div>
                <div class="concepto-body">
                    <p><strong>Familia:</strong> ${concepto}</p>
                </div>
                <div class="concepto-meta">
                    <div class="concepto-acciones">
                        ${botones}
                    </div>
                </div>
            </div>
        </div>
        <br>
        `;
    }).join("");
}

function filtrarFamilias() {
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    
    console.log("Aplicando filtro:", filtroEstatus);
    console.log("Familias disponibles:", todasLasFamilias);

    if (filtroEstatus === "") {
        mostrarFamilias(todasLasFamilias);
    } else {
        const familiasFiltradas = todasLasFamilias.filter(familia => {
            // Convertir ambos a minúsculas para comparación case-insensitive
            return familia.estatus.toLowerCase() === filtroEstatus.toLowerCase();
        });
        
        console.log("Resultado del filtro:", familiasFiltradas);
        mostrarFamilias(familiasFiltradas);
    }
}

function buscarFamilias() {
    const busquedaInput = document.querySelector('.busqueda-input');
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    const filtroEstatus = document.getElementById('filtroEstatus').value;

    let familiasFiltradas = todasLasFamilias;

    // Aplicar filtro de búsqueda por concepto
    if (terminoBusqueda) {
        familiasFiltradas = familiasFiltradas.filter(familia =>
            familia.concepto && familia.concepto.toLowerCase().includes(terminoBusqueda)
        );
    }

    // Aplicar filtro de estatus (con comparación case-insensitive)
    if (filtroEstatus !== "") {
        familiasFiltradas = familiasFiltradas.filter(familia => 
            familia.estatus.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    mostrarFamilias(familiasFiltradas);
}

function editarFamilia(id) {
    window.location.href = `/html/conceptoFamiliaActivos.html?id=${id}`;   
}

async function eliminarFamilia(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta familia?')) {
        return;
    }
    
    try {
        const res = await fetch(`/api/routeListaFamilia/eliminarFamilia/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await res.json();
        
        if (res.ok) {
            alert(`Familia Eliminada: ${result.message}`);
            // Recargar las familias
            cargarFamilias();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error al eliminar la familia:", error);
        alert("Error al eliminar la familia");
    }
}

document.addEventListener("DOMContentLoaded", cargarFamilias);