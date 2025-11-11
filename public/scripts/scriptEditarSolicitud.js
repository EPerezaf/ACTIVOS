//OBTENER EL PARAMETRO "ID" DE LA URL 
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let solicitudActual = null; //VARIABLE GLOBAL PARA ALMACENAR LA SOLICITUD

//FUNCION PARA OBTENER EL TOKEN 
function getAuthHeaders(){
    const token = localStorage.getItem("token");
    if(!token){
        //REDIRIGIR AL LOGIN SI NO HAY TOKEN
        window.location.href = "/html/index.html";
        return {};
    }
    return{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token || !role){
        window.location.href = "/html/index.html";
        return;
    }

    //VERIFICAR QUE EL ROL TENGA ACCESO A ESTA PAGINA 
    const rolesPermitidos = ["Administrador", "Jefe de Activos",];
    if(!rolesPermitidos.includes(role)){
        alert("No tienes permisos para acceder a esta pagina");
        window.location.href = "/html/index.html";
        return;
    }
});

//CARGAR LA SOLICITUD AL CARGAR LA PAGINA
window.onload = async () => {
    try{
        const headers= getAuthHeaders();
        if(!headers.Authorization){
            return; 
        }

        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudes/${id}`, {
            headers: headers
        });

        //VERIFICAR SI LA RESPUESTA ES 401 (UNAUTHORIZED)
        if(res.status === 401){
            localStorage.removeItem("token")
            localStorage.removeItem("role");
            window.location.href ="/htlm/index.html";
            return;
        }

        if(!res.ok){
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const solicitud = await res.json();
        solicitudActual = solicitud;//GUARDAR LA SOLICITUD

        if(!solicitud){
            alert("Solicitud no encontrada");
            return;
        }

        //VERIFICAR SI LA SOLICITUD ESTA AUTORIZADA
        const estaAutorizada = solicitud.estatusCompras === "Autorizada";

        if(estaAutorizada){
            deshabilitarEdicion();
            mostrarMensajeSoloLectura();
        }

        //RELLENAR LOS CAMPOS DEL FORMULARIO
        document.getElementById("id").value = solicitud.id;
        document.getElementById("estatus").value = solicitud.estatusCompras;
        document.getElementById("clasificacion").value = solicitud.clasificacionCompras;
        document.getElementById("descripcion").value = solicitud.descripcionConceptoCompra;
        

        //HACER CAMPOS DE SOLO LECTURA SI ESTA AUTORIZADA
        if(estaAutorizada){
            document.getElementById("clasificacion").readOnly = true;
            document.getElementById("descripcion").readOnly = true;
        }

        //MOSTRAR LISTAS
        const listaPersonal = document.getElementById("listaPersonal");
        //VERIFICAR SI EXISTE Y ES UN ARRAY
        if(solicitud.personal && Array.isArray(solicitud.personal)){
            console.log("Personal encontrados: ", solicitud.personal);
            listaPersonal.innerHTML ="";
            solicitud.personal.forEach(f => {
                const filaPersonal = document.createElement("div");
                filaPersonal.classList.add("fila");
                filaPersonal.innerHTML =`
                    <input type="text" value="${f.nombre || ''}" readonly>
                    <input type="text" value="${f.aPaterno || ''}" readonly>
                    <input type="text" value="${f.aMaterno || ''}" readonly>
                    <button type="button" class="btn-remove">X</button>
                    <br>
                    
                `;
                if(!estaAutorizada){
                    const btnRemove = filaPersonal.querySelector(".btn-remove");
                    btnRemove.addEventListener("click", function(){
                        console.log("Eliminado personal: ", f.nombre);
                        filaPersonal.remove();
                    });
                }

                listaPersonal.appendChild(filaPersonal);
            })
        }
        //APARTADO DE CONCEPTO ACTIVO
        const listaConceptos = document.getElementById("listaConcepto");
        //VERIFICAR SI EXISTE Y ES UN ARRAY
        if(solicitud.conceptoActivo && Array.isArray(solicitud.conceptoActivo)){
            console.log("Conceptos encontrados: ", solicitud.conceptoActivo);
            listaConceptos.innerHTML = "";
            solicitud.conceptoActivo.forEach(p => {
                const filaConcepto = document.createElement("div");
                filaConcepto.classList.add("fila");
                filaConcepto.innerHTML = `
                    <input type="text" value="${p.sc_cca_familia || ''}" readonly>
                    <input type="text" value="${p.sc_cca_subFamilia || ''}" readonly>
                    <input type="text" value="${p.sc_cca_descripcion || ''}" readonly>
                    <button type="button" class="btn-remove">X</button>
                    <br>
                `;
                
                if(!estaAutorizada){
                    const btnRemove = filaConcepto.querySelector(".btn-remove");
                    btnRemove.addEventListener("click", function(){
                        console.log("Eliminado el concepto: ", p.sc_cca_descripcion);
                        filaConcepto.remove();
                    })
                }

                listaConceptos.appendChild(filaConcepto);
            })
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

                if(!estaAutorizada){
                    const btnRemove = fila.querySelector(".btn-remove");
                    btnRemove.addEventListener("click", function() {
                        console.log("Eliminando proveedor:", j.nickname);
                        fila.remove();
                    });
                }

                listaProveedores.appendChild(fila);
            });
        }else{
            console.log("No hay proveedores o el campo esta vacio");
            listaProveedores.innerHTML= '<p>NO hay proveedores agregados</p>';
        }
        if(!estaAutorizada){
            document.getElementById("btnProceso").addEventListener("click", actualizarProceso);
        }else{
            //OCULTAR BOTON DE ACCION SI ESTA AUTORIAZADA
            document.getElementById("btnProceso").style.display = "none";
        }

    }catch(error){
        console.error("Error al cargar solicitud:", error);
        alert("Error al cargar la solciitud seleccionada");
    }
};

// FUNCIÓN PARA DESHABILITAR TODA LA EDICIÓN Y MOSTRAR BOTÓN DE REGISTRAR ACTIVO
function deshabilitarEdicion() {
    console.log("Deshabilitando edición - Solicitud autorizada");
    
    // 1. Ocultar todos los botones existentes
    ocultarTodosLosBotones();
    
    // 2. Crear y mostrar el botón de "Registrar Activo"
    crearBotonRegistrarActivo();
    
    // 3. Cambiar título
    const titulos = document.querySelectorAll('h1, h2');
    if (titulos) {
        Array.from(titulos).forEach(titulo => {
            if (titulo.textContent.includes('Editar') || titulo.textContent.includes('Modificar')) {
                titulo.textContent = 'Visualizar Solicitud (Autorizada)';
                titulo.style.color = '#28a745';
            }
        });
    }
    
    // 4. Hacer inputs editables de solo lectura
    const inputsEditables = document.querySelectorAll('input:not([readonly]), textarea:not([readonly]), select:not([readonly])');
    if (inputsEditables) {
        Array.from(inputsEditables).forEach(input => {
            input.readOnly = true;
            input.disabled = true;
            input.style.backgroundColor = '#f8f9fa';
            input.style.cursor = 'not-allowed';
        });
    }
    
    // 5. Deshabilitar formulario completo (pero permitir el nuevo botón)
    const form = document.getElementById("formEditarSolicitud");
    if (form) {
        form.style.opacity = '0.9';
    }
    
    console.log("Edición deshabilitada - Botón Registrar Activo mostrado");
}

// FUNCIÓN PARA OCULTAR TODOS LOS BOTONES EXISTENTES
function ocultarTodosLosBotones() {
    // Ocultar elementos por ID
    const idsOcultar = [
        "abrirPersonal", "abrirConcepto", "abrirProveedores",
        "btnProceso", "btnGuardar", "abrirBusqueda", "btn-Guardar"
    ];
    
    idsOcultar.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.display = 'none';
            elemento.disabled = true;
        }
    });
    
    // Ocultar botones por clase
    /*const clasesOcultar = ['.btn-remove', '.btn-eliminar', '.btn-editar', '.btn-proceso'];
    
    clasesOcultar.forEach(clase => {
        const elementos = document.querySelectorAll(clase);
        Array.from(elementos).forEach(elemento => {
            elemento.style.display = 'none';
            elemento.disabled = true;
        });
    });*/
    const botonesEliminar = document.querySelector(".btn-remove");
    if(botonesEliminar){
        Array.from(botonesEliminar).forEach(boton => {
            boton.style.display = 'none';
            boton.disabled = true;
        });
    }
    
    // Ocultar cualquier botón en secciones de acciones
    const seccionesAcciones = document.querySelectorAll('.acciones, .action-buttons, .form-actions');
    Array.from(seccionesAcciones).forEach(seccion => {
        const botones = seccion.querySelectorAll('button, input[type="button"], input[type="submit"]');
        Array.from(botones).forEach(boton => {
            boton.style.display = 'none';
            boton.disabled = true;
        });
    });
}

// FUNCIÓN PARA CREAR EL BOTÓN DE REGISTRAR ACTIVO
function crearBotonRegistrarActivo() {
    // Verificar si ya existe el botón
    if (document.getElementById('btnRegistrarActivo')) {
        return;
    }
    
    // Crear contenedor para el botón
    const contenedorBotones = document.createElement('div');
    contenedorBotones.className = 'acciones-autorizadas';
    contenedorBotones.style.cssText = `
        text-align: center;
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 2px dashed #28a745;
    `;
    
    // Crear el botón
    const btnRegistrar = document.createElement('button');
    btnRegistrar.id = 'btnRegistrarActivo';
    btnRegistrar.textContent = '📦 Registrar Activo';
    btnRegistrar.style.cssText = `
        padding: 12px 24px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    // Agregar efectos hover
    btnRegistrar.onmouseover = function() {
        this.style.backgroundColor = '#218838';
        this.style.transform = 'scale(1.05)';
    };
    
    btnRegistrar.onmouseout = function() {
        this.style.backgroundColor = '#28a745';
        this.style.transform = 'scale(1)';
    };
    
    // Agregar funcionalidad al botón
    btnRegistrar.onclick = function() {
        registrarActivo();
    };
    
    // Agregar mensaje informativo
    const mensajeInfo = document.createElement('p');
    mensajeInfo.textContent = 'Esta solicitud está autorizada. Puede proceder a registrar el activo.';
    mensajeInfo.style.cssText = `
        color: #155724;
        margin-bottom: 10px;
        font-style: italic;
    `;
    
    // Construir el contenedor
    contenedorBotones.appendChild(mensajeInfo);
    contenedorBotones.appendChild(btnRegistrar);
    
    // Insertar en la página (buscar el mejor lugar)
    const posiblesContenedores = [
        document.querySelector('.acciones'),
        document.querySelector('.form-actions'),
        document.getElementById('formEditarSolicitud'),
        document.querySelector('form')
    ];
    
    let contenedorEncontrado = null;
    for (const contenedor of posiblesContenedores) {
        if (contenedor) {
            contenedorEncontrado = contenedor;
            break;
        }
    }
    
    if (contenedorEncontrado) {
        contenedorEncontrado.appendChild(contenedorBotones);
    } else {
        // Si no encuentra contenedor, agregar al final del body
        document.body.appendChild(contenedorBotones);
    }
    
    console.log("Botón Registrar Activo creado");
}

// FUNCIÓN PARA REGISTRAR EL ACTIVO (debes implementar según tus necesidades)
function registrarActivo() {
    console.log("Iniciando proceso de registro de activo...");
    
    // Aquí va tu lógica para registrar el activo
    // Por ejemplo:
    
    // 1. Obtener datos de la solicitud actual
    const datosSolicitud = {
        id: solicitudActual.id,
        conceptoActivo: solicitudActual.conceptoActivo,
        proveedores: solicitudActual.proveedores,
        // ... otros datos que necesites
    };
    
    console.log("Datos para registrar activo:", datosSolicitud);
    
    // 2. Mostrar confirmación
    if (confirm('¿Está seguro de que desea registrar este activo en el sistema de inventario?')) {
        // 3. Redirigir a la página de registro de activos
        // window.location.href = `/html/registroActivo.html?id=${solicitudActual.id}`;
        
        // O mostrar un mensaje temporal
        alert('Redirigiendo al sistema de registro de activos...');
        
        // 4. Aquí puedes hacer una petición a tu API para registrar el activo
        // registrarActivoEnSistema(datosSolicitud);
        
    }
}

// FUNCIÓN AUXILIAR PARA OCULTAR ELEMENTOS
function ocultarElemento(id) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.style.display = 'none';
        elemento.disabled = true;
    }
}

// FUNCIÓN PARA MOSTRAR MENSAJE DE SOLO LECTURA (ACTUALIZADA)
function mostrarMensajeSoloLectura() {
    try {
        if (document.getElementById('mensajeSoloLectura')) {
            return;
        }
        
        const mensaje = document.createElement('div');
        mensaje.id = 'mensajeSoloLectura';
        mensaje.style.cssText = `
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            margin: 15px 0;
            border: 2px solid #c3e6cb;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        `;
        
        let infoAutorizacion = '';
        if (solicitudActual && solicitudActual.fechaAutorizacion) {
            const fechaAuth = new Date(solicitudActual.fechaAutorizacion).toLocaleDateString();
            infoAutorizacion = `<br><small>Autorizada el: ${fechaAuth}</small>`;
        }
        
        mensaje.innerHTML = `
            <span style="font-size: 18px;">✓ SOLICITUD AUTORIZADA</span><br>
            Esta solicitud está autorizada y no puede ser modificada.
            Proceda a registrar el activo en el sistema de inventario.
            ${infoAutorizacion}
        `;
        
        const contenedorPrincipal = document.querySelector('.container, main, body');
        if (contenedorPrincipal) {
            contenedorPrincipal.insertBefore(mensaje, contenedorPrincipal.firstChild);
        }
        
    } catch (error) {
        console.error("Error al mostrar mensaje de solo lectura:", error);
    }
}

/*// FUNCIÓN PARA DESHABILITAR TODA LA EDICIÓN (VERSIÓN CORREGIDA)
function deshabilitarEdicion() {
    console.log("Deshabilitando edición - Solicitud autorizada");
    const btnRegistro = document.createElement("div");

    btnRegistro.innerHTML = "<button>Entrada Activo</button>";
    
    // 1. Deshabilitar elementos por ID (forma segura)
    const idsDeshabilitar = [
        "abrirPersonal", "abrirConcepto", "abrirProveedores",
        "btnProceso", "btn-Guardar", "abrirBusqueda", ".btn-remove", 
    ];
    
    idsDeshabilitar.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.style.display = 'none';
            elemento.disabled = true;
        }
    });
    
    // 2. Deshabilitar botones de eliminar (forma segura con NodeList)
    const botonesEliminar = document.querySelectorAll('.btn-remove');
    if (botonesEliminar) {
        // Convertir NodeList a Array para usar forEach de forma segura
        Array.from(botonesEliminar).forEach(boton => {
            boton.style.display = 'none';
            boton.disabled = true;
        });
    }
    
    // 3. Cambiar título (forma segura)
    const titulos = document.querySelectorAll('h1, h2');
    if (titulos) {
        // Usar Array.from para convertir NodeList a Array
        Array.from(titulos).forEach(titulo => {
            if (titulo.textContent.includes('Editar') || titulo.textContent.includes('Modificar')) {
                titulo.textContent = 'Visualizar Solicitud (Autorizada)';
                titulo.style.color = '#28a745';
            }
        });
    }
    
    // 4. Hacer inputs editables de solo lectura (forma segura)
    const inputsEditables = document.querySelectorAll('input:not([readonly]), textarea:not([readonly])');
    if (inputsEditables) {
        Array.from(inputsEditables).forEach(input => {
            input.readOnly = true;
            input.style.backgroundColor = '#f8f9fa';
            input.style.cursor = 'not-allowed';
        });
    }
    
    // 5. Deshabilitar formulario completo
    const form = document.getElementById("formEditarSolicitud");
    if (form) {
        form.style.pointerEvents = 'none';
        form.style.opacity = '0.8';
    }
    
    console.log("Edición deshabilitada completamente");
}

// FUNCIÓN PARA MOSTRAR MENSAJE DE SOLO LECTURA (CORREGIDA)
function mostrarMensajeSoloLectura() {
    try {
        // Verificar si ya existe un mensaje
        if (document.getElementById('mensajeSoloLectura')) {
            return;
        }
        
        const mensaje = document.createElement('div');
        mensaje.id = 'mensajeSoloLectura';
        mensaje.style.cssText = `
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            margin: 15px 0;
            border: 2px solid #c3e6cb;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        `;
        
        // Agregar información de autorización si está disponible
        let infoAutorizacion = '';
        if (solicitudActual && solicitudActual.fechaAutorizacion) {
            const fechaAuth = new Date(solicitudActual.fechaAutorizacion).toLocaleDateString();
            infoAutorizacion = `<br><small>Autorizada el: ${fechaAuth}</small>`;
        }
        
        mensaje.innerHTML = `
            <span style="font-size: 18px;">✓ SOLO LECTURA</span><br>
            Esta solicitud está autorizada y no puede ser modificada
            ${infoAutorizacion}
        `;
        
        // Insertar el mensaje
        const contenedorPrincipal = document.querySelector('.container, main, body');
        if (contenedorPrincipal) {
            contenedorPrincipal.insertBefore(mensaje, contenedorPrincipal.firstChild);
        }
        
    } catch (error) {
        console.error("Error al mostrar mensaje de solo lectura:", error);
    }
}*/

//FUNCION PARA ACTUALIZAR SOLO EL ESTATUS A PROCESO
async function actualizarProceso() {
    if(!confirm("¿Estas Seguro de cambiar el estatus a 'Proceso'?")){
        return;
    }

    try{
        const data = {
            estatusCompras: 'Proceso'
        };

        const headers = getAuthHeaders();
        if(!headers.Authorization){
            return;
        }

        const url = `/api/routeListaSolicitudCompra/solicitudCompra/${id}/proceso`;
        const res = await fetch(url,{
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data)
        });

        //VERIFICAR SI LA RESPUESTA ES 401 (UNAUTHORIZED)
        if(res.status === 401){
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/html/index.html";
            return;
        }

        const result = await res.json();
        if(result.success){
            alert("Solciitud actualizada correctamente a Proceso");
            window.location.href = "/html/listaSolicitudCompras.html";
        }else {
            alert("Error al actualizar la solicitud: "+ (result.message || "Error desconocido"));
        }
    }catch(error){
        console.error("Error al cambiar a proceso:", error);
        alert("Error al conectar con el servidor");
    }
}

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

        const headers = getAuthHeaders();
        if(!headers.Authorization){
            return;
        }

        const url =`/api/routeListaSolicitudCompra/solicitudCompra/${id}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data)
        });

        //VERIFICAR SI LA RESPUESTA ES 401 (UNAUTHORIZED)
        if(res.status === 401){
            localStorage.removeItem("token")
            localStorage.removeItem("role");
            window.location.href = "/html/index.html";
            return;
        }

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
                    const res = await fetch(`/api/routePersonal/traerPersonal?buscar=${encodeURIComponent(texto)}`,{
                        headers: getAuthHeaders()
                    });
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
                    const res = await fetch(`/api/routeConceptoActivos/buscarActivo?buscar=${encodeURIComponent(texto)}`, {
                        headers: getAuthHeaders()
                    });
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
                    const res = await fetch(`/api/routeProveedor/buscarProveedores?buscar=${encodeURIComponent(texto)}`,{
                        headers: getAuthHeaders()
                    });
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