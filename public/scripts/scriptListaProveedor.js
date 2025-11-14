async function cargarProveedores() {
    const contendor = document.getElementById("contenedorProveedor");
    contendor.innerHTML = '<p>Cargando...</p>'
    try{
        const res = await fetch('/api/routeListaProveedor/traerProveedor');
        const solicitud = await res.json();

        if(!solicitud.length === 0){
            contendor.innerHTML = '<p>No se encontraron proveedores registrados</p>';
            return;
        }
        contendor.innerHTML = solicitud.map(u => {
            const esCancelado = u.estatusProveedor && u.estatusProveedor.toLowerCase() == 'cancelado';
            const botones = esCancelado
            ? ""
            :
            `<button type="button" onclick="editarProveedor(${u.id})" class="btn-accion btn-editar">Editar</button>
            <button type="button" onclick="eliminarProveedor(${u.id})" class="btn-accion btn-eliminar">Eliminar</button>`;
            
            const claseCancelado = esCancelado ? "cancelado" : "";

            return(
                `
                <div classname= "${claseCancelado}">
                    <div class="concepto-card">
                        <div class="concepto-header">
                            <h3 class="concepto-titulo">Proveedor #${u.id}</h3>
                            <span class="concepto-estatus estatus-${u.estatusProveedor}">${u.estatusProveedor}</span>
                        </div>
                        <div class="concepto-body">
                            <p><strong>NickName: </strong>${u.nickName}</p>
                            <p><strong>Razon Social: </strong>${u.razonSocial}</p>
                            <p><strong>RFC: </strong>${u.rfc}</p>
                            <p><strong>Domicilio Fiscal: </strong>${u.domicilioFiscal}</p>
                            <p><strong>Ciudad: </strong>${u.ciudad}</p>
                            <p><strong>Codigo Postal: </strong>${u.cp}</p>
                            <p><strong>Correo: </strong>${u.correo}</p>
                            <p><strong>Cuenta: </strong>${u.cuenta}</p>
                            <p><strong>Clabe: </strong>${u.clabe}</p>
                        </div>
                        <div class="concepto-meta">
                            <div class="concepto-fecha">
                                <span>📅</span>
                                <span>12/11/25</span>
                            </div>
                            <div class="concepto-acciones">
                                <div>${botones}</div>
                            </div>
                        </div>
                    </div>
                </div>`
            )
        }).join("");
    }catch(e){
        console.error("HUbo un error al encontrar los conceptos");
    }
}

document.addEventListener("DOMContentLoaded", cargarProveedores);

function editarProveedor(id){
    window.location.href = `/html/altaProveedor.html?id=${id}`;
}

async function eliminarProveedor(id) {
    if(!confirm(`Seguro que desea eliminar la solicitud #${id}`)) return;
    try{
        const estatusProveedor = document.getElementById("estatusProveedor");
        const nickName = document.getElementById("nickName");
        const razonSocial = document.getElementById("razonSocial");
        const rfc = document.getElementById("rfc");
        const domicilio = document.getElementById("domicilioFiscal");
        const ciudad = document.getElementById("ciudad");
        const cp = document.getElementById("cp");
        const cuenta = document.getElementById("cuenta");
        const clabe = document.getElementById("clabe");

        data = {
            estatusProveedor,
            nickName,
            razonSocial,
            rfc,
            domicilio,
            ciudad,
            cp,
            cuenta,
            clabe
        }

        const res = await fetch(`/api/routeListaProveedor/listaProveedorEliminar/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
        }
    }catch(e){
        console.error("Hubo un error al eliminar el Proveedor");
    }
}