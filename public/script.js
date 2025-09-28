const formulario = document.getElementById('formulario');
if (formulario) {
    formulario.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(formulario);
        const data = {
            estatus: formData.get('estatus'),
            concepto: formData.get('concepto')
        };

        const response = await fetch('/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
        formulario.reset();
    })
}


//AGREGAR CONCEPTOFAMILIA 
const familiaConcepto = document.getElementById('familiaConcepto');
if (familiaConcepto) {
    familiaConcepto.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(familiaConcepto);
        const data = {
            estatus: formData.get('estatus'),
            descripcion: formData.get('descripcion')
        };

        const response = await fetch('/guardarConceptoFamilia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
    })
}

//AGREGAR CONCEPTO SUB FAMILIA
const Consubfamilia = document.getElementById('ConSubFamilia');
if (Consubfamilia) {
    Consubfamilia.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(Consubfamilia);
        const data = {
            estatus: formData.get('estatus'),
            concepto: formData.get('concepto')
        };

        const response = await fetch('/guardarSubFamilia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.message);
    })
}

//AGREGAR CONCEPTO COMPRAS
const concepCompras = document.getElementById('concepCompras');
if (concepCompras) {
    concepCompras.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(concepCompras);
        const data = {
            estatus: formData.get('estatus'),
            concepto: formData.get('concepto')
        };
        const response = await fetch('/guardarConceptoCompras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.message);
        concepCompras.reset();
    })
}


//AGREGAR USUARIO A LA PLATAFORMA
const Rpersonal = document.getElementById('Rpersonal');
if (Rpersonal) {
    Rpersonal.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(Rpersonal);
        const data = {
            estatus: formData.get('estatus'),
            nombre: formData.get('nombre'),
            aPaterno: formData.get('aPaterno'),
            aMaterno: formData.get('aMaterno'),
            fechaNacimiento: formData.get('fechaNacimiento')
        };

        try {
            const response = await fetch('/guardarUsuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            alert(result.message);
            Rpersonal.reset();
        } catch (error) {
            console.error("Error al enviar", error);
            alert("ocurrio un error al registrar al usuario.");
        }
    });
}

//CARGAR DATOS EN LOS SELECT 
async function cargarUsuariosSelect() {
    const response = await fetch('/usuarios');
    const usuarios = await response.json();

    const lista = document.getElementById('listaUsuarios');
    lista.innerHTML = '<option value="">Seleccione un usuario </option>';

    usuarios.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = `${u.nombre} ${u.aPaterno} ${u.aMaterno}`;
        lista.appendChild(option);
    });
}
document.addEventListener('DOMContentLoaded', cargarUsuariosSelect);
/*
//CARGAR LOS DATOS EN UNA TABLA 
async function cargarUsuariosTabla() {
    const response = await fetch('/usuarios');
    const usuarios = await response.json();

    const tabla = document.getElementById('tablaUsuarios');
    tabla.innerHTML = "";

    usuarios.forEach(u => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
        <td>${u.id}</td>
        <td>${u.estatus}</td>
        <td>${u.nombre}</td>
        <td>${u.aPaterno}</td>
        <td>${u.aMaterno}</td>
        <td>${new Date(u.fechaNacimiento).toLocaleDateString()}</td>
        `;

        tabla.appendChild(fila);

    });
}
document.addEventListener('DOMContentLoaded', cargarUsuariosTabla);

//CARGAR TABLA Y ELIMINAR DATOS DE USUARIOS
async function cargarEliminarUsuario() {
    const response = await fetch('/usuarios');
    const usuarios = await response.json();

    const tabla = document.getElementById('tablaUsuarios');
    tabla.innerHTML = "";

    usuarios.forEach(u => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${u.id}</td>
            <td>${u.nombre}</td>
            <td>${u.aPaterno}</td>
            <td>${u.aMaterno}</td>
            <td>${u.estatus}</td>
            <td><button>Eliminar</button></td>
            `;

            const btnEliminar = fila.querySelector('button');
            btnEliminar.addEventListener('click', () => eliminarUsuario(u._id));

            tabla.appendChild(fila);
    });
}

async function eliminarUsuario(id){
    if(!confirm('Seguro que quieres eliminar este usuario?')) return;

    try{
        const response = await fetch(`/usuarios/${id}`,{
            method: 'DELETE'
        });
        const result = await response.json();
        alert(result.message);
        cargarEliminarUsuario(); 
    }catch(error){
        console.error('Error al eliminar:', error);
        alert('Ocurrio un problema al intentar borrar un usuario');
    }
}

document.addEventListener('DOMContentLoaded',cargarEliminarUsuario);*/

//BARRA DE BUSQUEDA
const tabla = document.getElementById("tablaUsuarios");
const inputBuscar = document.getElementById("busquedaUsuarios");
let timeout = null;


//Funcion para renderizar usuaruis en la tabla
function renderUsuarios(usuarios) {
    tabla.innerHTML = "";

    if (usuarios.length == 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
        <td colspan = "6" style="text-align:center; color: red;"> No se encontraron resultados </td>
        `;

        tabla.appendChild(fila);
        return;
    }


    usuarios.forEach(u => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${u.id}</td>
            <td>${u.nombre}</td>
            <td>${u.aPaterno}</td>
            <td>${u.aMaterno}</td>
            <td>${u.estatus}</td>
            <td><button>Eliminar</button></td>
            <td><button>Seleccionar </button></td>
        `;

        //const btnEliminar = fila.querySelector("button");
        //btnEliminar.addEventListener("click", () => eliminarUsuario(u._id));

        const btnSeleccionar = fila.querySelector("button");
        btnSeleccionar.addEventListener("click", () => seleccionarUsuario(u));
        tabla.appendChild(fila);
    });
}

//CARGAR USUARIOS DESDE EL SERVIDOR (CON O SIN BUSQUEDA)
async function cargarUsuario(busqueda = "") {
    console.log("buscando:", busqueda);
    const response = await fetch(`/usuarios?buscar=${encodeURIComponent(busqueda)}`);
    const usuarios = await response.json();
    //renderUsuarios(usuarios);
    renderResultados(usuarios);
}

//ELIMINAR 
async function eliminarUsuario(id) {
    if (!confirm("Seguro que queires eliminar este usuario")) return;
    try {
        const response = await fetch(`/usuarios/${id}`, { method: "DELETE" });
        const result = await response.json();
        alert(result.message);
        cargarUsuario(inputBuscar.value);
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Ocurrio un problema al intentar borrar este usuario");
    }
}

//BUSQUEDA EN TIEMPO REAL CON DEBUNCE
inputBuscar.addEventListener("input", () => {
    console.log("Escribiendo:", inputBuscar.value);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        cargarUsuario(inputBuscar.value);
    }, 400);
});

//TABLA DE PRUEBADATOS.HTML 
const tablaResultados = document.getElementById("tablaResultados");

const inputNombre = document.getElementById("nombre");
const inputAPaterno = document.getElementById("aPaterno");
const inputAMaterno = document.getElementById("aMaterno");
const inputComentario = document.getElementById("comentario");

let usuarioSeleccionado = null;

function renderResultados(usuarios) {
    tablaResultados.innerHTML = "";

    if (usuarios.length == 0) {
        tablaResultados.innerHTML = `<tr><td colspan="4"> No se encuentra resultados </td></tr>`;
        tablaResultados.appendChild(fila);
        return;
    }

    usuarios.forEach(u => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.aPaterno}</td>
        <td>${u.aMaterno}</td>
        <td>${u.estatus}</td>
        <td><button>Seleccionar</button></td>
        `;

        const btnSeleccionar = fila.querySelector("button")
        btnSeleccionar.addEventListener("click", () => seleccionarUsuario(u));

        tablaResultados.appendChild(fila);
    });
}
//PONERLOS EN LOS INPUTS DE PRUEBADATOS.HTML
function seleccionarUsuario(usuario) {
    usuarioSeleccionado = usuario;
    inputNombre.value = usuario.nombre;
    inputAPaterno.value = usuario.aPaterno;
    inputAMaterno.value = usuario.aMaterno;
}

//GUARDAR COMENTARIO EN OTRA TABLA
const traerComentario = document.getElementById("formComentario");
if (traerComentario) {
    traerComentario.addEventListener("submit", async e => {
    e.preventDefault();
    if (!usuarioSeleccionado) {
        alert("Primero selecciona un usuario");
        return;
    }

    const data = {
        //usuarioId: usuarioSeleccionado._id,
        //comentario: inputComentario.value
        nombre: usuarioSeleccionado.nombre,
        aPaterno: usuarioSeleccionado.aPaterno,
        aMaterno: usuarioSeleccionado.aMaterno,
        comentario: inputComentario.value
    };

    const response = await fetch("/comentarios", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message);

    inputComentario.value = "";
    traerComentario.reset();

});
}

document.addEventListener("DOMContentLoaded", () => cargarUsuario());

/*PRUEBA FUNCIONAL DE TRAER Y SELECCIONAR PERSONAL Y FAMILIA*/

//---------------------------------
/*const modal = document.getElementById("modalBusqueda");
const abrirBtn = document.getElementById("abrirBusqueda");
const cerrarBtn = document.getElementById("cerrarModal");
const closeSpan = document.getElementById(".close");

//ABRIR MODAL
abrirBtn.addEventListener("click", () =>{
    modal.style.display = "block";
})

//CERRAR MODAL
cerrarBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

closeSpan.addEventListener("click", () => {
    modal.style.display = "none";
});

//CERRAR MODAL AL HACER CLICK FUERA DEL CONTENIDO
window.addEventListener("click", (event) => {
    if(event.target === modal){
        modal.style.display = "none";
    }
});

//------------------------------------



const inputBuscar = document.getElementById("buscarPersonal");
const resultadosDiv = document.getElementById("resultadosBusqueda");
const contenedor = document.getElementById("contenedorPersonal");
const btnGuardar = document.getElementById("guardarBtn");

let timeout =null;

//BUSCADOR EN TIEMPO REAL 
inputBuscar.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const texto = inputBuscar.value.trim();
        if(!texto){
            resultadosDiv.innerHTML = "";
            return;
        }
        
        const res = await fetch(`/traerPersonal?buscar=${encodeURIComponent(texto)}`);
        const usuarios = await res.json();

        if(usuarios.length == 0){
            resultadosDiv.innerHTML = "<p>No se encontraron resultados<p>";
            return;
        }

        resultadosDiv.innerHTML =usuarios.map(u =>
            `<div>
            <button onclick='seleccionarPersonal(${JSON.stringify(u)})'>
            ${u.nombre} ${u.aPaterno} ${u.aMaterno}
            </button>
            </div>`
        ).join("");
    }, 400);
});

//SELECCIONAR USUARIO Y AGREGARLO A INPUTS
function seleccionarPersonal(usuario) {
    const fila = document.createElement("div");
    fila.classList.add("fila");

    fila.innerHTML = `
        <input type="text" value="${usuario.nombre}" readonly>
        <input type="text" value="${usuario.aPaterno}" readonly>
        <input type="text" value="${usuario.aMaterno}" readonly>
        <input type="number" placeholder="Salario" class="salario">
        <button class="btn-remove">X</button>
        `;
    //BOTON PARA ELIMINAR
    fila.querySelector(".btn-remove").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);
    resultadosDiv.innerHTML = "";
    inputBuscar.value ="";

    //CERRAR MODAL DESPUES DE SELECCION
    modal.style.display = "none";
}

//GUARDAR EN MODELO 
btnGuardar.addEventListener("click", async () =>{
    const filas = contenedor.querySelectorAll(".fila");
    const data = [];

    filas.forEach(fila => {
        const inputs = fila.querySelectorAll("input");
        if(inputs.length >= 4){
            data.push({
                nombre: inputs[0].value,
                aPaterno: inputs[1].value,
                aMaterno: inputs[2].value,
                comentario: inputs[3].value,
            });
        }
    });

    console.log("DATA A ENVIAR, ", data);

    const res = await fetch("/solicitudCompra",{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result= await res.json();
    alert(result.message || "GUARDADO CORRECTAMENTE");
    
});

const buscarFamilia = document.getElementById("buscarFamilia");
const resultadoFamilia = document.getElementById("resultadosFamilia");

buscarFamilia.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const conceptoFamilia = buscarFamilia.value.trim();
        if(!conceptoFamilia){
            resultadoFamilia.innerHTML = "";
            return;
        }

        try{
            const res = await fetch(`/traerFamilia?buscar=${encodeURIComponent(conceptoFamilia)}`);
            const familias = await res.json();

            if(familias.length == 0){
                resultadoFamilia.innerHTML = "<p> No se encontraron resultados<p>";
                return;
            }
            resultadoFamilia.innerHTML = familias.map(f =>
                `<div>
                <button onclick='seleccionarFamilia(${JSON.stringify(f)})'>
                ${f.concepto}
                </button>
                </div>`
            ).join("");
        }catch(error){
            console.error("Error en la busqueda", error);
            resultadoFamilia.innerHTML = "<p>Errr en la busqueda<p>";
        }
    }, 400);
});*/ 