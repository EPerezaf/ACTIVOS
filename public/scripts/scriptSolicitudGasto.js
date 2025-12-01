const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const modoEdicion = !!id;

//FUNCION PARA OBTENER EL TOKEN 
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || !role) {
        //REDIRIGIR AL LOGIN SI NO HAY TOKEN
        window.location.href = "/html/index.html";
        return {};
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !role) {
        window.location.href = "/html/index.html";
        return;
    }

    //VERIFICAR QUE EL ROL TENGA ACCESO A ESTA PAGINA
    const rolesPermitidos = ["Administrador", "Jefe de Activos", "Gerente General"];
    if (!rolesPermitidos.includes(role)) {
        alert("No tienes permisos para acceder a esta pagina");
        window.location.href = "/html/index.html";
        return;
    }

    //SI HAY ID, CARGAR DATOS EXISTENTES
    if(id){
        //inicializarEditarSolicitud();
        cargarDatosEdicion();
    }
    
    //INICIALIZAR MDOALES
    inicializarActivo();
    inicializarGuardado();
});

let timeout = null;

// FUNCIÓN PARA CARGAR DATOS EN MODO EDICIÓN
async function cargarDatosEdicion() {
    try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}`, {
            headers: headers
        });

        if (!res.ok) {
            throw new Error('Error al cargar los datos de la solicitud');
        }

        const resultado = await res.json();
        
        if (!resultado.success) {
            alert('Error: ' + resultado.message);
            return;
        }

        const solicitud = resultado.data;
        
        // LLENAR LOS CAMPOS DEL FORMULARIO
        document.getElementById("clasificacion").value = solicitud.clasificacionGasto;
        document.getElementById("descripcionGasto").value = solicitud.descripcionGasto;
        document.getElementById("tipoGasto").value = solicitud.tipoGasto;
        document.getElementById("lectura").value = solicitud.lectura || '';

        // LLENAR LOS ACTIVOS
        const contenedorActivo = document.getElementById("contenedorActivo");
        contenedorActivo.innerHTML = ''; // Limpiar contenedor

        //VERIFICAR SI HAY ELEMENTOS NO ACTIVOS EN LA SOLICITUD 
        let tieneElementosNoActivos = false;

        solicitud.activos.forEach(activo => {
            // ASEGURAR QUE EL DATASET TENGA TODOS LOS CAMPOS NECESARIOS
            const activoData = {
                id: activo.idActivo,
                conceptoActivo: activo.conceptoActivo, // Asegurar que este campo esté presente
                familia: activo.familia,
                subFamilia: activo.subFamilia,
                nomenclatura: activo.nomenclatura,
                numSerie: activo.numSerie,
                estatus: activo.estatus || 'alta'
            };

            const fila = document.createElement("div");
            fila.classList.add("fila", "activo-completo");
            fila.dataset.activo = JSON.stringify(activoData);

            //AGREGAR CLASE DE ADVERTENCIA SI NO ESTA ACTIVO
            if(activoData.estatus.toLowerCase() !== 'alta'){
                fila.classList.add('elemento-no-activo');
                fila.style.borderColor = '#ff9800';
                fila.style.backgroundColor = '#fff3e0'
            }

            fila.innerHTML = `
                <div class="grupo-inputs-contenedor">
                    <!-- DATOS DEL ACTIVO -->
                    <div class="input-flotante-contenedor">
                        <input type="text" value="${activo.conceptoActivo}" readonly>
                        <label>Activo ${activoData.estatus.toLowerCase() !== 'alta' ? '(No activo)': ''}</label>
                    </div>
                </div>
                    
                    <!-- CONCEPTO DE GASTO PARA ESTE ACTIVO -->
                    <div class="input-flotante-contenedor">
                        <input type="text" class="concepto-gasto-input" value="${activo.conceptoGasto}" readonly>
                        <label>Concepto de Gasto</label>
                    </div>
                    <button type="button" class="btn-seleccionar-gasto" onclick="seleccionarGastoParaActivo(this)">Seleccionar</button>
                    
                    <!-- CONTENEDOR PARA PROVEEDORES DE ESTE ACTIVO -->
                    <div class="proveedores-contenedor">
                        <label>Proveedores para este activo:</label>
                        <button type="button" class="btn-agregar-proveedor" onclick="agregarProveedorParaActivo(this)">+ Agregar Proveedor</button>
                        <div class="proveedores-lista">
                            ${activo.proveedores.map(proveedor => `
                                <div class="proveedor-fila">
                                    <div class="grupo-inputs-contenedor">
                                        <div class="input-flotante-contenedor">
                                            <input type="text" value="${proveedor.razonSocial}" readonly>
                                            <label>Razon Social</label>
                                        </div>
                                        <div class="input-flotante-contenedor">
                                            <input type="text" value="${proveedor.nickName}" readonly>
                                            <label>Nick Name</label>
                                        </div>
                                        <div class="input-flotante-contenedor">
                                            <input type="number" value="${proveedor.monto}" placeholder="0.00" step="0.01" readonly>
                                            <label>Costo</label>
                                        </div>
                                        <input type="hidden" value="${proveedor.idProveedor}">
                                        <button type="button" class="btn-remove-grupo" onclick="this.parentElement.parentElement.remove()">X</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <button type="button" class="btn-remove-grupo">X</button>
                
            `;
            
            fila.querySelector(".btn-remove-grupo").addEventListener("click", () => fila.remove());
            contenedorActivo.appendChild(fila);
        });

        if(tieneElementosNoActivos){
            mostrarAdvertenciaElementosNoActivos();
        }

        // CAMBIAR EL TÍTULO Y EL BOTÓN SI ESTAMOS EDITANDO
        document.querySelector("h1").textContent = "Editar Solicitud de Gasto";
        document.getElementById("btnGuardar").textContent = "Actualizar Solicitud";

        //AGREGAR BOTON PARA ENVIAR A PROCESO 
        agregarBotonEnviarProceso(solicitud.estatusCompras);

    } catch (error) {
        console.error("Error al cargar datos para edición:", error);
        alert("Error al cargar los datos de la solicitud");
    }
}

// FUNCIÓN PARA MOSTRAR ADVERTENCIA DE ELEMENTOS NO ACTIVOS
function mostrarAdvertenciaElementosNoActivos() {
    const advertencia = document.createElement("div");
    advertencia.style.cssText = `
        background-color: #fff3e0;
        border: 2px solid #ff9800;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
        color: #e65100;
        font-weight: bold;
    `;
    advertencia.innerHTML = `
        ⚠️ <strong>Advertencia:</strong> Esta solicitud contiene elementos que ya no están activos. 
        Puedes mantenerlos para referencia histórica, pero no podrás agregar nuevos elementos no activos.
    `;
    
    const contenedorPrincipal = document.querySelector('.container');
    if (contenedorPrincipal) {
        contenedorPrincipal.insertBefore(advertencia, contenedorPrincipal.firstChild);
    }
}

// FUNCIÓN PARA AGREGAR BOTÓN DE ENVIAR A PROCESO
function agregarBotonEnviarProceso(estatusActual) {
    const userRole = localStorage.getItem("role");
    
    // SOLO PERMITIR A ADMINISTRADOR Y JEFE DE ACTIVOS ENVIAR A PROCESO
    const rolesPermitidos = ["Administrador", "Jefe de Activos"];
    
    // SOLO MOSTRAR SI EL ESTATUS ACTUAL ES "Pendiente"
    if (rolesPermitidos.includes(userRole) && estatusActual === "Pendiente") {
        const btnGuardar = document.getElementById("btnGuardar");
        const btnEnviarProceso = document.createElement("button");
        
        btnEnviarProceso.type = "button";
        btnEnviarProceso.id = "btnEnviarProceso";
        btnEnviarProceso.className = "btnGuardar";
        btnEnviarProceso.textContent = "Enviar a Proceso";
        btnEnviarProceso.style.backgroundColor = "#ff9800";
        btnEnviarProceso.style.marginLeft = "10px";
        
        btnEnviarProceso.addEventListener("click", enviarAProceso);
        
        btnGuardar.parentNode.insertBefore(btnEnviarProceso, btnGuardar.nextSibling);
    }
}

// FUNCIÓN PARA ENVIAR SOLICITUD A PROCESO
async function enviarAProceso() {
    if (!confirm("¿Estás seguro de que deseas enviar esta solicitud a proceso? Una vez enviada, no podrás editarla.")) {
        return;
    }

    try {
        // PRIMERO ACTUALIZAR LOS DATOS
        const datosActualizados = await obtenerDatosFormulario();
        if (!datosActualizados) return;

        // LUEGO ENVIAR A PROCESO
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}/enviarProceso`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(datosActualizados)
        });

        const responseText = await res.text();
        let result;
        
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Respuesta del servidor: ${responseText}`);
        }

        if (!res.ok) {
            throw new Error(result.message || `Error ${res.status}: ${res.statusText}`);
        }

        if (result.success) {
            alert(result.message);
            window.location.href = "/html/listasolicitudgasto.html";
        } else {
            alert(`Error: ${result.message}`);
        }

    } catch (error) {
        console.error("Error al enviar a proceso:", error);
        alert("Error al enviar la solicitud a proceso: " + error.message);
    }
}


// FUNCIÓN PARA OBTENER DATOS DEL FORMULARIO (REUTILIZABLE)
async function obtenerDatosFormulario() {
    const contenedorActivo = document.getElementById("contenedorActivo");

    if (!contenedorActivo) {
        alert("ERROR: Contenedor de activos no encontrado");
        return null;
    }

    // OBTENER DATOS
    const clasificacion = document.getElementById("clasificacion").value;
    const descripcionGasto = document.getElementById("descripcionGasto").value;
    const tipoGasto = document.getElementById("tipoGasto").value;
    const lectura = document.getElementById("lectura").value;

    const data = {
        clasificacionGasto: clasificacion,
        descripcionGasto: descripcionGasto,
        tipoGasto: tipoGasto,
        lectura: lectura,
        activos: [],
    };

    const filasActivo = contenedorActivo.querySelectorAll(".fila");
    
    if (filasActivo.length === 0) {
        alert("ERROR: Debe seleccionar al menos un activo");
        return null;
    }

    // VALIDAR QUE CADA ACTIVO TENGA GASTO
    let todosTienenGasto = true;
    let errores = [];
    
    filasActivo.forEach((fila, index) => {
        const conceptoGastoInput = fila.querySelector('.concepto-gasto-input');
        if (!conceptoGastoInput || !conceptoGastoInput.value.trim()) {
            errores.push(`El activo ${index + 1} no tiene concepto de gasto asignado`);
            todosTienenGasto = false;
        }
    });
    
    if (!todosTienenGasto) {
        alert("ERROR: " + errores.join('\n'));
        return null;
    }

    // RECOLECTAR DATOS DE ACTIVOS
    filasActivo.forEach((fila, index) => {
        if (fila.dataset.activo) {
            const activoCompleto = JSON.parse(fila.dataset.activo);
            const conceptoGastoInput = fila.querySelector('.concepto-gasto-input');
            const conceptoGasto = conceptoGastoInput ? conceptoGastoInput.value.trim() : "";

            // OBTENER PROVEEDORES
            const proveedores = [];
            const filasProveedor = fila.querySelectorAll('.proveedor-fila');

            filasProveedor.forEach((proveedorFila) => {
                const inputs = proveedorFila.querySelectorAll("input");
                if (inputs.length >= 4) {
                    const proveedorData = {
                        idProveedor: parseInt(inputs[3]?.value) || 0,
                        razonSocial: inputs[0].value.trim(),
                        nickName: inputs[1].value.trim(),
                        monto: parseFloat(inputs[2].value) || 0
                    };

                    if (proveedorData.razonSocial && proveedorData.monto > 0) {
                        proveedores.push(proveedorData);
                    }
                }
            });

            const activoData = {
                idActivo: parseInt(activoCompleto.id) || 0,
                conceptoActivo: activoCompleto.conceptoActivo || activoCompleto.conceptoGasto || "Sin nombre",
                familia: activoCompleto.familia || "",
                subFamilia: activoCompleto.subFamilia || "",
                nomenclatura: activoCompleto.nomenclatura || "",
                numSerie: activoCompleto.numSerie || "",
                conceptoGasto: conceptoGasto,
                proveedores: proveedores
            };

            data.activos.push(activoData);
        }
    });

    // VALIDACIONES FINALES
    const tieneProveedores = data.activos.some(activo => activo.proveedores.length > 0);
    if (!tieneProveedores) {
        alert("ERROR: Debe seleccionar al menos un proveedor con monto mayor a 0");
        return null;
    }

    let montosValidos = true;
    data.activos.forEach((activo, index) => {
        activo.proveedores.forEach((proveedor, provIndex) => {
            if (proveedor.monto <= 0) {
                alert(`ERROR: El proveedor ${provIndex + 1} del activo ${index + 1} tiene un monto inválido`);
                montosValidos = false;
            }
        });
    });
    
    if (!montosValidos) return null;

    return data;
}

function inicializarActivo() {
    const modal = document.getElementById("modalActivo");
    const abrirBtn = document.getElementById("abrirActivo");
    const cerrarBtn = document.getElementById("cerrarActivo");
    const closeSpan = document.querySelector("#modalActivo .close");

    if (!modal || !abrirBtn || !cerrarBtn || !closeSpan) {
        console.error("Elementos del modal no encontrados");
        return;
    }

    //ABRIR EL MODAL 
    abrirBtn.addEventListener("click", () => {
        modal.style.display = "block";
        const buscarActivo = document.getElementById("buscarActivo");
        const resulatdoActivo = document.getElementById("resultadoActivo");

        if (buscarActivo) buscarActivo.value = "";
        if (resulatdoActivo) resulatdoActivo.innerHTML = "";
    });

    //CERRAR EL MODAL 
    cerrarBtn.addEventListener("click", () => cerrarModal(modal));
    closeSpan.addEventListener("click", () => cerrarModal(modal));

    //BUSQUEDA DE ACTIVOS
    const inputBuscarActivo = document.getElementById("buscarActivo");
    const resultadoActivoDiv = document.getElementById("resultadoActivo");
    if (inputBuscarActivo && resultadoActivoDiv) {
        inputBuscarActivo.addEventListener("input", (e) => {
            console.log(`Buscnado Activo: `, e.target.value);
        });
    }
    inputBuscarActivo.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            const texto = inputBuscarActivo.value.trim();
            if (!texto) {
                resultadoActivoDiv.innerHTML = "";
                return;
            }
            try {
                const res = await fetch(`/api/routeRegistroActivo/buscarActivo?buscar=${encodeURIComponent(texto)}`, {
                    headers: getAuthHeaders()
                });
                const activo = await res.json();

                //FILTRAR SOLO ACTIVOS CON ESTATUS "ALTA"
                const activosActivos = activo.filter(a =>
                    a.estatus && a. estatus.toLowerCase() === 'activo'
                );
                console.log(`Activos encontrados: ${activo.length}, Activos: ${activosActivos.length}`);

                if (activosActivos.length === 0) {
                    resultadoActivoDiv.innerHTML = "<p>NO se encontro algun activo";
                    return;
                }

                resultadoActivoDiv.innerHTML = activo.map(u =>
                    `
                        <div class="result-item">
                            <button class="btn-buscar-personal" onclick="seleccionarActivo(${JSON.stringify(u).replace(/"/g, '&quot;')})">
                                ${u.conceptoActivo}
                            </button>
                            <label>Familia: ${u.familia} - Sub Familia:${u.subFamilia}</label>
                        </div>
                    `
                ).join("");
            } catch (error) {
                console.error("Error en la busqueda: ", error);
                resultadoActivoDiv.innerHTML = "<p>Error en la busqueda</p>"
            }
        }, 400);
    })
}

function seleccionarActivo(activo) {
    console.log("Activo seleccionado: ", activo);
    const contenedor = document.getElementById("contenedorActivo");
    if (!contenedor) {
        console.error("Contenedor no encontrado");
        return;
    }
    
    const fila = document.createElement("div");
    fila.classList.add("fila", "activo-completo");
    fila.dataset.activo = JSON.stringify(activo);

    fila.innerHTML = `
        <div class="grupo-inputs-contenedor">
            <!-- DATOS DEL ACTIVO -->
            <div class="input-flotante-contenedor">
                <input type="text" value="${activo.conceptoActivo}" readonly>
                <label>Activo</label>
            </div>
        </div>
            
            <!-- CONCEPTO DE GASTO PARA ESTE ACTIVO -->
            <div class="input-flotante-contenedor">
                <input type="text" class="concepto-gasto-input" placeholder="Seleccionar concepto de gasto" readonly>
                <label>Concepto de Gasto</label>                
            </div>
            <button type="button" class="btn-seleccionar-gasto" onclick="seleccionarGastoParaActivo(this)">Seleccionar</button>
            
            <!-- CONTENEDOR PARA PROVEEDORES DE ESTE ACTIVO -->
            <div class="proveedores-contenedor">
                <label>Proveedores para este activo:</label>
                <button type="button" class="btn-agregar-proveedor" onclick="agregarProveedorParaActivo(this)">+ Agregar Proveedor</button>
                <div class="proveedores-lista"></div>
            </div>
            <br>
            
            <button type="button" class="btn-remove-grupo">X</button>
        
    `;
    
    fila.querySelector(".btn-remove-grupo").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);
    
    // LIMPIAR MODAL
    const resultadoActivo = document.getElementById("resultadoActivo");
    const inputActivo = document.getElementById("buscarActivo");
    const modal = document.getElementById("modalActivo");

    if (resultadoActivo) resultadoActivo.innerHTML = "";
    if (inputActivo) inputActivo.value = "";
    if (modal) modal.style.display = "none";
}

function seleccionarGastoParaActivo(button) {
    const contenedorInput = button.parentElement;
    const inputGasto = contenedorInput.querySelector('.concepto-gasto-input');
    
    // Configurar el callback global temporal
    window.gastoCallbackTemp = function(gastoSeleccionado) {
        inputGasto.value = gastoSeleccionado.conceptoGasto;
        inputGasto.dataset.gasto = JSON.stringify(gastoSeleccionado);
        cerrarModal(document.getElementById("modalGasto"));
        // Limpiar el callback después de usarlo
        window.gastoCallbackTemp = null;
    };
    
    abrirModalGastoParaActivo();
}

//FUNCION PARA AGREGAR PROVEEDOR A UN ACTIVO ESPECIFICO
function agregarProveedorParaActivo(button) {
    const proveedoresContenedor = button.parentElement.querySelector('.proveedores-lista');
    
    // Configurar el callback global temporal
    window.proveedorCallbackTemp = function(proveedorSeleccionado) {
        const proveedorFila = document.createElement("div");
        proveedorFila.classList.add("proveedor-fila");
        proveedorFila.innerHTML = `
            <div class="grupo-inputs-contenedor">
                <div class="input-flotante-contenedor">
                    <input type="text" value="${proveedorSeleccionado.razonSocial}" readonly>
                    <label>Razon Social</label>
                </div>
                <div class="input-flotante-contenedor">
                    <input type="text" value="${proveedorSeleccionado.nickName}" readonly>
                    <label>Nick Name</label>
                </div>
                <div class="input-flotante-contenedor">
                    <input type="number" value="" placeholder="0.00" step="0.01">
                    <label>Costo</label>
                </div>
                <input type="hidden" value="${proveedorSeleccionado.id}">
                <button type="button" class="btn-remove-grupo" onclick="this.parentElement.parentElement.remove()">X</button>
            </div>
        `;
        proveedoresContenedor.appendChild(proveedorFila);
        cerrarModal(document.getElementById("modalProveedor"));
        // Limpiar el callback después de usarlo
        window.proveedorCallbackTemp = null;
    };
    
    abrirModalProveedorParaActivo();
}

// FUNCIONES AUXILIARES COMPLETAS PARA MODALES
function abrirModalGastoParaActivo() {
    const modal = document.getElementById("modalGasto");
    modal.style.display = "block";
    
    // Limpiar búsqueda al abrir
    const buscarGasto = document.getElementById("buscarGasto");
    const resultadoGasto = document.getElementById("resultadoGasto");
    if(buscarGasto) buscarGasto.value = "";
    if(resultadoGasto) resultadoGasto.innerHTML = "";
    
    // Configurar la búsqueda
    const inputBuscarGasto = document.getElementById("buscarGasto");
    const resultadoGastoDiv = document.getElementById("resultadoGasto");
    
    if(inputBuscarGasto && resultadoGastoDiv){
        // Remover event listeners anteriores para evitar duplicados
        const newInput = inputBuscarGasto.cloneNode(true);
        inputBuscarGasto.parentNode.replaceChild(newInput, inputBuscarGasto);
        
        newInput.addEventListener("input", (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const texto = newInput.value.trim();
                if(!texto){
                    resultadoGastoDiv.innerHTML = "";
                    return;
                }
                try{
                    const res = await fetch(`/api/routeConceptoGasto/buscarGasto?buscar=${encodeURIComponent(texto)}`,{
                        headers: getAuthHeaders()
                    });
                    const gastos = await res.json();

                    const gastosActivos = gastos.filter(g =>
                        g.estatus && g.estatus.toLowerCase() === "alta"
                    );
                    console.log(`Conceptos de gasto encontrados: ${gastos.length}, Activos: ${gastosActivos.length}`);
                    
                    if(gastosActivos.length === 0){
                        resultadoGastoDiv.innerHTML = "<p>No se encontraron resultados</p>";
                        return;
                    }
                    resultadoGastoDiv.innerHTML = gastos.map(gasto => 
                        `<div class="result-item">
                            <button class="btn-buscar-personal" onclick="seleccionarGastoDesdeModal(${JSON.stringify(gasto).replace(/"/g, '&quot;')})">
                                ${gasto.conceptoGasto}
                            </button>
                        </div>`
                    ).join("");
                }catch(error){
                    console.error("Error en la busqueda", error);
                    resultadoGastoDiv.innerHTML = "<p>Error en la busqueda</p>";
                }
            }, 400);
        });
    }
}

function abrirModalProveedorParaActivo() {
    const modal = document.getElementById("modalProveedor");
    modal.style.display = "block";
    
    // Limpiar búsqueda al abrir
    const buscarProveedor = document.getElementById("buscarProveedor");
    const resultadoProveedor = document.getElementById("resultadoProveedor");
    if(buscarProveedor) buscarProveedor.value = "";
    if(resultadoProveedor) resultadoProveedor.innerHTML = "";
    
    // Configurar la búsqueda
    const inputBuscarProveedor = document.getElementById("buscarProveedor");
    const resultadoProveedorDiv = document.getElementById("resultadoProveedor");
    
    if(inputBuscarProveedor && resultadoProveedorDiv){
        // Remover event listeners anteriores
        const newInput = inputBuscarProveedor.cloneNode(true);
        inputBuscarProveedor.parentNode.replaceChild(newInput, inputBuscarProveedor);
        
        newInput.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const texto = newInput.value.trim();
                if (!texto) {
                    resultadoProveedorDiv.innerHTML = "";
                    return;
                }
                try {
                    const res = await fetch(`/api/routeProveedor/buscarProveedores?buscar=${encodeURIComponent(texto)}`, {
                        headers: getAuthHeaders()
                    });
                    const proveedores = await res.json();

                    //FILTRAR SOLO PROVEEDORES CON ESTATUS "ALTA"
                    const proveedoresActivos = proveedores.filter(p=>
                        p.estatusProveedor && p.estatusProveedor.toLowerCase() === "alta"
                    );
                    console.log(`Proveedores encontrados: ${proveedores.length}, Activos: ${proveedoresActivos.length}`);

                    if (proveedoresActivos.length === 0) {
                        resultadoProveedorDiv.innerHTML = '<p>No se encontraron resultados</p>';
                        return;
                    }
                    resultadoProveedorDiv.innerHTML = proveedores.map(prov =>
                        `<div class="result-item">
                            <button class="btn-buscar-personal" onclick="seleccionarProveedorDesdeModal(${JSON.stringify(prov).replace(/"/g, '&quot;')})">
                                ${prov.nickName} ${prov.razonSocial} ${prov.rfc}
                            </button>
                        </div>`
                    ).join("");
                } catch (error) {
                    console.error("Error en la busqueda: ", error);
                    resultadoProveedorDiv.innerHTML = "<p>Error en la busqueda</p>";
                }
            }, 400);
        });
    }
}

// FUNCIONES PARA SELECCIONAR DESDE LOS MODALES
function seleccionarGastoDesdeModal(gastoSeleccionado) {
    if (typeof window.gastoCallbackTemp === 'function') {
        window.gastoCallbackTemp(gastoSeleccionado);
    } else {
        console.error('Callback de gasto no disponible');
        alert('Error: No se pudo asignar el gasto. Intente nuevamente.');
    }
}

function seleccionarProveedorDesdeModal(proveedorSeleccionado) {
    if (typeof window.proveedorCallbackTemp === 'function') {
        window.proveedorCallbackTemp(proveedorSeleccionado);
    } else {
        console.error('Callback de proveedor no disponible');
        alert('Error: No se pudo asignar el proveedor. Intente nuevamente.');
    }
}

function seleccionarGasto(gasto){
    console.log("Gasto seleccionado: ", gasto);
    const contenedor = document.getElementById("contenedorGasto");
    if(!contenedor){
        console.error("Contenedor gasto no encontardo");
        return;
    }

    const fila = document.createElement("div");
    fila.classList.add("fila");
    fila.innerHTML= `
        <div class="grupo-inputs-contenedor">
            <div class="input-flotante-contenedor">
                <input type="text" value="${gasto.conceptoGasto}" readonly>
                <label>Gasto</label>
            </div>
            <button class="btn-remove-grupo">X</button>
        </div>
    `;

    fila.querySelector(".btn-remove-grupo").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);

    const resultadoGastoDiv = document.getElementById("resultadoGasto");
    const inputBuscarGasto = document.getElementById("buscarGasto");
    const modal = document.getElementById("modalGasto");

    if(resultadoGastoDiv) resultadoGastoDiv.innerHTML ="";
    if(inputBuscarGasto) inputBuscarGasto.value = "";
    if(modal) modal.style.display = "none";
}

function seleccionarProveedor(proveedor) {
    console.log("Proveedor seleccionado: ", proveedor);
    const contenedor = document.getElementById("contenedorProveedor");
    if (!contenedor) {
        console.error("Contenedor no encontrado");
        return;
    }
    const fila = document.createElement("div");
    fila.classList.add("fila");
    fila.innerHTML = `
            <div class="grupo-inputs-contenedor">
                <div class="input-flotante-contenedor">
                    <input type="text" value="${proveedor.razonSocial}" readonly>
                    <label>Razon Social</label>
                </div>
                <div class="input-flotante-contenedor">
                    <input type="text" value="${proveedor.nickName}" readonly>
                    <label>Nick Name</label>
                </div>
                <div class="input-flotante-contenedor">
                    <input type="number" value="" placeholder="0.00" step="0.01">
                    <label>Costo</label>
                </div>
                <input type="hidden" value="${proveedor.id}">
                <button class="btn-remove-grupo">X</button>
            </div>
        `;
    fila.querySelector(".btn-remove-grupo").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);
    //LIMPIAR RESULTADOS DE BUSQUEDA
    const resultadoProveedorDiv = document.getElementById("resultadoProveedor");
    const inputBuscarProveedor = document.getElementById("buscarProveedor");
    const modal = document.getElementById("modalProveedor");
    if (resultadoProveedorDiv) resultadoProveedorDiv.innerHTML = "";
    if (inputBuscarProveedor) inputBuscarProveedor.value = "";
    if (modal) modal.style.display = "none";
}

//FUNCION GENERAL PARA CERRAR EL MODAL
function cerrarModal(modal) {
    if (modal) {
        modal.style.display = "none";
    }
}

//CERRAR FUERA DEL MODAL CON CLICK
window.addEventListener("click", () => {
    if (event.target.classList.contains('modal')) {
        cerrarModal(event.target);
    }
});

function inicializarGuardado(){
    const btnGuardar = document.getElementById("btnGuardar");
    if(btnGuardar){
        btnGuardar.addEventListener("click", async () => {
            const contenedorActivo = document.getElementById("contenedorActivo");

            if(!contenedorActivo){
                console.error("Contenedor no encontrados");
                return;
            }

            // OBTENER DATOS
            const clasificacion = document.getElementById("clasificacion").value;
            const descripcionGasto = document.getElementById("descripcionGasto").value;
            const tipoGasto = document.getElementById("tipoGasto").value;
            const lectura = document.getElementById("lectura").value;

            const data = {
                clasificacionGasto: clasificacion,
                descripcionGasto: descripcionGasto,
                tipoGasto: tipoGasto,
                lectura: lectura,
                activos: [],
            };

            console.log("INICIANDO PROCESO DE " + (modoEdicion ? "ACTUALIZACION" : "GUARDADO"));

            const filasActivo = contenedorActivo.querySelectorAll(".fila");
            console.log("Filas de Activos encontradas: ", filasActivo.length);
            
            if(filasActivo.length === 0){
                alert("ERROR: Debe seleccionar al menos un activo");
                return;
            }

            // VALIDAR QUE CADA ACTIVO TENGA GASTO
            let todosTienenGasto = true;
            let errores = [];
            
            filasActivo.forEach((fila,index) => {
                const conceptoGastoInput = fila.querySelector('.concepto-gasto-input');
                console.log(`Activo ${index + 1} - Input de gasto:`, conceptoGastoInput);
                console.log(`Activo ${index + 1} - Valor de gasto:`, conceptoGastoInput?.value);
                
                if(!conceptoGastoInput || !conceptoGastoInput.value.trim()){
                    errores.push(`El activo ${index + 1} no tiene concepto de gasto asignado`);
                    todosTienenGasto = false;
                }
            });
            
            if(!todosTienenGasto){
                alert("ERROR: " + errores.join('\n'));
                return;
            }

            // RECOLECTAR DATOS DE ACTIVOS
            filasActivo.forEach((fila,index) => {
                if(fila.dataset.activo){
                    const activoCompleto = JSON.parse(fila.dataset.activo);
                    console.log(`Activo ${index + 1} completo:`, activoCompleto);

                    const conceptoGastoInput = fila.querySelector('.concepto-gasto-input');
                    const conceptoGasto = conceptoGastoInput ? conceptoGastoInput.value.trim() : "";

                    // OBTENER PROVEEDORES DE ESTE ACTIVO ESPECÍFICO
                    const proveedores = [];
                    const filasProveedor = fila.querySelectorAll('.proveedor-fila');
                    console.log(`Activo ${index + 1} - Proveedores encontrados:`, filasProveedor.length);

                    filasProveedor.forEach((proveedorFila, provIndex) => {
                        const inputs = proveedorFila.querySelectorAll("input");
                        console.log(`Proveedor ${provIndex + 1} - Inputs:`, inputs.length);
                        
                        if(inputs.length >= 4){
                            const proveedorData = {
                                idProveedor: parseInt(inputs[3]?.value) || 0,
                                razonSocial: inputs[0].value.trim(),
                                nickName: inputs[1].value.trim(),
                                monto: parseFloat(inputs[2].value) || 0
                            };
                            console.log(`Proveedor ${provIndex + 1} datos:`, proveedorData);

                            if(proveedorData.razonSocial && proveedorData.monto > 0){
                                proveedores.push(proveedorData);
                            }
                        }
                    });

                    // ASEGURAR QUE TODOS LOS CAMPOS REQUERIDOS ESTÉN PRESENTES
                    const activoData = {
                        idActivo: parseInt(activoCompleto.id) || 0,
                        conceptoActivo: activoCompleto.conceptoActivo || activoCompleto.conceptoGasto || "Sin nombre", // CORREGIDO
                        familia: activoCompleto.familia || "",
                        subFamilia: activoCompleto.subFamilia || "",
                        nomenclatura: activoCompleto.nomenclatura || "",
                        numSerie: activoCompleto.numSerie || "",
                        conceptoGasto: conceptoGasto,
                        proveedores: proveedores
                    };

                    // VALIDAR CAMPOS OBLIGATORIOS
                    if (!activoData.conceptoActivo || activoData.conceptoActivo === "Sin nombre") {
                        alert(`ERROR: El activo ${index + 1} no tiene un nombre válido`);
                        return;
                    }

                    if (!activoData.conceptoGasto) {
                        alert(`ERROR: El activo ${index + 1} no tiene concepto de gasto asignado`);
                        return;
                    }

                    console.log(`Activo ${index + 1} procesado:`, activoData);
                    data.activos.push(activoData);
                }
            });

            // VALIDAR QUE AL MENOS UN ACTIVO TENGA PROVEEDORES
            const tieneProveedores = data.activos.some(activo => activo.proveedores.length > 0);
            console.log("¿Algún activo tiene proveedores?:", tieneProveedores);
            
            if(!tieneProveedores){
                alert("ERROR: Debe seleccionar al menos un proveedor con monto mayor a 0");
                return;
            }

            // VALIDAR MONTOS
            let montosValidos = true;
            data.activos.forEach((activo, index) => {
                activo.proveedores.forEach((proveedor, provIndex) => {
                    if(proveedor.monto <= 0) {
                        alert(`ERROR: El proveedor ${provIndex + 1} del activo ${index + 1} tiene un monto inválido`);
                        montosValidos = false;
                    }
                });
            });
            
            if(!montosValidos) return;

            console.log("DATOS FINALES A ENVIAR:", JSON.stringify(data, null, 2));

            try{
                console.log("Enviando datos al servidor...");
                const headers = getAuthHeaders();

                const url = modoEdicion
                    ? `/api/routeSolicitudGasto/solicitudGasto/${id}`
                    : '/api/routeSolicitudGasto/solicitudGasto';

                const method = modoEdicion ? 'PUT' : 'POST';
                
                const res = await fetch(url,{
                    method: method,
                    headers: headers,
                    body: JSON.stringify(data)
                });

                // OBTENER LA RESPUESTA DEL SERVIDOR INCLUSO SI ES ERROR
                const responseText = await res.text();
                console.log("Respuesta del servidor (texto):", responseText);
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error("No se pudo parsear la respuesta como JSON:", e);
                    throw new Error(`Respuesta del servidor: ${responseText}`);
                }

                if(!res.ok){
                    console.error("Error del servidor:", result);
                    throw new Error(result.message || `Error ${res.status}: ${res.statusText}`);
                }

                console.log("Respuesta del servidor (JSON):", result);

                if(result.success){
                    alert(`${result.message}\nID: ${result.id}`);
                    window.location.reload();
                }else{
                    alert(`Error: ${result.message}`);
                }
            }catch(error){
                console.error("Error al guardar: ", error);
                alert("Error al " + (modoEdicion ? "actualizar" : "guardar") + " la solcitud: ", error.message);
            }
        });
    }
}



