// FUNCION PARA MOSTRAR LOS PROVEEDORES GUARDADOS
let todosLosProveedores = [];

async function cargarProveedores() {
    const contendor = document.getElementById("contenedorProveedor");
    contendor.innerHTML = '<p>Cargando...</p>'
    try{
        const res = await fetch('/api/routeListaProveedor/traerProveedor');

        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(data)) {
            todosLosProveedores = data;
        } else if (data.data && Array.isArray(data.data)) {
            todosLosProveedores = data.data;
        } else {
            console.error("Estructura de respuesta no reconocida:", data);
            todosLosProveedores = [];
        }

        console.log("Proveedores cargados:", todosLosProveedores);

        // CORRECCIÓN: La condición estaba mal escrita
        if (todosLosProveedores.length === 0) {
            contenedor.innerHTML = '<p>No se encontraron proveedores registrados</p>';
            return;
        }

        // Cargar opciones de filtro
        cargarOpcionesFiltro();

        mostrarProveedores(todosLosProveedores);
    }catch(e){
        console.error("HUbo un error al encontrar los conceptos");
    }
}

function editarProveedor(id){
    window.location.href = `/html/altaProveedor.html?id=${id}`;
}

async function eliminarProveedor(id) {
    if(!confirm(`Seguro que desea eliminar la solicitud #${id}`)) return;
    try{

        const res = await fetch(`/api/routeListaProveedor/listaProveedorEliminar/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
        });

        const result = await res.json();
        if(res.ok){
            alert(result.message);
            cargarProveedores();
        }
    }catch(e){
        console.error("Hubo un error al eliminar el Proveedor");
    }
}

function cargarOpcionesFiltro() {
    // Cargar ciudades únicas
    const ciudadesUnicas = [...new Set(todosLosProveedores.map(p => p.ciudad))].filter(Boolean);
    const filtroCiudad = document.getElementById('filtroCiudad');
    filtroCiudad.innerHTML = '<option value="">Todas las ciudades</option>';
    
    ciudadesUnicas.forEach(ciudad => {
        const option = document.createElement('option');
        option.value = ciudad;
        option.textContent = ciudad;
        filtroCiudad.appendChild(option);
    });
}

function mostrarProveedores(proveedores) {
    const contenedor = document.getElementById("contenedorProveedor");

    if (proveedores.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron proveedores con los filtros aplicados</p>';
        return;
    }

    contenedor.innerHTML = proveedores.map(u => {
        const esCancelado = u.estatusProveedor && u.estatusProveedor.toLowerCase() === 'cancelado';
        const botones = esCancelado
            ? ""
            :
            `<button type="button" onclick="editarProveedor(${u.id})" class="btn-accion btn-editar">Editar</button>
            <button type="button" onclick="eliminarProveedor(${u.id})" class="btn-accion btn-eliminar">Eliminar</button>`;
        
        const claseCancelado = esCancelado ? "cancelado" : "";
        
        // Mostrar estatus con primera letra en mayúscula
        const estatusDisplay = u.estatusProveedor ? 
            u.estatusProveedor.charAt(0).toUpperCase() + u.estatusProveedor.slice(1) : 
            'Sin estatus';

        // CORRECCIÓN: Cambié classname por class
        return `
            <div class="solicitud ${claseCancelado}">
                <div class="concepto-card">
                    <div class="concepto-header">
                        <h3 class="concepto-titulo">Proveedor #${u.id} - ${u.nickName || 'Sin nickname'}</h3>
                        <span class="concepto-estatus estatus-${u.estatusProveedor}">${estatusDisplay}</span>
                    </div>
                    <div class="concepto-body">
                        <p><strong>Razón Social:</strong> ${u.razonSocial || 'No especificado'}</p>
                        <p><strong>RFC:</strong> ${u.rfc || 'No especificado'}</p>
                        <p><strong>Domicilio Fiscal:</strong> ${u.domicilioFiscal || 'No especificado'}</p>
                        <p><strong>Ubicación:</strong> ${u.ciudad || 'No especificado'} - CP: ${u.cp || 'No especificado'}</p>
                        <p><strong>Contacto:</strong> ${u.correo || 'No especificado'}</p>
                        <p><strong>Datos Bancarios:</strong> Cuenta: ${u.cuenta || 'No especificado'} - CLABE: ${u.clabe || 'No especificado'}</p>
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

function filtrarProveedores() {
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroCiudad = document.getElementById('filtroCiudad').value;
    
    console.log("Aplicando filtros - Estatus:", filtroEstatus, "Ciudad:", filtroCiudad);

    let proveedoresFiltrados = todosLosProveedores;

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        proveedoresFiltrados = proveedoresFiltrados.filter(proveedor => 
            proveedor.estatusProveedor && proveedor.estatusProveedor.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    // Aplicar filtro de ciudad
    if (filtroCiudad !== "") {
        proveedoresFiltrados = proveedoresFiltrados.filter(proveedor => 
            proveedor.ciudad === filtroCiudad
        );
    }

    console.log("Resultado del filtro:", proveedoresFiltrados);
    mostrarProveedores(proveedoresFiltrados);
}

function buscarProveedores() {
    const busquedaInput = document.getElementById('busquedaInput');
    const terminoBusqueda = busquedaInput.value.toLowerCase();
    const filtroEstatus = document.getElementById('filtroEstatus').value;
    const filtroCiudad = document.getElementById('filtroCiudad').value;

    let proveedoresFiltrados = todosLosProveedores;

    // Aplicar filtro de búsqueda
    if (terminoBusqueda) {
        proveedoresFiltrados = proveedoresFiltrados.filter(proveedor =>
            (proveedor.nickName && proveedor.nickName.toLowerCase().includes(terminoBusqueda)) ||
            (proveedor.razonSocial && proveedor.razonSocial.toLowerCase().includes(terminoBusqueda)) ||
            (proveedor.rfc && proveedor.rfc.toLowerCase().includes(terminoBusqueda)) ||
            (proveedor.ciudad && proveedor.ciudad.toLowerCase().includes(terminoBusqueda)) ||
            (proveedor.correo && proveedor.correo.toLowerCase().includes(terminoBusqueda))
        );
    }

    // Aplicar filtro de estatus
    if (filtroEstatus !== "") {
        proveedoresFiltrados = proveedoresFiltrados.filter(proveedor => 
            proveedor.estatusProveedor && proveedor.estatusProveedor.toLowerCase() === filtroEstatus.toLowerCase()
        );
    }

    // Aplicar filtro de ciudad
    if (filtroCiudad !== "") {
        proveedoresFiltrados = proveedoresFiltrados.filter(proveedor => 
            proveedor.ciudad === filtroCiudad
        );
    }

    mostrarProveedores(proveedoresFiltrados);
}

// Permitir búsqueda con Enter
document.addEventListener('DOMContentLoaded', function() {
    const busquedaInput = document.getElementById('busquedaInput');
    if (busquedaInput) {
        busquedaInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                buscarProveedores();
            }
        });
    }
    
    cargarProveedores();
});