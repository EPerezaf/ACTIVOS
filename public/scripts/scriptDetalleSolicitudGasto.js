const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// FUNCION PARA OBTENER EL TOKEN 
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || !role) {
        window.location.href = "/html/index.html";
        return {};
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token || !role) {
        window.location.href = "/html/index.html";
        return;
    }

    // VERIFICAR QUE EL ROL TENGA ACCESO A ESTA PAGINA
    const rolesPermitidos = ["Administrador", "Gerente General", "Jefe de Activos"];
    if(!rolesPermitidos.includes(role)) {
        alert("No tienes permiso para acceder a esta página");
        window.location.href = "/html/index.html";
        return;
    }

    if (!id) {
        alert("No se proporcionó ID de solicitud");
        window.history.back();
        return;
    }

    cargarDetalleSolicitud();
});

// FUNCIÓN PARA CARGAR DETALLE DE SOLICITUD
async function cargarDetalleSolicitud() {
    const contenedor = document.getElementById('contenedorDetalle');
    const contenedorBotones = document.getElementById('contenedorBotones');

    try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}`, {
            headers: headers
        });

        if (!res.ok) {
            throw new Error('Error al cargar los detalles de la solicitud');
        }

        const resultado = await res.json();
        
        if (!resultado.success) {
            alert('Error: ' + resultado.message);
            return;
        }

        const solicitud = resultado.data;
        const userRole = localStorage.getItem("role");

        // GENERAR HTML DEL DETALLE
        const activosHTML = solicitud.activos.map((activo, index) => {
            const proveedorSeleccionado = activo.proveedorSeleccionado;
            
            const proveedoresHTML = activo.proveedores.map(proveedor => {
                const estaSeleccionado = proveedorSeleccionado && 
                    proveedorSeleccionado.idProveedor === proveedor.idProveedor;
                
                return `
                <div class="proveedor-item ${estaSeleccionado ? 'proveedor-seleccionado' : ''}">
                    <label>
                        <input type="radio" 
                               name="proveedor-${index}" 
                               value="${proveedor.idProveedor}"
                               ${estaSeleccionado ? 'checked' : ''}
                               onchange="manejarSeleccionProveedor(${index}, ${proveedor.idProveedor}, ${estaSeleccionado})"
                               ${solicitud.estatusCompras !== 'Proceso' ? 'disabled' : ''}>
                        <div class="proveedor-info">
                            <strong>${proveedor.razonSocial}</strong> 
                            <span class="proveedor-nickname">(${proveedor.nickName})</span><br>
                            <span class="proveedor-monto">Monto: $${proveedor.monto.toLocaleString()}</span>
                            ${estaSeleccionado ? '<span class="badge-seleccionado">✅ Seleccionado</span>' : ''}
                        </div>
                    </label>
                </div>
                `;
            }).join('');

            const infoProveedorSeleccionado = proveedorSeleccionado ? 
                `<div class="proveedor-seleccionado-info">
                    <strong>Proveedor seleccionado:</strong> 
                    <span class="proveedor-nombre">${proveedorSeleccionado.razonSocial}</span>
                    <span class="proveedor-nickname">(${proveedorSeleccionado.nickName})</span> - 
                    <span class="proveedor-monto-destacado">$${proveedorSeleccionado.monto.toLocaleString()}</span>
                    ${solicitud.estatusCompras === 'Proceso' ? 
                        `<button type="button" class="btn-deseleccionar" onclick="deseleccionarProveedor(${index})">
                            ✖️ Deseleccionar
                        </button>` : ''
                    }
                </div>` : 
                '<div class="proveedor-seleccionado-info warning">⚠️ No se ha seleccionado proveedor para este activo</div>';

            return `
            <div class="activo-item">
                <h3>${activo.conceptoActivo}</h3>
                <p><strong>Familia:</strong> ${activo.familia} - <strong>Sub Familia:</strong> ${activo.subFamilia}</p>
                <p><strong>Concepto de Gasto:</strong> ${activo.conceptoGasto}</p>
                ${infoProveedorSeleccionado}
                ${solicitud.estatusCompras === 'Proceso' ? `
                    <div class="seleccion-proveedores">
                        <strong>Opciones de proveedores:</strong>
                        <div class="lista-proveedores">
                            ${proveedoresHTML}
                        </div>
                    </div>
                ` : ''}
            </div>
            `;
        }).join('');

        contenedor.innerHTML = `
            <div class="solicitud-info">
                <h2>Solicitud de Gasto #${solicitud.id}</h2>
                <p><strong>Estatus:</strong> <span class="estatus-${solicitud.estatusCompras.toLowerCase()}">${solicitud.estatusCompras}</span></p>
                <p><strong>Clasificación:</strong> ${solicitud.clasificacionGasto}</p>
                <p><strong>Tipo de Gasto:</strong> ${solicitud.tipoGasto}</p>
                <p><strong>Descripción:</strong> ${solicitud.descripcionGasto}</p>
                <p><strong>Lectura:</strong> ${solicitud.lectura || 'N/A'}</p>
                <p><strong>Monto Total (proveedores seleccionados):</strong> 
                   <span class="monto-total">$${solicitud.montoTotal.toLocaleString()}</span></p>
                <p><strong>Fecha de Creación:</strong> ${new Date(solicitud.fechaCreacion).toLocaleDateString()}</p>
                ${solicitud.fechaAutorizacion ? `<p><strong>Fecha de Autorización:</strong> ${new Date(solicitud.fechaAutorizacion).toLocaleDateString()}</p>` : ''}
                ${solicitud.autorizadoPor ? `<p><strong>Autorizado por:</strong> ${solicitud.autorizadoPor.username} (${solicitud.autorizadoPor.role})</p>` : ''}
            </div>

            <div class="activos-section">
                <h3>Activos y Proveedores</h3>
                ${activosHTML}
            </div>
        `;

        // CONFIGURAR BOTONES - LIMPIAR PRIMERO Y LUEGO AGREGAR
        contenedorBotones.innerHTML = ''; // LIMPIAR BOTONES EXISTENTES
        
        // BOTÓN VOLVER SIEMPRE
        const btnVolver = document.createElement('button');
        btnVolver.className = 'btn-accion btn-volver';
        btnVolver.textContent = 'Volver';
        btnVolver.onclick = () => window.history.back();
        contenedorBotones.appendChild(btnVolver);

        // BOTÓN AUTORIZAR SOLO SI CORRESPONDE
        if ((userRole === "Administrador" || userRole === "Gerente General") && 
            solicitud.estatusCompras === "Proceso") {
            
            const btnAutorizar = document.createElement('button');
            btnAutorizar.className = 'btn-accion btn-autorizar';
            btnAutorizar.textContent = 'Autorizar Solicitud';
            btnAutorizar.onclick = () => autorizarSolicitudGasto(solicitud.id);
            contenedorBotones.appendChild(btnAutorizar);
        }

    } catch (error) {
        console.error("Error al cargar detalle de solicitud:", error);
        contenedor.innerHTML = "<p>Error al cargar los detalles de la solicitud</p>";
    }
}

// FUNCIÓN PARA SELECCIONAR PROVEEDOR
async function seleccionarProveedor(indexActivo, idProveedor) {
    try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}/seleccionarProveedor`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                indexActivo: indexActivo,
                idProveedor: idProveedor
            })
        });

        const resultado = await res.json();
        
        if (!resultado.success) {
            alert('Error: ' + resultado.message);
            return;
        }

        console.log('Proveedor seleccionado correctamente');
        // Recargar para mostrar los cambios
        cargarDetalleSolicitud();
        
    } catch (error) {
        console.error("Error al seleccionar proveedor:", error);
        alert("Error al seleccionar el proveedor");
    }
}

// FUNCIÓN PARA AUTORIZAR SOLICITUD DE GASTO
async function autorizarSolicitudGasto(solicitudId) {
    if(!confirm(`¿Seguro que deseas autorizar la solicitud de gasto #${solicitudId}?`)) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${solicitudId}/autorizar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await res.json();
        if(result.success){
            alert(result.message);
            //cargarDetalleSolicitud(); // Recargar los detalles
            window.location.href = "/html/listaSolicitudGasto.html";
        } else {
            alert(result.message || "Error al autorizar la solicitud de gasto");
        }
    } catch(e) {
        console.error(e);
        alert("Error al autorizar la solicitud de gasto");
    }
}

// FUNCIÓN MEJORADA PARA MANEJAR SELECCIÓN/DESELECCIÓN
async function manejarSeleccionProveedor(indexActivo, idProveedor, estaSeleccionado) {
    try {
        const headers = getAuthHeaders();
        
        if (estaSeleccionado) {
            // SI YA ESTÁ SELECCIONADO, DESELECCIONAR
            const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}/deseleccionarProveedor`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    indexActivo: indexActivo
                })
            });

            const resultado = await res.json();
            
            if (!resultado.success) {
                alert('Error: ' + resultado.message);
                return;
            }

            console.log('Proveedor deseleccionado correctamente');
        } else {
            // SELECCIONAR NUEVO PROVEEDOR
            const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}/seleccionarProveedor`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    indexActivo: indexActivo,
                    idProveedor: idProveedor
                })
            });

            const resultado = await res.json();
            
            if (!resultado.success) {
                alert('Error: ' + resultado.message);
                return;
            }

            console.log('Proveedor seleccionado correctamente');
        }

        // Recargar para mostrar los cambios y el nuevo monto total
        cargarDetalleSolicitud();
        
    } catch (error) {
        console.error("Error al manejar selección de proveedor:", error);
        alert("Error al procesar la selección del proveedor");
    }
}

// FUNCIÓN PARA DESELECCIONAR PROVEEDOR
async function deseleccionarProveedor(indexActivo) {
    if (!confirm("¿Estás seguro de que deseas deseleccionar este proveedor?")) {
        return;
    }

    try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeSolicitudGasto/solicitudGasto/${id}/deseleccionarProveedor`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                indexActivo: indexActivo
            })
        });

        const resultado = await res.json();
        
        if (!resultado.success) {
            alert('Error: ' + resultado.message);
            return;
        }

        console.log('Proveedor deseleccionado correctamente');
        cargarDetalleSolicitud();
        
    } catch (error) {
        console.error("Error al deseleccionar proveedor:", error);
        alert("Error al deseleccionar el proveedor");
    }
}