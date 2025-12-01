//REGISTRO DE CONCEPTO GASTO 
const formConceptoGasto = document.getElementById('formConceptoGasto');
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.addEventListener("DOMContentLoaded", function (){
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if(!token || !role){
        window.location.href = "/html/index.html";
        return;
    }

    const rolesPermitidos = ["Administrador", "Jefe de Activos"];
    if(!rolesPermitidos.includes(role)){
        alert("NO tienes permisos para acceder a esta pagina");
        window.location.href ="/html/index.html";
        return;
    }
});

window.onload = async () => {
    if(!id) return; 

    try{
        const res = await fetch(`/api/routeListaConceptoGasto/listaConcepto/${id}`);
        const concepto = await res.json();

        if(!concepto){
            alert("Concepto no encontrado");
            return;
        }
        document.getElementById("estatusGasto").value = concepto.estatus;
        document.getElementById("conceptoGasto").value = concepto.conceptoGasto;

        document.getElementById("btnGuardar").textContent="Actulizar Concepto";
    }catch(error){
        console.error("Error al cargar concepto ", error);
        alert("Error al cargar el concepto");
    }
}

if (formConceptoGasto) {
    formConceptoGasto.addEventListener('submit', async e => {
        e.preventDefault();

        const estatus = document.getElementById('estatusGasto').value;
        const conceptoGasto = document.getElementById('conceptoGasto').value;
        const data ={
            estatus,
            conceptoGasto
        }
        try{
            let url = `/api/routeConceptoGasto/conceptoGasto`
            let method = 'POST';

            if(id){
                url = `/api/routeListaConceptoGasto/listaConcepto/${id}/actualizar`;
                method = 'PUT';
            }
            console.log("Metodo a ejecutar: ", method);
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type' : 'application/json'},
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if(result.success !== false){
                alert(id ? "Concepto Actualizada correctamente": "Concepto Guardado Correctamente");
                window.location.href = "/html/listaConceptoGasto.html";
            }else{
                alert("Error: "+ result.message);
            }
            formConceptoGasto.reset();
        }catch(error){
            console.error("Error al gaurdar o actualizar concepto gasto", error);
        }
    });
}