// FUNCION PARA MOSTRAR LAS SUB FAMILIAS GUARDADAS
let todasLasSubFamilias = [];
let todasLasFamilias = [];

async function cargarSubFamilias() {
    const contenedor = document.getElementById("contenedorSubFamilia");
    contenedor.innerHTML = "<p>Cargando...</p>";

    try {
        // Cargar subfamilias
        const resSubFamilias = await fetch('/api/routeListaSubFamilia/listaSubFamilia');
        
        if (!resSubFamilias.ok) {
            throw new Error(`Error ${resSubFamilias.status}: ${resSubFamilias.statusText}`);
        }
        
        const dataSubFamilias = await resSubFamilias.json();
        
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(dataSubFamilias)) {
            todasLasSubFamilias = dataSubFamilias;
        } else if (dataSubFamilias.data && Array.isArray(dataSubFamilias.data)) {
            todasLasSubFamilias = dataSubFamilias.data;
        } else {
            console.error("Estructura de respuesta no reconocida:", dataSubFamilias);
            todasLasSubFamilias = [];
        }

        console.log("SubFamilias cargadas:", todasLasSubFamilias);

        // Cargar familias para el filtro
        await cargarFamiliasParaFiltro();

        if (todasLasSubFamilias.length === 0) {
            contenedor.innerHTML = "<p>No hay Sub Familias Registradas</p>";
            return;
        }

        mostrarSubFamilias(todasLasSubFamilias);

    } catch (error) {
        console.error("Error al cargar subfamilias:", error);
        contenedor.innerHTML = "<p>Error al cargar las subfamilias. Verifica la consola.</p>";
    }
}

async function cargarFamiliasParaFiltro() {
    try {
        const resFamilias = await fetch('/api/routeSubFamilia/traerFamilia');
        
        if (!resFamilias.ok) {
            throw new Error(`Error ${resFamilias.status}: ${resFamilias.statusText}`);
        }
        
        const dataFamilias = await resFamilias.json();
        
        if (Array.isArray(dataFamilias)) {
            todasLasFamilias = dataFamilias;
        } else if (dataFamilias.data && Array.isArray(dataFamilias.data)) {
            todasLasFamilias = dataFamilias.data;
        } else {
            todasLasFamilias = [];
        }

        // Llenar el select de filtro de familias
        const filtroFamilia = document.getElementById('filtroFamilia');
        filtroFamilia.innerHTML = '<option value="">Todas las familias</option>';
        
        // Obtener familias únicas
        const familiasUnicas = [...new Set(todasLasSubFamilias.map(sf => sf.conceptoFamilia))].filter(Boolean);
        
        familiasUnicas.forEach(familia => {
            const option = document.createElement('option');
            option.value = familia;
            option.textContent = familia;
            filtroFamilia.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar familias para filtro:", error);
    }
}

function mostrarSubFamilias(subFamilias) {
    const contenedor = document.getElementById("contenedorSubFamilia");

    if (subFamilias.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron subfamilias con los filtros aplicados</p>";
        return;
    }

    contenedor.innerHTML = subFamilias.map(sf => {
        const id = sf.id || 'N/A';
        const estatus = sf.estatus || 'Sin estatus';
        const conceptoFamilia = sf.conceptoFamilia || 'Sin familia';
        const conceptoSubFamilia = sf.conceptoSubFamilia || 'Sin concepto';
        
        // Mostrar el estatus con la primera letra en mayúscula para mejor apariencia
        const estatusDisplay = estatus.charAt(0).toUpperCase() + estatus.slice(1);
        
        const esCancelado = estatus.toLowerCase() === 'cancelado';
        const botones = esCancelado ? "" : 
            `<button type="button" onclick="editarSubFamilia(${id})" class="btn-accion btn-editar">Editar</button>
             <button type="button" onclick="eliminarSubFamilia(${id})" class="btn-accion btn-eliminar">Borrar</button>`;
        
        const claseCancelado = esCancelado ? "cancelado" : "";

        return `
        <div class="solicitud ${claseCancelado}">
            <div class="concepto-card">
                <div class="concepto-header">
                    <h3 class="concepto-titulo">Sub Familia: #${id}</h3>
                    <span class="concepto-estatus estatus-${estatus.toLowerCase()}">${estatusDisplay}</span>
                </div>
                <div class="concepto-body">
                    <p><strong>Familia:</strong> ${conceptoFamilia}</p>
                    <p><strong>Sub Familia:</strong> ${conceptoSubFamilia}</p>
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

function filtrarSubFamilias() {
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroFamilia = document.getElementById('filtroFamilia').value;
    
    console.log("Aplicando filtros - Estatus:", filtroEstatus, "Familia:", filtroFamilia);

    let subFamiliasFiltradas = todasLasSubFamilias;

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        subFamiliasFiltradas = subFamiliasFiltradas.filter(sf => 
            sf.estatus.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    // Aplicar filtro de familia
    if (filtroFamilia !== "") {
        subFamiliasFiltradas = subFamiliasFiltradas.filter(sf => 
            sf.conceptoFamilia === filtroFamilia
        );
    }

    console.log("Resultado del filtro:", subFamiliasFiltradas);
    mostrarSubFamilias(subFamiliasFiltradas);
}

function buscarSubFamilias() {
    const busquedaInput = document.getElementById('busquedaInput');
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroFamilia = document.getElementById('filtroFamilia').value;

    let subFamiliasFiltradas = todasLasSubFamilias;

    // Aplicar filtro de búsqueda por conceptoSubFamilia
    if (terminoBusqueda) {
        subFamiliasFiltradas = subFamiliasFiltradas.filter(sf =>
            (sf.conceptoSubFamilia && sf.conceptoSubFamilia.toLowerCase().includes(terminoBusqueda)) ||
            (sf.conceptoFamilia && sf.conceptoFamilia.toLowerCase().includes(terminoBusqueda))
        );
    }

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        subFamiliasFiltradas = subFamiliasFiltradas.filter(sf => 
            sf.estatus.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    // Aplicar filtro de familia
    if (filtroFamilia !== "") {
        subFamiliasFiltradas = subFamiliasFiltradas.filter(sf => 
            sf.conceptoFamilia === filtroFamilia
        );
    }

    mostrarSubFamilias(subFamiliasFiltradas);
}

function editarSubFamilia(id) {
    window.location.href = `/html/conceptoSubFamilia.html?id=${id}`;   
}

async function eliminarSubFamilia(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta subfamilia?')) {
        return;
    }
    
    try {
        const res = await fetch(`/api/routeListaSubFamilia/listaSubFamiliaEliminacion/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await res.json();
        
        if (res.ok) {
            alert(`Sub Familia Eliminada: ${result.message}`);
            // Recargar las subfamilias
            cargarSubFamilias();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error al eliminar la subfamilia:", error);
        alert("Error al eliminar la subfamilia");
    }
}

// Permitir búsqueda con Enter
document.addEventListener('DOMContentLoaded', function() {
    const busquedaInput = document.getElementById('busquedaInput');
    if (busquedaInput) {
        busquedaInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                buscarSubFamilias();
            }
        });
    }
    
    cargarSubFamilias();
});