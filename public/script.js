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

document.addEventListener('DOMContentLoaded',cargarEliminarUsuario);