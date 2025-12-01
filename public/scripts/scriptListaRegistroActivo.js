let todasLosActivos = [];

async function cargarActivos() {
    const contenedor = document.getElementById("contenedorActivos");
    contenedor.innerHTML = "";

    try{
        const res = await fetch("/api/routeRegistroActivo/traerActivo");

        if(!res.ok){
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const response = await res.json();

         // Manejar diferentes estructuras de respuesta
        if (Array.isArray(response)) {
            todasLosActivos = response;
        } else if (response.data && Array.isArray(response.data)) {
            todasLosActivos = response.data;
        } else if (response.success && Array.isArray(response)) {
            todasLosActivos = response;
        } else {
            console.error("Estructura de respuesta no reconocida:", response);
            todasLosActivos = [];
        }

        console.log("Activos cargadas:", todasLosActivos);

        if (todasLosActivos.length === 0) {
            contenedor.innerHTML = "<p>No hay Familias Registradas</p>";
            return;
        }

        mostrarActivos(todasLosActivos);
    }catch(error){
        console.error("Hubo un error al encontrar los activos", error);
    }
}

function mostrarActivos(activos){
    const contenedor = document.getElementById("contenedorActivos");

    if(activos.length === 0){
        contenedor.innerHTML = "<p>No se encontraron activos con los filtros</p>";
        return;
    }

    contenedor.innerHTML = activos.map(activo => {
        const id = activo.id || 'N/A';
        const estatus = activo.estatus || 'Sin estatus';
        const familia = activo.familia;
        const subfamilia = activo.subfamilia;
        const conceptoActivo = activo.conceptoActivo;
        const nomenclatura = activo.nomenclatura;
        const marca = activo.marca;
        const modelo = activo.modelo;
        const descripcionAdicional = activo.descripcionAdicional;
        const numSerie = activo.numSerie;
        const idSolicitud = activo.idSolicitud;
        const fechaRegistro = activo.fechaRegistro;

        const esCancelado = estatus.toLowerCase()=== 'cancelado';
        const botones = esCancelado ? "":
            `
            <button typeof="button" onclick="editarActivo(${activo.id})" class="btn-accion btn-editar">Editar</button>
                <button typeof="button" onclick="eliminarActivo(${id})" class="btn-accion btn-eliminar">Eliminar</button>
            `;
            const claseCancelado = esCancelado ? "cancelado" : "";
            return`
                    <div classname="solicitud ${claseCancelado}">
                        <div class="concepto-card">
                            <div class="concepto-header">
                                <h3 class="concepto-titulo">Activo #${id}</h3> 
                                <span class="concepto-estatus estatus-${estatus}">${estatus}</span>
                            </div>
                            <div class="concepto-body">
                                <p><strong>Familia:</strong>${familia}</p>
                                <p><strong>Sub Familia</strong>${subfamilia}</p>
                                <p><strong>Concepto Activo:</strong>${conceptoActivo}</p>
                                <p><strong>Nomenclatura:</strong>${nomenclatura}</p>
                                <p><strong>Marca:</strong>${marca}</p>
                                <p><strong>Modelo:</strong>${modelo}</p>
                                <p><strong>Descripcion Adicional</strong>${descripcionAdicional}</p>
                                <p><strong>Costo:</strong>${activo.costo}</p>
                                <p><strong>Numero de Serie:</strong>${numSerie}</p>
                                <p><strong>ID Solicitud:</strong>${idSolicitud}</p>
                            </div>
                            <div class="concepto-meta">
                                <div class="concepto-fecha">
                                    <span>📅</span>
                                    <span>${fechaRegistro}</span>
                                </div>
                                <div class="concepto-acciones">
                                    <div>${botones}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br>
                    <br>
                `
    }).join("");
}

function editarActivo(id){
    window.location.href = `/html/editarRegistroActivo.html?id=${id}`;
}

async function eliminarActivo(id) {
    if(!confirm(`¿Seguro que deseas eliminar la solicitud #${id}`)) return;

    try{
        const res = await fetch(`/api/routeRegistroActivo/listaRegistroActivoEliminacion/${id}`,{
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            window.location.reload();
        }
    }catch(error){
        console.error("Hubo un error al eliminar el Activo");
    }
}

function filtrarActivos(){
    const filtroEstatus = document.getElementById("filtroEstatus").value;

    console.log("Aplicando filtro:", filtroEstatus);
    console.log("Activos disponibles: ", todasLosActivos);

    if(filtroEstatus === ""){
        mostrarActivos(todasLasFamilias);
    }else {
        const activosFiltradas = todasLosActivos.filter(activo =>{
            return activo.estatus.toLowerCase() === filtroEstatus.toLowerCase();
        });

        console.log("Resultado del filtro: ", activosFiltradas);
        mostrarActivos(activosFiltradas);
    }
}

function buscarActivos(){
    const busquedaInput = document.querySelector('.busqueda-input');
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    const filtroEstatus = document.getElementById("filtroEstatus").value;

    let activosFiltrados = todasLosActivos;

    if(terminoBusqueda){
        activosFiltrados = activosFiltrados.filter(activo =>
            activo.conceptoActivo && activo.conceptoActivo.toLowerCase().includes(terminoBusqueda)
        )
    }

    if(filtroEstatus !== ""){
        activosFiltrados = activosFiltrados.filter(activo =>
            activo.estatus.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    mostrarActivos(activosFiltrados);
}

document.addEventListener("DOMContentLoaded", cargarActivos);