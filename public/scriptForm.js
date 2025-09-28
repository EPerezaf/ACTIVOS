//REGISTRO DE FAMILIA ACTIVOS
//conceptoFamiliaActivos.html
const formFamilia = document.getElementById('formFamilia');
if (formFamilia) {
    formFamilia.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(formFamilia);
        const data = {
            estatus: formData.get('estatus'),
            concepto: formData.get('concepto')
        };
        const response = await fetch('/familiaActivos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
        formData.reset();
    })
}

//REGISTRO SUBFAMILIAACTIVOS 
const conceptoSubFamilia = document.getElementById('conceptoSubFamilia');
//const btnGuardar = document.getElementById('btnGuardar');

/*//CARGA LAS FAMILIA DE ACTIVOS EN EL SELECT
async function cargarSelectFamilia() {
    const response = await fetch('/traerFamilia');
    const familias = await response.json();

    const lista = document.getElementById('listaFamilia');
    lista.innerHTML = '<option value="">Seleccione una Familia de Activos</option>';

    familias.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = u.concepto;
        lista.appendChild(option);
    });
}
document.addEventListener('DOMContentLoaded', cargarSelectFamilia);*/

//FORMULARIO PARA GUARDAR SUB FAMILIA 
//conceptoSubFamilia.html
const formSubFamilia = document.getElementById("formSubFamilia");
if (formSubFamilia) {
    formSubFamilia.addEventListener('submit', async e => {
        e.preventDefault();

        const conceptoFamilia = document.getElementById('listaFamilia').value;
        const estatus = document.getElementById('estatus').value;
        const conceptoSubFamilia = document.getElementById('conceptoSubFamilia').value;

        if (!conceptoFamilia) {
            alert("Debes seleccionar una Familia de Activos");
            return;
        }

        const res = await fetch('/subFamilia', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conceptoFamilia, estatus, conceptoSubFamilia })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formSubFamilia.reset();
    })
}

//REGISTRO CONCEPTOACTIVOS
const conceptoActivos = document.getElementById('conceptoActivos');

/*
//CARGA LAS FAMILIAS DE ACTIVOS EN EL SELECT
async function cargarSelectSubFamilia() {
    const response = await fetch('/traerSubFamilia');
    const subFamilia = await response.json();

    const lista = document.getElementById('listaSubFamilia');
    lista.innerHTML = '<option value="">Seleecione una Sub Familia</option>';

    subFamilia.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = u.conceptoSubFamilia;
        lista.appendChild(option);
    });
}
document.addEventListener('DOMContentLoaded', cargarSelectSubFamilia);
*/

//SELECT CON LA SELECCION DE SELECT FAMILIA 
document.addEventListener("DOMContentLoaded", () => {
    const selectFamilia = document.getElementById("listaFamilia");
    const selectSubFamilia = document.getElementById("listaSubFamilia");


    //CARGAR FAMILIAS AL INICIAR 
    async function cargarFamilias() {
        try{
            const res = await fetch("/traerFamilia");
            const familias = await res.json();

            selectFamilia.innerHTML = `<option value ="" disabled selectd>Seleccione una familia</option>`;
            familias.forEach(f => {
                selectFamilia.innerHTML += `<option value="${f.concepto}">${f.concepto}</option>`;
            });
        }catch(error){
            console.error("Error cargando familia:", error);
            selectFamilia.innerHTML = `<option value="">Error al cargar familias</option>`;
        }
    }
    //CAMBIAR SUBFAMILIAS CUANDO CAMBIE FAMILIAS
    selectFamilia.addEventListener("change", async () =>{
        const familiaSeleccionada = selectFamilia.value;
        console.log("Familia seleccionada:", familiaSeleccionada);

        if(!familiaSeleccionada){
            selectSubFamilia.innerHTML = "<option value='' disabled selected>Selecciona una subfamilia</option>";
            return;
        }

        try{
            const res = await fetch(`/buscarSubFamilia?buscar=${encodeURIComponent(familiaSeleccionada)}`);
            const subfamilias = await res.json();

            selectSubFamilia.innerHTML = `<option value="" disabled selected>Selecciona una subfamilia </option>`;
            subfamilias.forEach(sf =>{
                selectSubFamilia.innerHTML += `<option value="${sf.conceptoSubFamilia}"> ${sf.conceptoSubFamilia}</option>`;
            });
        }catch(error){
            console.error("Error cargando subfamilias:", error);
            selectSubFamilia.innerHTML = `<option value=""> Error al cargar sub familias</option>`;
        }
    });

    cargarFamilias();
})

const formConceptoActivos = document.getElementById('formConceptoActivos');
if (formConceptoActivos) {
    formConceptoActivos.addEventListener('submit', async e => {
        e.preventDefault();

        const conceptoFamilia = document.getElementById("listaFamilia").value;
        const conceptoSubFamilia = document.getElementById("listaSubFamilia").value;
        const estatus = document.getElementById("estatusConceptoActivos").value;
        const conceptoActivos = document.getElementById("conceptoActivos").value;
        const listaMedida = document.getElementById("listaMedida").value;

        if (!conceptoFamilia) {
            alert("Debes seleccionar una familia de activos");
            return;
        }

        if (!conceptoSubFamilia) {
            alert("DEbes seleccionar una Sub Familia");
            return;
        }

        if(!listaMedida){
            alert("DEBES SELECCIONAR UNA MEDIDA");
            return;
        }

        const res = await fetch('/conceptoActivos', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({estatus, conceptoFamilia, conceptoSubFamilia, listaMedida, conceptoActivos})
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formConceptoActivos.reset();
    })
}

//REGISTRO DE CONCEPTO GASTO 
const formConceptoGasto = document.getElementById('formConceptogasto');
if (formConceptoGasto) {
    formConceptoGasto.addEventListener('submit', async e => {
        e.preventDefault();

        const estatusGasto = document.getElementById('estatusGasto').value;
        const conceptoGasto = document.getElementById('conceptoGasto').value;

        if (!estatusGasto) {
            alert("Debes seleccionar un estatus");
            return;
        }
        if (!conceptoGasto) {
            alert("Debes escribir un concepto");
            return;
        }

        const res = await fetch('/conceptoGasto', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatusGasto, conceptoGasto })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formConceptoGasto.reset();
    })
}

//==========================================================================
//====================REGISTRO DE PERSONAL==================================
//================personal.html==============================================
const formPersonal = document.getElementById('formPersonal');
if (formPersonal) {
    formPersonal.addEventListener('submit', async e => {
        e.preventDefault();

        const estatusPersonal = document.getElementById('estatusPersonal').value;
        const nombre = document.getElementById('nombre').value;
        const aPaterno = document.getElementById('aPaterno').value;
        const aMaterno = document.getElementById('aMaterno').value;
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;

        if (!estatusPersonal) {
            alert("Debes seleccionar un estatus");
            return;
        }
        if (!nombre && !aPaterno && !aMaterno && !fechaNacimiento) {
            alert("Debes rellenar el campo")
            return;
        }

        const res = await fetch('/personal', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatusPersonal, nombre, aPaterno, aMaterno, fechaNacimiento })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formPersonal.reset();
    })
}

//=================================================================================================================
//==========================CONCEPTO COMPRA================================================================
//=================================================================================================================
const formConceptoCompras = document.getElementById("concepCompras");
if(formConceptoCompras){
    formConceptoCompras.addEventListener("submit", async e =>{
        e.preventDefault();
        
        const estatusConceptoCompra = document.getElementById("estatusConceptoCompra").value;
        const conceptoCompra = document.getElementById("conceptoCompra").value;

        if(!estatusConceptoCompra){
            alert("DEBES SELECCIONAR UN ESTATUS PARA EL CONCEPTO");
            return;
        }

        const res = await fetch('/conceptoCompra', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatusConceptoCompra, conceptoCompra})
        });
        
        const result = await res.json();
        alert(result.message || "GUARDADO COEECTAMENTE");
        formConceptoCompras.reset();
    });
}


//COMPRASACTIVOS.HTML
//CODIGO PARA IMPLEMENTAR LA BUSQUEDA Y SELECCIONADO DE PERSONAL Y FAMILIA Y SUB FAMILIA 

//=======VARIABLE LOCAL========//
let timeout = null;

//VERIFICAR DE ELEMNTOS EN EL DOM 
function verificarElementos() {
    const elementosVerificados = [
        'modalBusqueda', 'modalConceptoCompra',
        'abrirBusqueda', 'abrirConceptoCompra',
        'cerrarModal', 'cerrarModalConceptoCompra',
        'buscarPersonalModal', 'resultadosBusquedaModal',
        'buscarConceptoCompraModal', 'resultadosConceptoCompraModal',
        'contenedorPersonal', 'contenedorConceptoCompra', 'guardarBtn'
    ];

    elementosVerificados.forEach(id => {
        const elemento = document.getElementById(id);
        if (!elemento) {
            console.error(`Elemento con ID '${id}' no encontrado`);
        }
    });
}

//INICIALIZACION
document.addEventListener('DOMContentLoaded', function () {
    verificarElementos();
    inicializarAplicacion();
    inicializarConceptoCompra();
    inicializarGuardado();
});

function inicializarAplicacion() {
    //FUNCIONALIDAD DE MODAL 
    const modal = document.getElementById("modalBusqueda");
    const abrirBtn = document.getElementById("abrirBusqueda");
    const cerrarBtn = document.getElementById("cerrarModal");
    const closeSpan = document.querySelector(".close");

    if (!modal || !abrirBtn || !cerrarBtn || !closeSpan) {
        console.error("Elementos del  modal no encontrados");
        return;
    }

    //ABRIR MODAL 
    abrirBtn.addEventListener("click", () => {
        modal.style.display = "block";
        //LIMPIAR BUSQUEDA AL ABRIR
        const buscarPersonal = document.getElementById("buscarPersonalModal");
        const resultadosPersonal = document.getElementById("resultadosBusquedaModal");

        if (buscarPersonal) buscarPersonal.value = "";
        if (resultadosPersonal) resultadosPersonal.innerHTML = "";
    });

    //CERRAR MODAL
    cerrarBtn.addEventListener("click", () => cerrarModal(modal));
    closeSpan.addEventListener("click", () => cerrarModal(modal));

    //BUSQUEDA DE PERSONAL
    const inputBuscarPersonal = document.getElementById("buscarPersonalModal");
    const resultadosPersonalDiv = document.getElementById("resultadosBusquedaModal");

    if (inputBuscarPersonal && resultadosPersonalDiv) {
        inputBuscarPersonal.addEventListener('input', (e) => {
            console.log('Buscando personal:', e.target.value);
        });

        inputBuscarPersonal.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const texto = inputBuscarPersonal.value.trim();
                if (!texto) {
                    resultadosPersonalDiv.innerHTML = "";
                    return;
                }
                try {
                    const res = await fetch(`/traerPersonal?buscar=${encodeURIComponent(texto)}`);
                    const usuarios = await res.json();

                    if (usuarios.length === 0) {
                        resultadosPersonalDiv.innerHTML = "<p>NO se encontraron resultados<p>";
                        return;
                    }

                    resultadosPersonalDiv.innerHTML = usuarios.map(u =>
                        `<div>
                        <button onclick='seleccionarPersonal(${JSON.stringify(u)})'>
                        ${u.nombre} ${u.aPaterno} ${u.aMaterno}
                        </button>
                        </div>`
                    ).join("");
                } catch (error) {
                    console.error("Error en la busqueda", error);
                    resultadosPersonalDiv.innerHTML = "<p>Error en la busqueda</p>";
                }
            }, 400);
        });
    }

}

//FUNCIONES DE SELECCION 
function seleccionarPersonal(usuario) {
    console.log("Personal seleccionado:", usuario);
    const contenedor = document.getElementById("contenedorPersonal");
    if (!contenedor) {
        console.error("Contenedor personal no encontrado");
        return;
    }

    const fila = document.createElement("div");
    fila.classList.add("fila");

    fila.innerHTML = `
        <input type="text" value="${usuario.nombre}" readonly>
        <input type="text" value="${usuario.aPaterno}" readonly>
        <input type="text" value="${usuario.aMaterno}" readonly>
        <input type="number" placeholder="Comentario" class="Comentario">
        <button class="btn-remove">X</button>
        `;

    fila.querySelector(".btn-remove").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);

    //LIMPIAR RESULTADOS DE BUSQUEDA 
    const resultadosPersonalDiv = document.getElementById("resultadosBusquedaModal");
    const inputBuscarPersonal = document.getElementById("buscarPersonalModal");
    const modal = document.getElementById("modalBusqueda");

    if (resultadosPersonalDiv) resultadosPersonalDiv.innerHTML = "";
    if (inputBuscarPersonal) inputBuscarPersonal.value = "";
    if (modal) modal.style.display = "none";
}

//INICIALIZAR MODAL FAMILIA 
function inicializarConceptoCompra() {
    //FUNCION DE MODAL CONCEPTO COMPRA
    const modal = document.getElementById("modalConceptoCompra");
    const abrirBtn = document.getElementById("abrirConceptoCompra");
    const cerrarBtn = document.getElementById("cerrarModalConceptoCompra");
    const closeSpan = document.querySelector(".close");

    if (!modal || !abrirBtn || !cerrarBtn || !closeSpan) {
        console.error("ELEMENTOS DEL MODAL NO ENCONTRADOS");
        return;
    }

    abrirBtn.addEventListener("click", () => {
        modal.style.display = "block";
        //LIMPIAR BUSQUEDA AL ABRIR
        const buscarConceptoCompra = document.getElementById("buscarConceptoCompraModal");
        const resultadosConceptoCompra = document.getElementById("resultadosConceptoCompraModal");

        if (buscarConceptoCompra) buscarConceptoCompra.value = "";
        if (resultadosConceptoCompra) resultadosConceptoCompra.innerHTML = "";
    });

    //CERRAR MODAL
    cerrarBtn.addEventListener("click", () => cerrarModal(modal));
    closeSpan.addEventListener("click", () => cerrarModal(modal));

    //BUSQUEDA DE FAMILIA
    const inputBuscarConceptoCompra = document.getElementById("buscarConceptoCompraModal");
    const resultadoConceptoCompraDiv = document.getElementById("resultadosConceptoCompraModal");

    if (inputBuscarConceptoCompra && resultadoConceptoCompraDiv) {
        inputBuscarConceptoCompra.addEventListener('input', (e) => {
            console.log('Buscando FAMILIA:', e.target.value);
        })

        inputBuscarConceptoCompra.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const texto = inputBuscarConceptoCompra.value.trim();
                console.log("BUSCANDO FAMILIA CON:", texto);
                if (!texto) {
                    resultadoConceptoCompraDiv.innerHTML = "";
                    return;
                }
                try {
                    console.log("ENVIANDO BUSQUEDA DE FAMILIA:", texto)
                    const res = await fetch(`/traerConceptoCompra?buscar=${encodeURIComponent(texto)}`);
                    const conceptoCompra = await res.json();
                    console.log("RESULTADOS FAMILIA:",conceptoCompra);

                    if (conceptoCompra.length === 0) {
                        resultadoConceptoCompraDiv.innerHTML = "<p>No se encontraron resultados<p>";
                        return;
                    }

                    resultadoConceptoCompraDiv.innerHTML = conceptoCompra.map(f =>
                        `<div>
                        <button onclick='seleccionarConceptoCompra(${JSON.stringify(f)})'>
                        ${f.conceptoCompra}
                        </button>
                        </div>`
                    ).join("");
                } catch (error) {
                    console.error("Error en la busqueda", error);
                    resultadoConceptoCompraDiv.innerHTML = "<p>Error en la busqueda<p>";
                }
            }, 400);
        });
    }
}

function seleccionarConceptoCompra(conceptoCompra) {
    console.log("FAMILIA SELECCIONADA:", conceptoCompra);
    const contenedorConceptoCompra = document.getElementById("contenedorConceptoCompra");
    if(!contenedorConceptoCompra){
        console.error("Contenedor familia no encontrado");
        return;
    }

    const fila = document.createElement("div");
    fila.classList.add("fila");

    fila.innerHTML= `
        <input type="text" value="${conceptoCompra.conceptoCompra}" readonly>
        <input type="text" placeholder="Comentario" class="comentario" value="">
        <button class="btn-remove">X</button>
        `;

    fila.querySelector(".btn-remove").addEventListener("click", () => fila.remove());
    contenedorConceptoCompra.appendChild(fila);

    //LIMPIAR RESULTADOS DE BUSQUEDA
    const resultadosConceptoCompraDiv = document.getElementById("resultadosConceptoCompraModal");
    const inputBuscarConceptoCompra = document.getElementById("buscarConceptoCompraModal");
    const modal = document.getElementById("modalConceptoCompra");

    if(resultadosConceptoCompraDiv) resultadosConceptoCompraDiv.innerHTML = "";
    if(inputBuscarConceptoCompra) inputBuscarConceptoCompra.value ="";
    if(modal) modal.style.display = "none";

}

//FUNCION GENERAL PARA CERRARL EL MODEL 
function cerrarModal(modal){
    if(modal){
        modal.style.display = "none";
    }
}

//CERRAR FUERA DEL CONTENIDO 
window.addEventListener("click", (event) => {
    if(event.target.classList.contains('modal')){
        cerrarModal(event.target);
    }
});

function inicializarGuardado(){
    const btnGuardar = document.getElementById("guardarBtn");
    if(btnGuardar){
        btnGuardar.addEventListener("click", async () => {
            const contenedorPersonal = document.getElementById("contenedorPersonal");
            const contenedorConceptoCompra = document.getElementById("contenedorConceptoCompra");

            if(!contenedorPersonal || !contenedorConceptoCompra){
                console.error("Contenedores no encontrados");
                return;
            }
            
            //GUARDAR LA DESCRIPCION 
            const descripcion = document.getElementById("descripcionConceptoCompras").value.trim();


            const data = {
                descripcion,
                personal : [],
                conceptoCompras: []
            };

            console.log("INICIANDO PROCESO DE GUARDADO");

            const filasPersonal = contenedorPersonal.querySelectorAll(".fila");
            console.log("Filas de personal encontradas:", filasPersonal.length);

            if(filasPersonal.length == 0){
                alert("ERROR: Debe seleccionar al menos un personal");
                return;
            }

            filasPersonal.forEach((fila,index) => {
                const inputs = fila.querySelectorAll("input");
                if(inputs.length >= 4){
                    const personalData = {
                        nombre: inputs[0].value.trim(),
                        aPaterno: inputs[1].value.trim(),
                        aMaterno: inputs[2].value.trim(),
                        comentario: inputs[3].value.trim()
                    };

                    if(!personalData.nombre || !personalData.aPaterno || !personalData.aMaterno){
                        alert(`ERROR: El perosnal${index + 1} tiene campos obligatorios vacios`);
                        return;
                    }
                    console.log(`Personal ${index + 1}:`, personalData);
                    data.personal.push(personalData);
                }
            });

            //VERIFICACION 2: OBTENER Y VALIDAR FAMILIAS
            const filasConceptoCompra = contenedorConceptoCompra.querySelectorAll(".fila");
            console.log("Filas de Cocepto Compras encontradas:", filasConceptoCompra.length);

            if(filasConceptoCompra.length == 0){
                alert("ERROR: Debe seleccionar al menos con una familia");
                return;
            }

            filasConceptoCompra.forEach((fila,index) => {
                const inputs = fila.querySelectorAll("input");
                if(inputs.length >= 2){
                    const conceptoCompraData = {
                        conceptoCompra: inputs[0].value.trim(),
                        comentario: inputs[1].value.trim()
                    };
                    //VERIFICAR QUE EL CONCEPTO NO ESTE VACIO
                    if(!conceptoCompraData.conceptoCompra){
                        alert(`ERROR: Concepto Compras  ${index + 1} no tiene concepto`);
                        return;
                    }
                    console.log(`Concepto Compra ${index + 1}:`, conceptoCompraData);
                    data.conceptoCompras.push(conceptoCompraData);
                }
            });
            //VERIFICACION FINAL
            console.log("Resumen final:");
            console.log("- Personal a guardar:", data.personal.length);
            console.log("- ConceptoCompras a guardar:", data.conceptoCompras.length);
            console.log("DATA COMPLETA", data);

            //VERIFICACION EXTRA POR SI ALGUN RETURN NO SE EJECUTO
            if(data.personal.length == 0 || data.conceptoCompras.length == 0){
                alert("ERROR: Debe tener al menos un personal y una familia para guardar");
                return;
            }

            try{
                console.log("Enviando datos del servidor...");
                const res = await fetch('/solicitudCompra', {
                    method: 'POST',
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(data)
                });

                if(!res.ok){
                    const erroText = await res.text();
                    throw new Error(`Error del servidor: ${erroText}`);
                }

                const result = await res.json();
                console.log("Respuesta del servidor: ", result);

                if(result.success){
                    alert(`${result.message}\nID: ${result.id}\nPersonal: ${result.personalGuardado}\nConcepto Compra: ${result.coceptoComprasGuardadas}`);
                    //OPCIONAL: LIMPIAR LOS CONTENEDORES DESPUES DE GUARDAR
                    contenedorPersonal.innerHTML = "";
                    contenedorConceptoCompra.innerHTML = "";
                }else {
                    alert(`${result.message}`);
                }
            }catch(error){
                console.error("Error al guardar:", error);
                alert("Error al guardar la solicitud: " + error.message);
            }
        });
    }
}

//FUNCION PARA TRAER LAS SOLCIITUDES GUARDADAS
//LISTASOLICITUDCOMPRA.HTML=========================================
async function cargarSolicitudes() {
    const contenedor = document.getElementById('contenedorSolicitudes'); // CORREGIDO
    contenedor.innerHTML = "<p>Cargando Solicitudes...</p>";

    try {
        const res = await fetch('/solicitudes');
        const solicitudes = await res.json();

        if (solicitudes.length == 0) {
            contenedor.innerHTML = "<p>No hay solicitudes registradas</p>";
            return;
        }

        contenedor.innerHTML = solicitudes.map(s => {
            const personalHTML = s.personal.map(p =>
                `<li>${p.nombre} ${p.aPaterno} ${p.aMaterno} - Comentario: ${p.comentario}</li>`
            ).join('');
            const familiaHTML = s.familias.map(f =>
                `<li>${f.concepto} - Comentario: ${f.comentario}</li>`
            ).join('');

            return `
            <div class="solicitud">
                <h2>Solicitud #${s.id}</h2>
                <p>Fecha: ${new Date(s.fechaCreacion).toLocaleDateString()}</p>

                <div class="section">
                    <strong>Personal</strong>
                    <ul>${personalHTML}</ul>
                </div>

                <div class="section">
                    <strong>Familias</strong>
                    <ul>${familiaHTML}</ul>
                </div>

                <div class="acciones">
                    <button id="editarSolcitud" onclick="editarSolicitud(${s.id})">Editar</button>
                    <button  onclick="eliminarSolicitud(${s.id})">Eliminar</button>
                </div>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        contenedor.innerHTML = "<p>Error al cargar solicitudes</p>";
    }
}

//FUNCION PARA ELIMINAR 
async function eliminarSolicitud(id) {
    if(!confirm(`¿Seguro que deseas eliminar la solicitud #${id}?`)) return;

    try {
        const res = await fetch(`/solicitudCompra/${id}`, {
            method: 'DELETE'
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            // Eliminar del DOM
            const elem = document.getElementById(`solicitud-${id}`);
            if(elem) elem.remove();
        } else {
            alert(result.message);
        }
    } catch(error){
        console.error(error);
        alert("Error al eliminar la solicitud");
    }
}


//FUNCION PARA EDITAR 

async function editarSolicitud(id) {
    const modal = document.getElementById("modalEditar");
    modal.style.display = "block";

    const resultadoEditar = document.getElementById("resultadoEditar");
    resultadoEditar.innerHTML =`<p>Editando la solicitdud: #${id}</p>`;

    const contenedorEditar = document.getElementById("contenedorEditar");

    try{
        const res = await fetch(`/solicitudes/${id}`);

        if(!res.ok){
            contenedorEditar.innerHTML ="<p>No se encontro la solicitud</p>";
            return;
        }

        const solicitudEditar = await res.json();
        const personal = solicitudEditar.personal[0] || {};
        const familia = solicitudEditar.familias[0] || {};

        contenedorEditar.innerHTML = `
            <form id="formEditar">
                <label>Nombre:</label>
                <input type="text" id="editNombre" value="${personal.nombre || ''}">
                <br>

                <label>Apellido Paterno:</label>
                <input type="text" id="editAPaterno" value="${personal.aPaterno || ''}">
                <br>

                <label>Apellido Materno:</label>
                <input type="text" id="editAMaterno" value="${personal.aMaterno || ''}">
                <br>

                <label>Comentario (personal):</label>
                <input type="text" id="editComentarioPersonal" value="${personal.comentario || ''}">
                <br><br>

                <label>Concepto (familia):</label>
                <input type="text" id="editConcepto" value="${familia.concepto || ''}">
                <br>

                <label>Comentario (familia):</label>
                <input type="text" id="editComentarioFamilia" value="${familia.comentario || ''}">
                <br><br>

                <button type="button" onclick="guardarCambios(${id})">Guardar cambios</button>
            </from>
        `;
    }catch(error){
        console.error("ERROR: No se encontro la solicitud");
    }
}
 //CERRAR MODAL 
document.addEventListener("DOMContentLoaded", () => {
        const modal = document.getElementById("modalEditar");
        const cerrarBtn = document.getElementById("cerrarModal");
        const closeSpan = document.querySelector(".close");

        cerrarBtn.addEventListener("click", () => cerrarModal(modal));
        closeSpan.addEventListener("click", () => cerrarModal(modal));
    })
//CARGAR AL PRINCIPIO DE LA PAGINA
document.addEventListener('DOMContentLoaded', cargarSolicitudes);