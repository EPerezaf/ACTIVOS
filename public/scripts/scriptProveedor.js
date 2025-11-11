
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.addEventListener("DOMContentLoaded", () => {
    //AUTORIZACION PARA ROL DE USUARIOS
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token || !role){
        window.location.href = "/html/index.html";
        return;
    }

    //VERIFICACION QUE EL ROL TENGA ACCESO A ESTA PAGINA
    const rolesPermitidos = ["Administrador","Jefe de Activos"];
    if(!rolesPermitidos.includes(role)){
        alert("No tienes permisos para acceder a esta pagina");
        window.location.href = "/html/index.html";
       return; 
    }
    
    async function incializarProveedor() {
            if(!id) return;
        try{
            const res = await fetch(`/api/routeListaProveedor/listaProveedor/${id}`);
            const solicitud = await res.json();

            if(!solicitud) {
                alert("Proveedor no encontrado");
                return;
            }

            document.title = "Editar Proveedor";

            //RELLENAR CAMPOS
            document.getElementById("estatusProveedor").value = solicitud.estatusProveedor;
            document.getElementById("nickName").value = solicitud.nickName;
            document.getElementById("razonSocial").value = solicitud.razonSocial;
            document.getElementById("rfc").value = solicitud.rfc;
            document.getElementById("domicilioFiscal").value = solicitud.domicilioFiscal;
            document.getElementById("ciudad").value = solicitud.ciudad;
            document.getElementById("cp").value = solicitud.cp;
            document.getElementById("correo").value = solicitud.correo;
            document.getElementById("cuenta").value = solicitud.cuenta;
            document.getElementById("clabe").value = solicitud.clabe;

            //CAMBIAR TEXTO DEL BOTON 
            document.getElementById("btnGuardar").textContent = "Actualizar Proveedor";
        }catch(e){
            console.error("Hubo un error al cargar el proveedor: ", e);
            alert("Error al cargar Proveedor");
        }    
    }
    incializarProveedor(); 
});

//=================================================================================================================
//========================altaProveedor.html======================================================================
//========================ALTA DE PROVEEDORES===============================================================

const formProveedores = document.getElementById("formProveedores");
if(formProveedores){
    formProveedores.addEventListener("submit", async e =>{
        e.preventDefault();

        const estatusProveedor = document.getElementById("estatusProveedor").value;
        const nickName = document.getElementById("nickName").value;
        const razonSocial = document.getElementById("razonSocial").value;
        const rfc = document.getElementById("rfc").value;
        const domicilioFiscal = document.getElementById("domicilioFiscal").value;
        const ciudad = document.getElementById("ciudad").value;
        const cp = document.getElementById("cp").value;
        const correo = document.getElementById("correo").value;
        const cuenta = document.getElementById("cuenta").value;
        const clabe = document.getElementById("clabe").value;

        if(!estatusProveedor){
            alert("DEBES SELECCIONAR UN ESTATUS!");
            return;
        }

        if(!nickName || !razonSocial || !rfc || !domicilioFiscal ||
            !ciudad || !cp || !correo || !cuenta || !clabe
        ){
            alert("DEBES RELLENAR TODOS LOS CAMPOS PARA PODER DAR DE ALTA!");
            return;
        }
        
        const method = id ? 'PUT' : 'POST';
        const url = id
            ? `/api/routeListaProveedor/listaProveedor/${id}`
            : `/api/routeProveedor/altaProveedores`;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                estatusProveedor, 
                nickName, 
                razonSocial,
                rfc,
                domicilioFiscal,
                ciudad,
                cp,
                correo,
                cuenta,
                clabe
            })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formProveedores.reset();
        if(result.success){
            window.location.href = "/html/listaProveedores.html";
        }

    })
}