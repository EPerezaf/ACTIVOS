//COMPRASACTIVOS.HTML
//CODIGO PARA IMPLEMENTAR LA BUSQUEDA Y SELECCIONADO DE PERSONAL, CONCEPTO COMPRAS, PROVEEDOR 

//=======VARIABLE LOCAL========//
let timeout = null;

//VERIFICAR DE ELEMNTOS EN EL DOM 
function verificarElementos() {
    const elementosVerificados = [
        'modalBusqueda', 'modalConceptoCompra', 'modalProveedores',
        'abrirBusqueda', 'abrirConceptoCompra', 'abrirProveedores',
        'cerrarModal', 'cerrarModalConceptoCompra', 'cerrarModalProveedores',
        'buscarPersonalModal', 'resultadosBusquedaModal', 'buscarProveedores',
        'buscarConceptoCompraModal', 'resultadosConceptoCompraModal', 'resultadoProveedoresModal',
        'contenedorPersonal', 'contenedorConceptoCompra', 'contenedorProveedores','guardarBtn'
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
    inicializarProveedores();
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
                    const res = await fetch(`/api/routePersonal/traerPersonal?buscar=${encodeURIComponent(texto)}`);
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
                    const res = await fetch(`/api/routeConceptoCompra/traerConceptoCompra?buscar=${encodeURIComponent(texto)}`);
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

//INICIALIZAR PROVEEDORES
function inicializarProveedores(){
    //FUNCIONALIDAD DE MODAL
    const modal = document.getElementById("modalProveedores");
    const abrirBtn = document.getElementById("abrirProveedores");
    const cerrarBtn = document.getElementById("cerrarModalProveedores");
    const closeSpan = document.querySelector(".close");

    if(!modal || !abrirBtn || !cerrarBtn || !closeSpan){
        console.log("ELEMENTOS DEL MODAL NO ENCONTRADAS");
        return;
    }

    //ABRIR MODAL
    abrirBtn.addEventListener("click", () => {
        modal.style.display = "block";
        //LIMPIAR BUSQEUDA AL ARBIR
        const buscarProveedores = document.getElementById("buscarProveedores");
        const resultadosProveedores = document.getElementById("resultadoProveedoresModal");

        if(buscarProveedores) buscarProveedores.value= "";
        if(resultadosProveedores) resultadosProveedores.innerHTML = "";

    });

    //CERRAR EL MODAL 
    cerrarBtn.addEventListener("click", () => cerrarModal(modal));
    closeSpan.addEventListener("clcik", () => cerrarModal(modal));

    //BUSQUEDA DE PROVEEDORES
    const inputProveedores = document.getElementById("buscarProveedores");
    const resultadosProveedoresDiv = document.getElementById("resultadoProveedoresModal");

    if(inputProveedores && resultadosProveedoresDiv){
        inputProveedores.addEventListener("input", (e) => {
            console.log("BUSCANDO PROVEEDORES: ", e.target.value);
        });

        inputProveedores.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const texto = inputProveedores.value.trim();
                console.log("BUSCANDO PROVEEDOR CON: ", texto);
                if(!texto){
                    resultadosProveedoresDiv.innerHTML = "";
                    return;
                }
                try{
                    const res = await fetch(`/api/routeProveedor/buscarProveedores?buscar=${encodeURIComponent(texto)}`);
                    const proveedores = await res.json();

                    if(proveedores.length == 0){
                        resultadosProveedoresDiv.innerHTML = '<p> NO SE ENCONTRARON PROVEEDORES!!</p>';
                        return;
                    }
                    resultadosProveedoresDiv.innerHTML = proveedores.map(u =>
                        `<div>
                        <button onclick='seleccionarProveedor(${JSON.stringify(u)})'>
                        ${u.nickName} ${u.razonSocial} ${u.rfc}
                        </button>
                        </div>`
                        
                    ).join("");
                }catch(error){
                    console.error('Error en la busqueda',error);
                    resultadosProveedoresDiv.innerHTML = "<p>ERROR EN LA BUSQUEDA</p>";
                }
            }), 400;
        });
    }
}

//FUNCION DE SELECCION DE PROVEEDOR
function seleccionarProveedor(proveedor){
    console.log("PROVEEDOR SLELECCIONADO: ",proveedor);
    const conetendor = document.getElementById("contenedorProveedores");
    if(!conetendor){
        console.error("CONTENEDOR DE PROVEEDOR NO ENCONTRADO");
        return;
    }
    const fila = document.createElement("div");
    fila.classList.add("fila");

    fila.innerHTML = `
        <input type="text" value="${proveedor.razonSocial}" readonly>
        <input type="text" placeholder="Ingresa el monto" class="costo">
        <button class="btn-remove">X</button>`;

    fila.querySelector(".btn-remove").addEventListener("click", () => fila.remove());
    conetendor.appendChild(fila);

    //LIMPIAR RESULTADOS DE BUSQUEDA
    const resultadosProveedorDiv = document.getElementById("resultadoProveedoresModal");
    const inputBuscarProveedor = document.getElementById("buscarProveedores");
    const modal = document.getElementById("modalProveedores");

    if(resultadosProveedorDiv) resultadosProveedorDiv.value = "";
    if(inputBuscarProveedor) inputBuscarProveedor.innerHTML = "";
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
            const conetenedorProveedores = document.getElementById("contenedorProveedores");

            if(!contenedorPersonal || !contenedorConceptoCompra || !conetenedorProveedores){
                console.error("Contenedores no encontrados");
                return;
            }
            
            //GUARDAR LA DESCRIPCION 
            const clasificacionCompras= document.getElementById("clasificacionCompras").value.trim();
            const descripcion = document.getElementById("descripcionConceptoCompras").value.trim();


            const data = {
                clasificacionCompras,
                descripcion,
                personal : [],
                conceptoCompras: [],
                proveedores: []
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

            //VERIFICACION 3: OBTENER Y VALIDAR PROVEEDORES
            const filasProveedores = conetenedorProveedores.querySelectorAll(".fila");
            console.log("Filas de Proveedores encontradas: ", filasProveedores.length);

            if(filasProveedores.length === 0){
                alert("ERROR. Debe selecccionar al menos un proveedor");
                return;
            }

            filasProveedores.forEach((fila, index) => {
                const inputs = fila.querySelectorAll("input");
                if(inputs.length >= 2){
                    const ProveedorData = {
                        razonSocial: inputs[0].value.trim(),
                        costo: inputs[1].value.trim()
                    };
                    //VERIFICACION QUE EL CONCEPTO NO ESTE VACIO 
                    if(!ProveedorData.razonSocial){
                        alert(`ERROR: Razon Social ${index + 1} no tiene concepto`);
                        return;
                    }
                    console.log(`ERROR: Razon social ${index + 1}:`, ProveedorData);
                    data.proveedores.push(ProveedorData);
                }
            });

            //VERIFICACION FINAL
            console.log("Resumen final:");
            console.log("- Personal a guardar:", data.personal.length);
            console.log("- ConceptoCompras a guardar:", data.conceptoCompras.length);
            console.log("- Proveedores a guardar: ", data.proveedores.length);
            console.log("DATA COMPLETA", data);

            //VERIFICACION EXTRA POR SI ALGUN RETURN NO SE EJECUTO
            if(data.personal.length == 0 || data.conceptoCompras.length == 0 || data.proveedores== 0){
                alert("ERROR: Debe tener al menos un personal y una familia para guardar");
                return;
            }

            try{
                console.log("Enviando datos del servidor...");
                const res = await fetch('/api/routeSolicitudCompra/solicitudCompra', {
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
                    alert(`${result.message}\nID: ${result.id}\nPersonal: ${result.personalGuardado}\nConcepto Compra: ${result.coceptoComprasGuardadas}\nProveedores: ${result.proveedoresGuardadas}`);
                    //OPCIONAL: LIMPIAR LOS CONTENEDORES DESPUES DE GUARDAR
                    contenedorPersonal.innerHTML = "";
                    contenedorConceptoCompra.innerHTML = "";
                    conetenedorProveedores.innerHTML = "";
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
