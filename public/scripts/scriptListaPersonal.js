async function cargarPersonal() {
    const contenedor = document.getElementById("contenedorPersonal");
    contenedor.innerHTML = `<p>Cargando...</p>`;

    try{
        const res = await fetch(`/api/routeListaPersonal/traerPersonal`);
        const personal = await res.json();

        if(personal.length === 0){
            contenedor.innerHTML = `<p>No hay Personal registrado</p>`;
            return;
        }
        contenedor.innerHTML= personal.map(u => {
            const esCancelado = u.estatusPersonal && u.estatusPersonal.toLowerCase() === 'cancelado';
            const botones = esCancelado
            ? ""
            :
            `<button type="button" onclick="editarPersonal(${u.id})" class="btn-accion btn-editar">Editar</button>
            <button type="button" onclick="eliminarPersonal(${u.id})" class="btn-accion btn-eliminar">Eliminar</button>`;

            const claseCancelado = esCancelado ? "cancelado" : "";
            return(
                `
                <div classname="solicitud ${claseCancelado}">
                    <div class="concepto-card">
                        <div class="concepto-header">
                            <h3 class="concepto-titulo">Personal #${u.id}</h3>
                            <span class="concepto-estatus estatus-${u.estatusPersonal}">${u.estatusPersonal}</span>
                        </div>
                        <div class="concepto-body">
                            <p><strong>Estatus: </strong>${u.estatusPersonal}</p>
                            <p><strong>Nombre: </strong>${u.nombre}</p>
                            <p><strong>Apellido Paterno: </strong>${u.aPaterno}</p>
                            <p><strong>Apellido Materno: </strong>${u.aMaterno}</p>
                            <p><strong>Curp: </strong>${u.p_curp}</p>
                            <p><strong>Ciudad: </strong>${u.p_ciudad}</p>
                            <p><strong>Estado: </strong>${u.p_estado}</p>
                            <p><strong>Edad: </strong>${u.p_edad}</p>
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
                </div>
                <br>`
            )
        }).join("");
    }catch(e){
        console.error("Hubo un error al encontrar el personal");
    }
}
document.addEventListener("DOMContentLoaded", cargarPersonal);

function editarPersonal(id){
    window.location.href = `/html/personal.html?id=${id}`;
}

async function eliminarPersonal(id) {
    if(!confirm(`Seguro que desea eliminar la solicitud #${id}`)) return;
    try{
        const estatus = document.getElementById("estatusPersonal");
        data = { estatus};

        const res = await fetch(`/api/routeListaPersonal/listaPersonalEliminacion/${id}`, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
        }
        if(result.success){
            window.location.reload();
        }
    }catch(e){
        console.error("Hubo un error al eliminar la sub Familia");
    }
}