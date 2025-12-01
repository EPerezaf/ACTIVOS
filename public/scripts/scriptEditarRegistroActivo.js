const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.addEventListener("DOMContentLoaded", () => {
    if(id){
        console.log("Entrando al script");
    }
    async function incializarActivo () {
            try{
            const res = await fetch(`/api/routeRegistroActivo/listaActivo/${id}`);

            if(res.status === 401){
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                window.location.href = "/html/index.html";
                return;
            }

            if(!res.ok){
                throw new Error (`Error ${res.status}: ${res.statusText}`);
            }

            const solicitud = await res.json();

            //RELLENAR LOS CAMPOS 
            document.getElementById("estatus").value = solicitud.estatus;
            document.getElementById("familia").value = solicitud.familia;
            document.getElementById("subFamilia").value = solicitud.subFamilia;
            document.getElementById("conceptoActivo").value = solicitud.conceptoActivo;
            document.getElementById("nomenclatura").value = solicitud.nomenclatura;
            document.getElementById("marca").value = solicitud.marca;
            document.getElementById("modelo").value = solicitud.modelo;
            document.getElementById("descripcionAdicional").value = solicitud.descripcionAdicional;
            document.getElementById("costo").value = solicitud.costo;
            document.getElementById("numSerie").value = solicitud.numSerie;
            document.getElementById("idSolicitud").value = solicitud.idSolicitud;
            document.getElementById("estatus").value = solicitud.estatus;
        }catch(error){
            console.error("Error al cargar el Activo: ", error);
            alert("Error al cargar la solicitud de Activo");
        }
    }
    incializarActivo();
});

const btnGuardar = document.getElementById("btnGuardar");
if(btnGuardar){
    btnGuardar.addEventListener("click",  guardarActivo);
}


async function guardarActivo (e){
    e.preventDefault();
    try{
        
        const estatus = document.getElementById("estatus").value;
        const nomenclatura = document.getElementById("nomenclatura").value;
        const marca = document.getElementById("marca").value;
        const modelo = document.getElementById("modelo").value;
        const descripcionAdicional = document.getElementById("descripcionAdicional").value;
        const costo = document.getElementById("costo").value;
        const numSerie = document.getElementById("numSerie").value;

        data = {
            estatus,
            nomenclatura,
            marca,
            modelo,
            descripcionAdicional,
            costo,
            numSerie
        }
        

        const res = await fetch(`/api/routeRegistroActivo/listaActivo/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.message || "Actualizado correctamente");
        if(result.success){
            window.location.href = "/html/listaRegistroActivo.html";
        }
    }catch(error){
        console.error("Error al actualizar el Activo: ", error);
        res.status(500).json({
            message: error,
            success: false
        });
    }
}