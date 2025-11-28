//REGISTRO SUBFAMILIAACTIVOS 
const conceptoSubFamilia = document.getElementById('conceptoSubFamilia');
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

//CARGA LAS FAMILIA DE ACTIVOS EN EL SELECT
async function cargarSelectFamilia() {
    try{
        const response = await fetch('/api/routeSubFamilia/traerFamilia');
        const familias = await response.json();

        const lista = document.getElementById('listaFamilia');
        lista.innerHTML = '<option value="">Seleccione una Familia de Activos</option>';

        //FILTRAR SOLO LAS FAMILIAS CON ESTATUS ALTA
        const familiasActivas = familias.filter(u =>
            u.estatus && u.estatus.toLowerCase() === "alta"
        );

        console.log("Familias Activas: ", familiasActivas);
        console.log("Total de familias: ", familias.length, "Familias activas:", familiasActivas.length);

        if(familiasActivas.length === 0){
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No hay familias activas disponibles";
            option.disabled = true;
            option.selected = true;
            lista.appendChild(option);
            return;
        }

        familiasActivas.forEach(u => {
            const option = document.createElement('option');
            option.value = u.id;
            option.textContent = u.concepto;
            lista.appendChild(option);
        });
    }catch(error){
        console.log("Error al cargar familias: ", error);
        const lista = document.getElementById("listaFamilia");
        lista.innerHTML = '<option value="">Error al cargar familias</option>';
    }
}

window.onload = async () => {
    await cargarSelectFamilia();

    if(!id) return;

    try{
        const res = await fetch(`/api/routeListaSubFamilia/listaSubFamilia/${id}`);
        const subfamilia = await res.json();

        if(!subfamilia){
            alert("Concepto de Sub Familia no encontrada");
            return;
        }

        document.title = "Editar Sub Familia";

        
        //RELLENAR LOS CAMPOS DEL FORMULARIO
        document.getElementById("estatus").value = subfamilia.estatus;
        document.getElementById("conceptoSubFamilia").value = subfamilia.conceptoSubFamilia || '';

        const lista = document.getElementById("listaFamilia");
        const familiaNombre = subfamilia.conceptoFamilia;

        for(const option of lista.options){
            if(option.textContent.trim() === familiaNombre.trim()){
                option.selected = true;
                break;
            }
        }

        console.log("Subfamilia: ",subfamilia);
        console.log("Valor a seleccionar:", subfamilia.listaFamilia);
        console.log("Valor a recibir: ", subfamilia.conceptoFamilia);

        //CAMBIAR TEXTO DEL BOTON 
        document.getElementById("btnGuardar").textContent = "Actualizar Sub Familia";
    }catch(error) {
        console.error("Error al cargar el concepto de Sub Familia",error);
        alert("Error al cargar el concepto");
    }
}

//FORMULARIO PARA GUARDAR SUB FAMILIA 
//conceptoSubFamilia.html
const formSubFamilia = document.getElementById("formSubFamilia");
if (formSubFamilia) {
    formSubFamilia.addEventListener('submit', async e => {
        e.preventDefault();

        const selectFamilia = document.getElementById('listaFamilia');
        const conceptoFamilia = selectFamilia.options[selectFamilia.selectedIndex].text;
        const estatus = document.getElementById('estatus').value;
        const conceptoSubFamilia = document.getElementById('conceptoSubFamilia').value;

        if (!conceptoFamilia) {
            alert("Debes seleccionar una Familia de Activos");
            return;
        }

        data = {
            estatus,
            conceptoFamilia,
            conceptoSubFamilia
        }
        try{
            let url = '/api/routesubFamilia/subFamilia';
            let method = 'POST';

            //SI ESTAMOS EDITANDO 
            if(id){
                url = `/api/routeListaSubFamilia/listaSubFamilia/${id}`;
                method = 'PUT';
            }
            console.log("Metodo a ejecutar: ", method);

            const response = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if(result.success !== false){
                alert(id ? "Sub Familia actualizada correctamente":
                    "Alta de Sub Familia Correctamente"
                );
                window.location.href = "/html/listaSubFamilia.html";
            }else {
                alert("Error: "+result.message);
            }

            formSubFamilia.reset();
        }catch(error){
            console.error("Error al guardar o actualizar sub Familia", error);
        }
    });
}

//document.addEventListener('DOMContentLoaded', cargarSelectFamilia);