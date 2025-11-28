//COMPRASACTIVOS.HTML
//CODIGO PARA IMPLEMENTAR LA BUSQUEDA Y SELECCIONADO DE PERSONAL, CONCEPTO COMPRAS, PROVEEDOR 

//=======VARIABLE LOCAL========//
let timeout = null;

//VERIFICAR DE ELEMNTOS EN EL DOM 
function verificarElementos() {
    const elementosVerificados = [
        'modalBusqueda', 'modalConceptoActivos', 'modalProveedores',
        'abrirBusqueda', 'abrirBusquedaActivos', 'abrirProveedores',
        'cerrarModal', 'cerrarModalActivos', 'cerrarModalProveedores',
        'buscarPersonalModal', 'resultadosBusquedaModal', 'buscarProveedores',
        'buscarActivoModal', 'resultadosActivoModal', 'resultadoProveedoresModal',
        'contenedorPersonal', 'contenedorConceptoActivo', 'contenedorProveedores','guardarBtn'
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
    inicializarConceptoActivo();
    inicializarGuardado();
    inicializarProveedores();
});

function inicializarAplicacion() {
    //FUNCIONALIDAD DE MODAL 
    const modal = document.getElementById("modalBusqueda");
    const abrirBtn = document.getElementById("abrirBusqueda");
    const cerrarBtn = document.getElementById("cerrarModal");
    const closeSpan = document.querySelector("#modalBusqueda .close");

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

                    //FILTRAR SOLO PERSONAL CON ESTATUS
                    const usuariosActivos = usuarios.filter(u =>
                        u.estatusPersonal && u.estatusPersonal.toLowerCase() === "alta"
                    );

                    console.log(`Personal encontrado: ${usuarios.length}, Activos: ${usuariosActivos.length}`);

                    if (usuarios.length === 0) {
                        resultadosPersonalDiv.innerHTML = "<p>NO se encontraron resultados<p>";
                        return;
                    }

                    resultadosPersonalDiv.innerHTML = usuarios.map(u =>
                        `<div class="result-item">
                        <button class="btn-buscar-personal" onclick='seleccionarPersonal(${JSON.stringify(u)})'>
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

        <div class="grupo-inputs">
            <div class="input-flotante-contenedor">
                <input type="text" value="${usuario.nombre}" readonly placeholder=" ">
                <label>Nombre</label>
            </div>
            <div class="input-flotante-contenedor">
                <input type="text" value="${usuario.aPaterno}" readonly placeholder=" ">
                <label>Apellido Paterno</label>
            </div>
            <div class="input-flotante-contenedor">
                <input type="text" value="${usuario.aMaterno}" readonly placeholder=" ">
                <label>Apellido Materno</label>
            </div>
            <button class="btn-remove-grupo" onclick="eliminarFila(this)">X</button>
        </div>
    
        
        `;
    
    fila.querySelector(".btn-remove-grupo").addEventListener("click", () => fila.remove());
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
function inicializarConceptoActivo() {
    //FUNCION DE MODAL CONCEPTO COMPRA
    const modal = document.getElementById("modalConceptoActivos");
    const abrirBtn = document.getElementById("abrirBusquedaActivos");
    const cerrarBtn = document.getElementById("cerrarModalActivos");
    const closeSpan = document.querySelector("#modalConceptoActivos .close");

    if(!modal || !abrirBtn || !cerrarBtn || !closeSpan){
        console.error("Elementos del modal no encontrados");
        return;
    }

    //ABRIR MODAL 
    abrirBtn.addEventListener("click", () => {
        modal.style.display = "block";
        const buscarActivo = document.getElementById("buscarActivoModal");
        const resultadoActivo = document.getElementById("resultadosActivoModal");

        if(buscarActivo) buscarActivo.value = "";
        if(resultadoActivo) resultadoActivo.innerHTML = "";
    });

    //CERRAR MODAL
    cerrarBtn.addEventListener("click", () => cerrarModal(modal));
    closeSpan.addEventListener("click", () => cerrarModal(modal));

    //BUSQUEDA DE ACTIVOS
    const inputActivo = document.getElementById("buscarActivoModal");
    const resultadoActivoDiv = document.getElementById("resultadosActivoModal");

    if(inputActivo && resultadoActivoDiv){
        inputActivo.addEventListener("input", (e) => {
            console.log("Buscando Activo: ", e.target.value);
        });

        inputActivo.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const texto = inputActivo.value.trim();
                if(!texto){
                    resultadoActivoDiv.innerHTML ="";
                    return;
                }
                try{
                    const res = await fetch(`/api/routeConceptoActivos/buscarActivo?buscar=${encodeURIComponent(texto)}`);
                    const activo = await res.json();

                    //FILTRAR SOLO CONCEPTOS ACTIVOS CON ESTSTUS "ALTA"
                    const activosActivos = activo.filter(a =>
                        a.estatus && a.estatus.toLowerCase() === "alta"
                    );

                    console.log(`Conceptos encontrados: ${activosActivos.length}, Activos: ${activosActivos.length}`);
                    
                    if(activo.length === 0){
                        resultadoActivoDiv.innerHTML = "<p> NO se encontraron activos</p>";
                        return;
                    }

                    resultadoActivoDiv.innerHTML = activo.map(u => 
                        `<div class="result-item">
                        <button class="btn-buscar-personal" onclick='seleccionarConceptoActivo(${JSON.stringify(u)})'>
                        ${u.conceptoActivos} 
                        </button>
                        
                        </div>`
                    ).join("");
                }catch(error){
                    console.error("Error en la busqueda de activos: ",error);
                    resultadoActivoDiv.innerHTML = "<p>Error en la busqueda de activos</p>";
                }
            }, 400);
        });
    }
}

function seleccionarConceptoActivo(conceptoActivo) {
    console.log("Activo Seleccionado", conceptoActivo);
    const contenedor = document.getElementById("contenedorConceptoActivo");
    if(!contenedor){
        console.error("Contenedor de activos no encontrado");
        return;
    }

    const fila = document.createElement("div");
    fila.classList.add("fila");

    fila.innerHTML= `
        <div class="grupo-inputs">
            <div class="input-flotante-contenedor">
                <input type="text" value="${conceptoActivo.conceptoSubFamilia}" readonly>
                <label>Familia</label>
            </div>
            <div class="input-flotante-contenedor">
                <input type="text" value="${conceptoActivo.conceptoSubFamilia}" readonly>
                <label>Sub Familia</label>
            </div>
            <div class="input-flotante-contenedor">
                <input type="text" value="${conceptoActivo.conceptoActivos}" readonly>
                <label>Concepto Activo</label>
            </div>
            <button class="btn-remove-grupo">X</button>
        </div>
        `;
    
    fila.querySelector(".btn-remove-grupo").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);

    //LIMPIAR RESULTADOS DE BUSQUEDA
    const resultadoActivoDiv = document.getElementById("resultadosActivoModal");
    const inputActivo = document.getElementById("buscarActivoModal");
    const modal = document.getElementById("modalConceptoActivos");

    if(resultadoActivoDiv) resultadoActivoDiv.innerHTML ="";
    if(inputActivo) inputActivo.value="";
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

                    //FILTRAR SOLO PROVEEDORES CON ESTATUS "ALTA"
                    const proveedoresActivos = proveedores.filter(p =>
                        p.estatusProveedor && p.estatusProveedor.toLowerCase() === "alta"
                    );

                    console.log(`Proveedores encontrados: ${proveedores.length}, Activos: ${proveedoresActivos.length}`);

                    if(proveedores.length == 0){
                        resultadosProveedoresDiv.innerHTML = '<p> NO SE ENCONTRARON PROVEEDORES!!</p>';
                        return;
                    }
                    resultadosProveedoresDiv.innerHTML = proveedores.map(u =>
                        `<div class="result-item">
                        <button class="btn-buscar-personal" onclick='seleccionarProveedor(${JSON.stringify(u)})'>
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

        <div class="grupo-inputs">
            <div class="input-flotante-contenedor">
                <input type="text" value="${proveedor.razonSocial}" readonly>
                <label>Razon Social</label>
            </div>
            <div class="input-flotante-contenedor">
                <input type="text" value="${proveedor.nickName}" readonly>
                <label>Nickname</label>
            </div>
            <div class="input-flotante-contenedor">
                <input type="text" placeholder="">
                <label>Monto</label>
            </div>
            <button class="btn-remove-grupo">X</button>
        </div>`;

    fila.querySelector(".btn-remove-grupo").addEventListener("click", () => fila.remove());
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

//FUNCION PARA ELIMINAR FILA 
function eliminarFila(boton){
    const fila = boton.closest('.fila');
    if(fila){
        fila.remove();
    }
}

function inicializarGuardado(){
    const btnGuardar = document.getElementById("guardarBtn");
    if(btnGuardar){
        btnGuardar.addEventListener("click", async () => {
            const contenedorPersonal = document.getElementById("contenedorPersonal");
            const contenedorConceptoActivo = document.getElementById("contenedorConceptoActivo");
            const conetenedorProveedores = document.getElementById("contenedorProveedores");

            if(!contenedorPersonal || !contenedorConceptoActivo || !conetenedorProveedores){
                console.error("Contenedores no encontrados");
                return;
            }
            
            //GUARDAR LA DESCRIPCION 
            const clasificacionCompras= document.getElementById("clasificacionCompras").value.trim();
            const descripcion = document.getElementById("descripcionConceptoCompras").value.trim();
            const sc_seleccionCompra = document.getElementById('sc_seleccionCompra').value.trim();


            const data = {
                clasificacionCompras,
                descripcion,
                personal : [],
                conceptoActivo: [],
                proveedores: [],
                sc_seleccionCompra
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
                if(inputs.length >= 3){
                    const personalData = {
                        nombre: inputs[0].value.trim(),
                        aPaterno: inputs[1].value.trim(),
                        aMaterno: inputs[2].value.trim(),
                    };

                    if(!personalData.nombre || !personalData.aPaterno || !personalData.aMaterno){
                        alert(`ERROR: El personal${index + 1} tiene campos obligatorios vacios`);
                        return;
                    }
                    console.log(`Personal ${index + 1}:`, personalData);
                    data.personal.push(personalData);
                }
            });

            //VERIFICACION 2: OBTENER Y VALIDAR FAMILIAS
            const filasConceptoActivo = contenedorConceptoActivo.querySelectorAll(".fila");
            console.log("Filas de Cocepto Compras encontradas:", filasConceptoActivo.length);

            if(filasConceptoActivo.length == 0){
                alert("ERROR: Debe seleccionar al menos con una familia");
                return;
            }

            filasConceptoActivo.forEach((fila,index) => {
                const inputs = fila.querySelectorAll("input");
                if(inputs.length >= 3){
                    const conceptoActivoData = {
                        sc_cca_familia: inputs[0].value.trim(),
                        sc_cca_subFamilia: inputs[1].value.trim(),
                        sc_cca_descripcion: inputs[2].value.trim()
                    };
                    //VERIFICAR QUE EL CONCEPTO NO ESTE VACIO
                    if(!conceptoActivoData.sc_cca_familia || !conceptoActivoData.sc_cca_subFamilia || !conceptoActivoData.sc_cca_descripcion){
                        alert(`ERROR: Concepto Compras  ${index + 1} no tiene concepto`);
                        return;
                    }
                    console.log(`Concepto Compra ${index + 1}:`, conceptoActivoData);
                    data.conceptoActivo.push(conceptoActivoData);
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
                if(inputs.length >= 3){
                    const ProveedorData = {
                        razonSocial: inputs[0].value.trim(),
                        nickname: inputs[1].value.trim(),
                        sc_monto: inputs[2].value.trim()
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
            console.log("- ConceptoActivo a guardar:", data.conceptoActivo.length);
            console.log("- Proveedores a guardar: ", data.proveedores.length);
            console.log("DATA COMPLETA", data);

            //VERIFICACION EXTRA POR SI ALGUN RETURN NO SE EJECUTO
            if(data.personal.length == 0 || data.conceptoActivo.length == 0 || data.proveedores== 0){
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
                    alert(`${result.message}\nID: ${result.id}\nPersonal: ${result.personalGuardado}\nConcepto Activo: ${result.coceptoActivoGuardadas}\nProveedores: ${result.proveedoresGuardadas}`);
                    //OPCIONAL: LIMPIAR LOS CONTENEDORES DESPUES DE GUARDAR
                    contenedorPersonal.innerHTML = "";
                    contenedorConceptoActivo.innerHTML = "";
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
