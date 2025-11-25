// FUNCION PARA MOSTRAR EL PERSONAL GUARDADO
let todoElPersonal = [];

async function cargarPersonal() {
    const contenedor = document.getElementById("contenedorPersonal");
    contenedor.innerHTML = `<p>Cargando...</p>`;

    try{
        const res = await fetch(`/api/routeListaPersonal/traerPersonal`);
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(data)) {
            todoElPersonal = data;
        } else if (data.data && Array.isArray(data.data)) {
            todoElPersonal = data.data;
        } else {
            console.error("Estructura de respuesta no reconocida:", data);
            todoElPersonal = [];
        }

        console.log("Personal cargado:", todoElPersonal);

        if (todoElPersonal.length === 0) {
            contenedor.innerHTML = `<p>No hay Personal registrado</p>`;
            return;
        }

        // Cargar opciones de filtro
        cargarOpcionesFiltro();

        mostrarPersonal(todoElPersonal);
    }catch(e){
        console.error("Hubo un error al encontrar el personal");
        contenedor.innerHTML = `<p>Error al cargar el personal. Verifica la consola.</p>`;
    }
}

function editarPersonal(id){
    window.location.href = `/html/personal.html?id=${id}`;
}

async function eliminarPersonal(id) {
    if(!confirm(`Seguro que desea eliminar la solicitud #${id}`)) return;
    try{

        const res = await fetch(`/api/routeListaPersonal/listaPersonalEliminacion/${id}`, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            cargarPersonal();
        }
    }catch(e){
        console.error("Hubo un error al eliminar la sub Familia");
    }
}

function cargarOpcionesFiltro() {
    // Cargar estados únicos
    const estadosUnicos = [...new Set(todoElPersonal.map(p => p.p_estado))].filter(Boolean);
    const filtroEstado = document.getElementById('filtroEstado');
    filtroEstado.innerHTML = '<option value="">Todos los estados</option>';
    
    estadosUnicos.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        filtroEstado.appendChild(option);
    });

    // Cargar ciudades únicas
    const ciudadesUnicas = [...new Set(todoElPersonal.map(p => p.p_ciudad))].filter(Boolean);
    const filtroCiudad = document.getElementById('filtroCiudad');
    filtroCiudad.innerHTML = '<option value="">Todas las ciudades</option>';
    
    ciudadesUnicas.forEach(ciudad => {
        const option = document.createElement('option');
        option.value = ciudad;
        option.textContent = ciudad;
        filtroCiudad.appendChild(option);
    });
}

function mostrarPersonal(personal) {
    const contenedor = document.getElementById("contenedorPersonal");

    if (personal.length === 0) {
        contenedor.innerHTML = `<p>No se encontró personal con los filtros aplicados</p>`;
        return;
    }

    contenedor.innerHTML = personal.map(u => {
        const esCancelado = u.estatusPersonal && u.estatusPersonal.toLowerCase() === 'cancelado';
        const botones = esCancelado
            ? ""
            :
            `<button type="button" onclick="editarPersonal(${u.id})" class="btn-accion btn-editar">Editar</button>
            <button type="button" onclick="eliminarPersonal(${u.id})" class="btn-accion btn-eliminar">Eliminar</button>`;

        const claseCancelado = esCancelado ? "cancelado" : "";
        
        // Mostrar estatus con primera letra en mayúscula
        const estatusDisplay = u.estatusPersonal ? 
            u.estatusPersonal.charAt(0).toUpperCase() + u.estatusPersonal.slice(1) : 
            'Sin estatus';
        
        // Nombre completo
        const nombreCompleto = `${u.nombre || ''} ${u.aPaterno || ''} ${u.aMaterno || ''}`.trim();

        // CORRECCIÓN: Cambié classname por class
        return `
            <div class="solicitud ${claseCancelado}">
                <div class="concepto-card">
                    <div class="concepto-header">
                        <h3 class="concepto-titulo">Personal #${u.id} - ${nombreCompleto}</h3>
                        <span class="concepto-estatus estatus-${u.estatusPersonal}">${estatusDisplay}</span>
                    </div>
                    <div class="concepto-body">
                        <p><strong>Nombre completo:</strong> ${nombreCompleto}</p>
                        <p><strong>CURP:</strong> ${u.p_curp || 'No especificado'}</p>
                        <p><strong>Ubicación:</strong> ${u.p_ciudad || 'No especificado'}, ${u.p_estado || 'No especificado'}</p>
                        <p><strong>Edad:</strong> ${u.p_edad || 'No especificado'}</p>
                        <p><strong>Estatus:</strong> ${estatusDisplay}</p>
                    </div>
                    <div class="concepto-meta">
                        <div class="concepto-fecha">
                            <span>📅</span>
                            <span>${new Date().toLocaleDateString()}</span>
                        </div>
                        <div class="concepto-acciones">
                            ${botones}
                        </div>
                    </div>
                </div>
            </div>
            <br>`;
    }).join("");
}

function filtrarPersonal() {
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroCiudad = document.getElementById('filtroCiudad').value;
    
    console.log("Aplicando filtros - Estatus:", filtroEstatus, "Estado:", filtroEstado, "Ciudad:", filtroCiudad);

    let personalFiltrado = todoElPersonal;

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        personalFiltrado = personalFiltrado.filter(persona => 
            persona.estatusPersonal && persona.estatusPersonal.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    // Aplicar filtro de estado
    if (filtroEstado !== "") {
        personalFiltrado = personalFiltrado.filter(persona => 
            persona.p_estado === filtroEstado
        );
    }

    // Aplicar filtro de ciudad
    if (filtroCiudad !== "") {
        personalFiltrado = personalFiltrado.filter(persona => 
            persona.p_ciudad === filtroCiudad
        );
    }

    console.log("Resultado del filtro:", personalFiltrado);
    mostrarPersonal(personalFiltrado);
}

function buscarPersonal() {
    const busquedaInput = document.getElementById('busquedaInput');
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroCiudad = document.getElementById('filtroCiudad').value;

    let personalFiltrado = todoElPersonal;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda) {
        personalFiltrado = personalFiltrado.filter(persona =>
            (persona.nombre && persona.nombre.toLowerCase().includes(terminoBusqueda)) ||
            (persona.aPaterno && persona.aPaterno.toLowerCase().includes(terminoBusqueda)) ||
            (persona.aMaterno && persona.aMaterno.toLowerCase().includes(terminoBusqueda)) ||
            (persona.p_curp && persona.p_curp.toLowerCase().includes(terminoBusqueda)) ||
            (persona.p_ciudad && persona.p_ciudad.toLowerCase().includes(terminoBusqueda)) ||
            (persona.p_estado && persona.p_estado.toLowerCase().includes(terminoBusqueda))
        );
    }

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        personalFiltrado = personalFiltrado.filter(persona => 
            persona.estatusPersonal && persona.estatusPersonal.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    // Aplicar filtro de estado
    if (filtroEstado !== "") {
        personalFiltrado = personalFiltrado.filter(persona => 
            persona.p_estado === filtroEstado
        );
    }

    // Aplicar filtro de ciudad
    if (filtroCiudad !== "") {
        personalFiltrado = personalFiltrado.filter(persona => 
            persona.p_ciudad === filtroCiudad
        );
    }

    mostrarPersonal(personalFiltrado);
}

// Permitir búsqueda con Enter
document.addEventListener('DOMContentLoaded', function() {
    const busquedaInput = document.getElementById('busquedaInput');
    if (busquedaInput) {
        busquedaInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                buscarPersonal();
            }
        });
    }
    
    cargarPersonal();
});