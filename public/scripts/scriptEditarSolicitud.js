//OBTENER EL PARAMETRO "ID" DE LA URL 
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

//CARGAR LA SOLICITUD AL CARGAR LA PAGINA
window.onload = async () => {
    try{
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudes/${id}`);
        const solicitud = await res.json();

        if(!solicitud){
            alert("Solicitud no encontrada");
            return;
        }

        //RELLENAR LOS CAMPOS DEL FORMULARIO
        document.getElementById("id").value = solicitud.id;
        document.getElementById("estatus").value = solicitud.estatusCompras;
        document.getElementById("clasificacion").value = solicitud.clasificacionCompras;
        document.getElementById("descripcion").value = solicitud.descripcionConceptoCompra;

        //MOSTRAR LISTAS
        const listaPersonal = document.getElementById("listaPersonal");
        const filaPersonal = document.createElement("div");
        filaPersonal.classList.add("fila");
        filaPersonal.innerHTML = solicitud.personal.map(f => 
            `
            <input type="text" value="${f.nombre}" readonly>
            <input type="text" value="${f.aPaterno}" readonly>
            <input type="text" value="${f.aMaterno}" readonly>
            <button type="button" class="btn-remove">X</button>
            <br>`
            

        ).join('');
        filaPersonal.querySelector(".btn-remove").addEventListener("click", () => filaPersonal.remove());
        listaPersonal.appendChild(filaPersonal);


        //APARTADO DE CONCEPTO ACTIVO
        const listaConceptos = document.getElementById("listaConcepto");
        //VERIFICAR SI EXISTE Y ES UN ARRAY
        if(Array.isArray(solicitud.conceptoActivo) && solicitud.conceptoActivo.length > 0){
            console.log("Concepto encontrados: ", solicitud.conceptoActivo);
            const filaConcepto = document.createElement("div");
            filaConcepto.classList.add("fila");
            filaConcepto.innerHTML = solicitud.conceptoActivo.map(p => 
                filaConcepto.innerHTML = `
                    <input type="text" value="${p.sc_cca_familia || ''}" readonly>
                    <input type="text" value="${p.sc_cca_subFamilia || ''}" readonly>
                    <input type="text" value="${p.sc_cca_descripcion || ''}" readonly>
                    <button type="button" class="btn-remove">X</button>
                    <br>
                `
            ).join("");

            const btnRemove = filaConcepto.querySelector(".btn-remove");
                btnRemove.addEventListener("click", function() {
                    console.log("Eliminando Concepto: ", p.sc_cca_descripcion);
                    filaConcepto.remove();
                });
            listaConceptos.appendChild(filaConcepto);
        }

        const listaProveedores = document.getElementById("listaProveedores");
        //VERIFICAR SI EXISTE Y ES UN ARRAY
        if(solicitud.proveedores && Array.isArray(solicitud.proveedores) && solicitud.proveedores.length > 0){
            console.log("Proveedores encontrados: ", solicitud.proveedores);
            listaProveedores.innerHTML = ""; //LIMPIAR CONTENEDOR
            solicitud.proveedores.forEach(j => {
                const fila = document.createElement("div");
                fila.classList.add("fila");
                fila.innerHTML = `
                    <input type="text" value="${j.razonSocial || ''}" readonly>
                    <input type="text" value="${j.nickname || ''}" readonly>
                    <label>Costo: $</label>
                    <input type="text" value="${j.sc_monto || ''}" readonly>
                    <button type="button" class="btn-remove">x</button>
                `;

                const btnRemove = fila.querySelector(".btn-remove");
                btnRemove.addEventListener("click", function() {
                    console.log("Eliminando proveedor:", j.nickname);
                    fila.remove();
                });

                listaProveedores.appendChild(fila);
            });
        }else{
            console.log("No hay proveedores o el campo esta vacio");
            listaProveedores.innerHTML= '<p>NO hay proveedores agregados</p>';
        }


    }catch(error){
        console.error("Error al cargar solicitud:", error);
        alert("Error al cargar la solciitud seleccionada");
    }
};

document.getElementById("formEditarSolicitud").addEventListener("submit", async (e) => {
    e.preventDefault();
    const contenedorPersonal = document.getElementById("listaPersonal");
    const contenedorConcepto = document.getElementById("listaConcepto");
    const contenedorProveedor = document.getElementById("listaProveedores");

    if(!contenedorPersonal || !contenedorConcepto || !contenedorProveedor) {
        console.error ("Contenedores no encontrados");
        return;
    }

    //GUARDAR INFORMACION NO EXTRAIDA
    const estatusCompras = document.getElementById("estatus");
    const clasificacionCompras = document.getElementById("clasificacion");
    const descripcion = document.getElementById("descripcion");

    const data = {
        estatusCompras: estatusCompras.value.trim(),
        clasificacionCompras: clasificacionCompras.value.trim(),
        descripcionConceptoCompra: descripcion.value.trim(),
        personal: [],
        conceptoActivo: [],
        proveedores: [],
        
    };

    console.log("INICIANDO PROCESO DE GUARDADO");

    const filasPersonal = contenedorPersonal.querySelectorAll(".fila");
    console.log("Fila de Personal encontradas: ", filasPersonal.length);
    if(filasPersonal.length === 0){
        alert("ERROR: No se puede hacer cambios con campos vacios del personal");
        return;
    }
    filasPersonal.forEach((fila,index) => {
        const inputs = fila.querySelectorAll("input");
        if(inputs.length >=3){
            const personalData = {
                nombre: inputs[0].value.trim(),
                aPaterno: inputs[1].value.trim(),
                aMaterno: inputs[2].value.trim()
            };

            if(!personalData.nombre || !personalData.aPaterno || !personalData.aMaterno){
                alert(`ERROR: No ha seleccionado ningun personal ${index +1} `);
                return;
            }
            console.log(`Personal ${index +1}: `, personalData);
            data.personal.push(personalData);
        }
    });

    //VERIFICACION DE CONCEPTO ACTIVO
    const filasConcepto = contenedorConcepto.querySelectorAll(".fila");
    console.log("Fila de Concepto Activo encontradas: ", filasConcepto.length);
    if(filasConcepto.length === 0){
        alert("ERROR: No se puede hacer cambios sin seleccionar al menos un activo");
        return;
    }
    filasConcepto.forEach((fila,index) => {
        const inputs = fila.querySelectorAll("input");
        if(inputs.length >=3 ){
            const conceptoData ={
                sc_cca_familia: inputs[0].value.trim(),
                sc_cca_subFamilia: inputs[1].value.trim(),
                sc_cca_descripcion: inputs[2].value.trim()
            };
            //VERIFICACION QUE EL CONCEPTO NO ESTE VACIO
            if(!conceptoData.sc_cca_familia || !conceptoData.sc_cca_subFamilia || !conceptoData.sc_cca_descripcion){
                alert(`ERROR: Concepto de Activos no puede estar vacio`);
                return;
            }
            console.log(`Concepto de Activos ${index + 1}: `, conceptoData);
            data.conceptoActivo.push(conceptoData);
        }
    });

    //VERIFICACION 3: PROVEEDOR
    const filasProveedor = contenedorProveedor.querySelectorAll(".fila");

    for(const fila of filasProveedor){
        const inputs = fila.querySelectorAll("input");
        const monto = inputs[2].value.trim();
        if(monto === "" || isNaN(Number(monto))){
            alert("Por favor, ingresa un monto para el proveedor");
            return;
        }
    }

    console.log("Fila de Proveedor encontradas: ", filasProveedor.length);
    if(filasProveedor.length === 0){
        console.error("ERROR: No se puede hacer cambios sin seleccionar al menos un proveeedor");
        return;
    }

    filasProveedor.forEach((fila,index) => {
        const inputs = fila.querySelectorAll("input");
        if(inputs.length >= 3){
            const proveedorData = {
                razonSocial: inputs[0].value.trim(),
                nickname: inputs[1].value.trim(),
                sc_monto: inputs[2].value.trim()
            };
            if(!proveedorData.razonSocial || !proveedorData.nickname || !proveedorData.sc_monto){
                alert(`ERROR: Proveedores no puede estar vacio`);
                return;
            }
            console.log(`Proveedor ${index + 1}: `,proveedorData);
            data.proveedores.push(proveedorData);
        }
    });
    try{
        console.log("Enviando datos al servidor...");
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if(result.success) {
            alert("Solicitud actualizada correctamente");
            window.location.href ="/html/listaSolicitudCompras.html";
        }else {
            alert("Error al actualizar la solicitud");
        }
    }catch(error){
        console.log("Error al guardar los datos", error);
    }
    
});

let timeout = null;

function verificarElementos() {
    const elementosVerificados = [
        'modalProveedores', 'abrirProveedores', 'cerrarProveedor', 
        'buscarProveedor', 'resultadoProveedoresModal', 'listaProveedores',
        'modalPersonal', 'abrirPersonal', 'cerrarPersonal',
        'buscarPersonal', 'resultadoPersonalModal', 'listaPersonal'
    ];

    elementosVerificados.forEach(id => {
        const elemento = document.getElementById(id);
        if(!elemento) {
            console.error(`Elemento con ID '${id}' no encontrado`);
        }
    });
}

//INICIALIZAR 
document.addEventListener('DOMContentLoaded', function () {
    verificarElementos();
    inicializarPersonal();
    inicializarProveedor();
    inicializarConceptoActivo();
});

function inicializarPersonal(){
    const modal = document.getElementById("modalPersonal");
    const abrirBtn = document.getElementById("abrirPersonal");
    const cerrarBtn = document.getElementById("cerrarPersonal");
    const closeSpan = document.querySelector(".close");

    if(!modal || !abrirBtn || !cerrarBtn || !closeSpan){
        console.error("Elementos del modal no encontrados");
        return;
    }

    //ABRIR MODAL 
    abrirBtn.addEventListener("click", () => {
        modal.style.display = "block";

        const buscarPersonal = document.getElementById("buscarPersonal");
        const resultadoPersonal = document.getElementById("resultadoPersonalModal");

        if(buscarPersonal) buscarPersonal.value ="";
        if(resultadoPersonal) resultadoPersonal.innerHTML ="";
    });

    //CERRAR MODAL
    cerrarBtn.addEventListener("click", () => cerrarModal(modal));
    closeSpan.addEventListener("click", () => cerrarModal(modal));

    //BUSQUEDA DE PERSONAL 
    const inputBuscarPersonal = document.getElementById("buscarPersonal");
    const resultadoPersonalDiv = document.getElementById("resultadoPersonalModal");

    if(inputBuscarPersonal && resultadoPersonalDiv) {
        inputBuscarPersonal.addEventListener("input", (e) => {
            console.log(`Busacndo Personal: `, e.target.value);
        });

        inputBuscarPersonal.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout( async () => {
                const texto = inputBuscarPersonal.value.trim();
                if(!texto) {
                    resultadoPersonalDiv.innerHTML ="";
                    return;
                }
                try{
                    const res = await fetch(`/api/routePersonal/traerPersonal?buscar=${encodeURIComponent(texto)}`);
                    const usuarios = await res.json();

                    if(usuarios.length === 0 ) {
                        resultadoPersonalDiv.innerHTML = "<p>No se encontraron personal</p>";
                        return;
                    }

                    resultadoPersonalDiv.innerHTML = usuarios.map(u => 
                        `<div>
                            <button onclick='seleccionarPersonal(${JSON.stringify(u)})'>
                            ${u.nombre} ${u.aPaterno} ${u.aMaterno}
                            </button>
                        </div>`
                    ).join("");
                }catch(error){
                    console.error("Error en la busqueda", error);
                    resultadoPersonalDiv.innerHTML="<p>Error en la busqueda</p>";
                }
            }, 400);
        })
    }
}

function seleccionarPersonal(usuario){
    console.log("Pesonal seleccionado: ", usuario);
    const contenedor = document.getElementById("listaPersonal");
    if(!contenedor){
        console.error("Contenedor personal no encontrado");
        return;
    }

    const fila = document.createElement("div");
    fila.classList.add("fila");

    fila.innerHTML=`
        <input type="text" value="${usuario.nombre}" readonly>
        <input type="text" value="${usuario.aPaterno}" readonly>
        <input type="text" value="${usuario.aMaterno}" readonly>
        <button class="btn-remove">X</button>
        `;

    fila.querySelector(".btn-remove").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);

    //LIMPIAR RESULTADOS DE BUSQUEDA
    const resultadosPersonalDiv= document.getElementById("resultadoPersonalModal");
    const inputBuscarPersonal = document.getElementById("buscarPersonal");
    const modal = document.getElementById("modalPersonal");

    if(resultadosPersonalDiv) resultadosPersonalDiv.innerHTML = "";
    if(inputBuscarPersonal) inputBuscarPersonal.value = "";
    if(modal) modal.style.display = "none";
}

function inicializarConceptoActivo(){
    const modal = document.getElementById("modalConcepto");
    const abrirBtn = document.getElementById("abrirConcepto");
    const cerrarBtn = document.getElementById("cerrarConcepto");
    const closeSapn = document.querySelector(".close");

    if(!modal || !abrirBtn || !cerrarBtn || !closeSapn) {
        console.error("Elementos del modal no encontrados");
        return;
    }

    //ABRIR MODAL 
    abrirBtn.addEventListener("click", () => {
        modal.style.display = "block";
        //LIMPIAR BUSQUEDA AL ABRIR
        const buscarConcepto = document.getElementById("buscarConcepto");
        const resultadoConcepto = document.getElementById("resultadoConceptoModal");
        if(buscarConcepto) buscarConcepto.value ="";
        if(resultadoConcepto) resultadoConcepto.innerHTML ="";
    })

    //CERRAR MODAL 
    cerrarBtn.addEventListener("click", () => cerrarModal(modal));
    closeSapn.addEventListener("click", () => cerrarModal(modal));

    //BUSQUEDA DE COCEPTOS
    const inputBuscarConcepto = document.getElementById("buscarConcepto");
    const resultadoConceptoDiv = document.getElementById("resultadoConceptoModal");

    if(inputBuscarConcepto && resultadoConceptoDiv) {
        inputBuscarConcepto.addEventListener("input", (e) => {
            console.log('Buscando Concepto: ', e.target.value);
        });

        inputBuscarConcepto.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout( async () => {
                const texto = inputBuscarConcepto.value.trim();
                if(!texto) {
                    resultadoConceptoDiv.innerHTML ="";
                    return;
                }
                try{
                    const res = await fetch(`/api/routeConceptoActivos/buscarActivo?buscar=${encodeURIComponent(texto)}`);
                    const activo = await res.json();

                    if(activo.length === 0) {
                        resultadoConceptoDiv.innerHTML = "<p>No se encontraron resultados de Activos</p>";
                        return;
                    }
                    resultadoConceptoDiv.innerHTML = activo.map(u => 
                        `<div>
                            <button onclick='seleccionarConcepto(${JSON.stringify(u)})'>
                                ${u.conceptoActivos}
                            </button>
                        </div>`
                    ).join('');
                }catch(error) {
                    console.error("Error en la busqueda de activos: ", error);
                    resultadoConceptoDiv.innerHTML = "<p>Error en la busqueda de activos</p>";
                }
            });
        });
    }
}

function seleccionarConcepto(activo){
    console.log("Activo Seleccionado: ", activo);
    const contenedor = document.getElementById("listaConcepto");
    if(!contenedor){
        console.error("Contenedor para Concepto Activos no encontrado");
        return;
    }

    const filaConcepto = document.createElement("div");
    filaConcepto.classList.add("fila");

    filaConcepto.innerHTML = `
        <input type="text" value="${activo.conceptoFamilia}" readonly>
        <input type="text" value="${activo.conceptoSubFamilia}" readonly>
        <input type="text" value="${activo.conceptoActivos}" readonly>
        <button class="btn-remove">X</button>
    `;

    filaConcepto.querySelector(".btn-remove").addEventListener("clik", () => filaConcepto.remove());
    contenedor.appendChild(filaConcepto);

    //LIMPIAR RESULTADOS DE BUSQUEAD
    const resultadoConceptoDiv = document.getElementById("resultadoConcepto");
    const inputConcepto = document.getElementById("buscarConceptoModal");
    const modal = document.getElementById("modalConcepto");

    if(resultadoConceptoDiv) resultadoConceptoDiv.value ="";
    if(inputConcepto) inputConcepto.innerHTML ="";
    if(modal) modal.style.display = "none";
}

function inicializarProveedor() {
    const modal = document.getElementById("modalProveedores");
    const abrirBtn = document.getElementById("abrirProveedores");
    const cerrarBtn = document.getElementById("cerrarProveedor");
    const closeSpan = document.querySelector(".close");

    if(!modal || !abrirBtn || !cerrarBtn || !closeSpan) {
        console.error("Elementos del modal no encontrados");
        return;
    }

    //ABRIR MODAL
    abrirBtn.addEventListener("click", () => {
        modal.style.display ="block";
        //LIMPIAR BUSQUEDA AL ABRIR
        const buscarProveedor = document.getElementById("buscarProveedor");
        const resultadoProveedor = document.getElementById("resultadoProveedoresModal");

        if(buscarProveedor) buscarProveedor.value = "";
        if(resultadoProveedor) resultadoProveedor.innerHTML = "";
    });

    //CERRAR MODAL
    cerrarBtn.addEventListener("click", () => cerrarModal(modal));
    closeSpan.addEventListener("click", () => cerrarModal(modal));

    //BUSQUEDA DE PROVEEDOR
    const inputBuscarProveedor = document.getElementById("buscarProveedor");
    const resultadoProveedorDiv = document.getElementById("resultadoProveedoresModal");

    if(inputBuscarProveedor && resultadoProveedorDiv) {
        inputBuscarProveedor.addEventListener("input", (e) => {
            console.log(`Buscando proveedor: `, e.target.value);
        });

        inputBuscarProveedor.addEventListener("input", () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                const texto = inputBuscarProveedor.value.trim();
                if(!texto) {
                    resultadoProveedorDiv.innerHTML = "";
                    return;
                }
                try{
                    const res = await fetch(`/api/routeProveedor/buscarProveedores?buscar=${encodeURIComponent(texto)}`);
                    const proveedor = await res.json();

                    if(proveedor.length === 0) {
                        resultadoProveedorDiv.innerHTML = '<p>No se encontraron proveedores</p>';
                        return;
                    }
                    resultadoProveedorDiv.innerHTML = proveedor.map(u => 
                        `<div>
                            <button onclick='seleccionarProveedor(${JSON.stringify(u)})'>
                            ${u.nickName} ${u.razonSocial} ${u.rfc}
                            </button>
                        </div>`
                    ).join('');
                }catch(error) {
                    console.error('Error en la busqueda', error);
                    resultadoProveedorDiv.innerHTML = '<p>Error en la busqueda de Proveedores</p>';
                }
            }), 400;
        });
    }
}

function seleccionarProveedor(proveedor) {
    console.log("Proveedor seleccionado: ", proveedor);
    const contenedor = document.getElementById("listaProveedores");
    if(!contenedor) {
        console.error("Contenedor proveedor no encontrado");
        return;
    }

    const fila = document.createElement("div");
    fila.classList.add("fila");

    fila.innerHTML = `
        <input type="text" value="${proveedor.razonSocial}" readonly>
        <input type="text" value="${proveedor.nickName}" readonly>
        <input type="text" value="">
        <button class="btn-remove">X</button>
    `;

    fila.querySelector(".btn-remove").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);

    //LIMPIAR RESULTADOS DE BUSQUEDA
    const resultadoProveedorDiv = document.getElementById("resultadoProveedoresModal");
    const inputBuscarProveedor = document.getElementById("buscarProveedor");
    const modal = document.getElementById("modalProveedores");

    if(resultadoProveedorDiv) resultadoProveedorDiv.innerHTML ="";
    if(inputBuscarProveedor) inputBuscarProveedor.value = "";
    if(modal) modal.style.display = "none";
}

//FUNCION GENERAL PARA CERRAR EL MODAL
function cerrarModal(modal){
    if(modal){
        modal.style.display = "none";
    }
}

//CERRAR FUERA DEL MODAL CON CLICK
window.addEventListener("click", () => {
    if(event.target.classList.contains('modal')){
        cerrarModal(event.target);
    }
});