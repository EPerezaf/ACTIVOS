const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.addEventListener("DOMContentLoaded", () => {
    //AUTENTICACION DE ROLES PERMITIDOS PARA LA PAGINA
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token || !role){
        window.location.href = "/html/index.html";
        return;
    }
    //VERIFICACION QUE EL ROL TENGA ACCESO A ESTA PAGINA
    const rolesPermitidos = ["Administrador", "Jefe de Activos"];
    if(!rolesPermitidos.includes(role)){
        alert("No tienes permisos para acceder a esta pagina");
        window.location.href = "/html/index.html";
        return;
    }

    if(!id) return;

    async function cargarPersonal() {
        try{
            const res = await fetch(`/api/routeListaPersonal/listaPersonal/${id}`);
            const personal = await res.json();

            if(!personal){
                alert("Personal no encontrado");
                return;
            }

            document.title= "Editar Personal";

            document.getElementById("estatusPersonal").value = personal.estatusPersonal;
            document.getElementById("nombre").value = personal.nombre;
            document.getElementById("aPaterno").value = personal.aPaterno;
            document.getElementById("aMaterno").value = personal.aMaterno;
            document.getElementById("p_curp").value = personal.p_curp;
            document.getElementById("p_ciudad").value = personal.p_ciudad;
            document.getElementById("p_estado").value = personal.p_estado;
            document.getElementById("p_edad").value = personal.p_edad;
            document.getElementById("btnGuardar").textContent = "Actualizar Personal";
        }catch(e){
            console.error("Hubo un error al cargar el personal: ", e);
            alert("Error al cargar el personal");
        }
    }
    cargarPersonal();
})

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
        const p_curp = document.getElementById('p_curp').value;
        const p_ciudad = document.getElementById('p_ciudad').value;
        const p_estado = document.getElementById('p_estado').value;
        const p_edad = document.getElementById('p_edad').value;

        if (!estatusPersonal) {
            alert("Debes seleccionar un estatus");
            return;
        }
        if (!nombre || !aPaterno || !aMaterno || !p_curp || !p_ciudad || !p_estado || !p_edad) {
            alert("Debes rellenar el campo")
            return;
        }
        try{
            const method = id ? 'PUT' : 'POST';
            const url = id
                ? `/api/routeListaPersonal/listaPersonal/${id}`
                : '/api/routePersonal/personal';

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estatusPersonal, nombre, aPaterno, aMaterno, p_curp, p_ciudad, p_estado, p_edad })
            });

            const result = await res.json();
            alert(result.message || "Guardado correctamente");
            formPersonal.reset();
            if(result.success){
                window.location.href = "/html/listaPersonal.html";
            }
        }catch(e){
            console.error("Error al guardar: ", e);
            alert("No se pudo guardar el registro");
        }
    })
}

