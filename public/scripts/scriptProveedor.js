
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
        
        const res = await fetch('/api/routeProveedor/altaProveedores', {
            method: 'POST',
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

    })
}