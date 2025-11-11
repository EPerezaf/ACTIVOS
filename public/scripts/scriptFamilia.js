//REGISTRO DE FAMILIA ACTIVOS
//conceptoFamiliaActivos.html
const formFamilia = document.getElementById('formFamilia');
const params = new URLSearchParams(window.location.search);
const id = params.get("id");


document.addEventListener("DOMContentLoaded", function(){
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
})
window.onload = async () => {
    if(!id) return;

    try{
        const res = await fetch(`/api/routeListaFamilia/listaFamilia/${id}`);
        const familias = await res.json();

        if(!familias){
            alert("Concepto Familia no encontrada");
            return;
        }

        //RELLENAR LOS CAMPOS DEL FORMULARIO
        document.getElementById("estatus").value = familias.estatus;
        document.getElementById("concepto").value = familias.concepto || '';

        //CAMBIAR TEXTO DEL BOTON
        document.getElementById("btnGuardar").textContent="Actualizar Informacion";

    }catch(error) {
        console.error("Error al cargar el concepto de familia ", error);
        alert("Error al cargar el concepto de familia");
    }
}

if (formFamilia) {
    formFamilia.addEventListener('submit', async e => {
        e.preventDefault();
        const estatus = document.getElementById("estatus").value;
        const concepto = document.getElementById("concepto").value;

        const data = {
            estatus,
            concepto
        }

        try{
            let url = '/api/familia/familiaActivos';
            let method = 'POST';

            //SI ESTAMOS EDITANDO, USA PUT
            if(id) {
                url = `/api/routeListaFamilia/listaFamilia/${id}`;
                method = 'PUT';
            }
            console.log("Metodo a ejecutar: ", method);
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(result.success !== false){
                alert(id ? "Familia actualizada correctamente": "Familia creada correctamente");
                window.location.href = "/html/listaFamilia.html";
            }else {
                alert("Error: "+ result.message);
            }
            formFamilia.reset();
        }catch(error){
            console.error("Error al guardar o actualizar familia", error);
        }
    });
}





