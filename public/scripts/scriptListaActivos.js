let todosLosActivos = [];

async function cargarActivos(){
    const contenedor = document.getElementById("contenedorActivo");
    contenedor.innerHTML = `<p>Cargando..</p>`

    console.log("Cargando activos...");

    try{
        const res = await fetch("/api/routeListaActivos/traerActivos");

        if(!res.ok){
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        //MANEJAR DIFERENTES ESTRUCTURAS DE RESPUESTA
        if(Array.isArray(data)){
            todosLosActivos = data;
        }else if (data.data && Array.isArray(data.data)){
            todosLosActivos = data.data;
        }else {
            console.error("Estructura de respuesta no reconocida: ", data);
            todosLosActivos = [];
        }
        console.log("Activos cargados: ", todosLosActivos);
        if(todosLosActivos.length === 0){
            contenedor.innerHTML = `<p>No hay Conceptos de Activos registrados</p>`;
            return;
        }
        cargarOpcionesFiltro();

        mostrarActivos(todosLosActivos);
    }catch(e){
        console.error("Hubo un error al encontrar los conceptos");
    }
}

function cargarOpcionesFiltro(){
    const familiasUnicas = [ ...new Set(todosLosActivos.map(a => a.conceptoFamilia))].filter(Boolean);
    const filtroFamilia = document.getElementById("filtroFamilia");
    filtroFamilia.innerHTML = '<option value="">Todas las Familias</option>';

    familiasUnicas.forEach(familia => {
        const option = document.createElement("option");
        option.value = familia;
        option.textContent = familia;
        filtroFamilia.appendChild(option);
    });

    const subFamiliasUnicas = [...new Set(todosLosActivos.map(a => a.conceptoSubFamilia))].filter(Boolean);
    const filtroSubFamilia = document.getElementById("filtroSubFamilia");
    filtroSubFamilia.innerHTML = '<option value="">Todas las Sub Familias</option>';

    subFamiliasUnicas.forEach(subFamilia => {
        const option = document.createElement("option");
        option.value = subFamilia;
        option.textContent = subFamilia;
        filtroSubFamilia.appendChild(option);
    });
}

function mostrarActivos(activos){
    const contenedor = document.getElementById("contenedorActivo");

    if(activos.length === 0){
        contenedor.innerHTML = `<p>No se encontraron activos con los filtros aplicados</p>`;
        return;
    }

    console.log("Mostrando activos: ", activos);

    contenedor.innerHTML = activos.map(u => {
        const esCancelado = u.estatus && u.estatus.toLowerCase() === 'cancelado';
            const botones = esCancelado
            ? ""
            :
            `<button type="button" onclick="editarActivos(${u.id})" class="btn-accion btn-editar">Editar</button>
            <button type="button" onclick="eliminarActivos(${u.id})" class="btn-accion btn-eliminar">Eliminar</button>`;

            const claseCancelado = esCancelado ? "cancelado" : "";

            const estatusDisplay = u.estatus ? u.estatus.charAt(0).toUpperCase() + u.estatus.slice(1) : 'Sin estatus';

            return `
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
                </div>
            `
    }).join("");
}

function filtrarActivos() {
    const filtroEstatus = document.getElementById("filtroEstatus").value;
    const filtroFamilia = document.getElementById("filtroFamilia").value;
    const filtroSubFamilia = document.getElementById("filtroSubFamilia").value;

    console.log("Aplicando filtros - Estatus: ", filtroEstatus, "Familia: ", filtroFamilia, "SubFamilia: ", filtroSubFamilia);

    let activosFiltrados = todosLosActivos;

    if(filtroEstatus !== ""){
        activosFiltrados = activosFiltrados.filter(activo => 
            activo.estatus && activo.estatus.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    if(filtroFamilia !== ""){
        activosFiltrados = activosFiltrados.filter(activo =>
            activo.conceptoFamilia === filtroFamilia
        );
    }

    if(filtroSubFamilia !== ""){
        activosFiltrados = activosFiltrados.filter(activo =>
            activo.conceptoSubFamilia === filtroSubFamilia
        );
    }

    console.log("Resultado del filtro: ", activosFiltrados);
    mostrarActivos(activosFiltrados);
}

function buscarActivos() {
    const busquedaInput = document.getElementById('busquedaInput');
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroFamilia = document.getElementById('filtroFamilia').value;
    const filtroSubFamilia = document.getElementById('filtroSubFamilia').value;

    let activosFiltrados = todosLosActivos;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda) {
        activosFiltrados = activosFiltrados.filter(activo =>
            (activo.conceptoActivos && activo.conceptoActivos.toLowerCase().includes(terminoBusqueda)) ||
            (activo.conceptoFamilia && activo.conceptoFamilia.toLowerCase().includes(terminoBusqueda)) ||
            (activo.conceptoSubFamilia && activo.conceptoSubFamilia.toLowerCase().includes(terminoBusqueda))
        );
    }

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        activosFiltrados = activosFiltrados.filter(activo => 
            activo.estatus && activo.estatus.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    // Aplicar filtro de familia
    if (filtroFamilia !== "") {
        activosFiltrados = activosFiltrados.filter(activo => 
            activo.conceptoFamilia === filtroFamilia
        );
    }

    // Aplicar filtro de subfamilia
    if (filtroSubFamilia !== "") {
        activosFiltrados = activosFiltrados.filter(activo => 
            activo.conceptoSubFamilia === filtroSubFamilia
        );
    }

    mostrarActivos(activosFiltrados);
}

function editarActivos(id){
    window.location.href = `/html/conceptoActivos.html?id=${id}`;
}

async function eliminarActivos(id){
    if(!confirm(`Seguro que desea eliminar la solicitud #${id}`)) return;

    try{
        const res = await fetch(`/api/routeListaActivos/listaActivosEliminacion/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            cargarActivos();
        }else{
            alert(`Error: ${result.message}`);
        }
    }catch(e){
        console.error("Hubo un error al eliminar la sub familia");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const busquedaInput = document.getElementById("busquedaInput");
    if(busquedaInput){
        busquedaInput.addEventListener("keyup", function(event){
            if(event.key === "Enter"){
                buscarActivos();
            }
        });
    }

    cargarActivos();
});