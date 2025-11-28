const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let solicitudActual = null;

// FUNCIÓN PARA OBTENER EL TOKEN 
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

    // VERIFICAR QUE EL ROL TENGA ACCESO A ESTA PÁGINA
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

// FUNCIÓN PRINCIPAL PARA CARGAR DETALLE DE SOLICITUD
async function cargarDetalleSolicitud() {
    const contenedor = document.getElementById('contenedorDetalle');
    const btnAutorizar = document.getElementById('btnAutorizar');

    try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudes/${id}`, {
            headers: headers
        });

        if (!res.ok) {
            throw new Error('Error al cargar los detalles de la solicitud');
        }

        const solicitud = await res.json();
        solicitudActual = solicitud;

        if (!solicitud) {
            contenedor.innerHTML = "<p>Error: Solicitud no encontrada</p>";
            return;
        }

        const userRole = localStorage.getItem("role");

        // CONFIGURAR BOTÓN DE AUTORIZACIÓN
        if (btnAutorizar) {
            if (userRole === "Gerente General" && solicitud.estatusCompras === "Proceso") {
                btnAutorizar.style.display = 'block';
                btnAutorizar.onclick = () => autorizarSolicitud(solicitud.id);
            } else {
                btnAutorizar.style.display = 'none';
            }
        }

        // GENERAR HTML DEL DETALLE
        const detalleHTML = generarHTMLDetalle(solicitud);
        contenedor.innerHTML = detalleHTML;

    } catch (error) {
        console.error("Error al cargar detalle de solicitud:", error);
        contenedor.innerHTML = "<p>Error al cargar los detalles de la solicitud</p>";
    }
}

// FUNCIÓN PARA GENERAR EL HTML DEL DETALLE
function generarHTMLDetalle(solicitud) {
    const userRole = localStorage.getItem("role");
    const estaEnProceso = solicitud.estatusCompras === "Proceso";
    const esGerenteGeneral = userRole === "Gerente General";

    // HTML para información general de la solicitud
    let html = `
        <div class="solicitud-info">
            <h2>Solicitud de Compra #${solicitud.id}</h2>
            <p><strong>Estatus:</strong> <span class="estatus-${solicitud.estatusCompras?.toLowerCase() || 'pendiente'}">${solicitud.estatusCompras || 'Pendiente'}</span></p>
            <p><strong>Clasificación:</strong> ${solicitud.clasificacionCompras || 'N/A'}</p>
            <p><strong>Descripción:</strong> ${solicitud.descripcionConceptoCompra || 'Sin descripción'}</p>
            <p><strong>Fecha de Creación:</strong> ${new Date(solicitud.fechaCreacion).toLocaleDateString()}</p>
            ${solicitud.fechaAutorizacion ? `<p><strong>Fecha de Autorización:</strong> ${new Date(solicitud.fechaAutorizacion).toLocaleDateString()}</p>` : ''}
            ${solicitud.autorizadoPor ? `<p><strong>Autorizado por:</strong> ${solicitud.autorizadoPor.username || 'N/A'} (${solicitud.autorizadoPor.role || 'N/A'})</p>` : ''}
        </div>
    `;

    // HTML para personal asignado
    if (solicitud.personal && Array.isArray(solicitud.personal) && solicitud.personal.length > 0) {
        html += `<h3 class="seccion-titulo">Personal Asignado</h3>`;
        solicitud.personal.forEach(persona => {
            html += `
                <div class="personal-item">
                    <strong>${persona.nombre || ''} ${persona.aPaterno || ''} ${persona.aMaterno || ''}</strong>
                </div>
            `;
        });
    }

    // HTML para activos y proveedores
    html += `<h3 class="seccion-titulo">Activos y Proveedores</h3>`;

    if (solicitud.conceptoActivo && Array.isArray(solicitud.conceptoActivo)) {
        solicitud.conceptoActivo.forEach((activo, index) => {
            const proveedorSeleccionado = activo.proveedorSeleccionado;
            
            // Generar HTML para proveedores de este activo
            const proveedoresHTML = generarHTMLProveedores(activo, index, solicitud.proveedores, estaEnProceso);
            
            const infoProveedorSeleccionado = proveedorSeleccionado ? 
                `<div class="proveedor-seleccionado-info">
                    <strong>Proveedor seleccionado:</strong> 
                    <span class="proveedor-nombre">${proveedorSeleccionado.razonSocial}</span>
                    <span class="proveedor-nickname">(${proveedorSeleccionado.nickname})</span> - 
                    <span class="proveedor-monto">$${(proveedorSeleccionado.monto || proveedorSeleccionado.sc_monto || 0).toLocaleString()}</span>
                    ${estaEnProceso && esGerenteGeneral ? 
                        `<button type="button" class="btn-deseleccionar" onclick="deseleccionarProveedor(${index})">
                            ✖️ Deseleccionar
                        </button>` : ''
                    }
                </div>` : 
                '<div class="proveedor-seleccionado-info warning">⚠️ No se ha seleccionado proveedor para este activo</div>';

            html += `
            <div class="activo-item">
                <h3>${activo.sc_cca_descripcion || 'Activo sin descripción'}</h3>
                <p><strong>Familia:</strong> ${activo.sc_cca_familia || 'N/A'} - <strong>Sub Familia:</strong> ${activo.sc_cca_subFamilia || 'N/A'}</p>
                ${infoProveedorSeleccionado}
                ${estaEnProceso && esGerenteGeneral ? `
                    <div class="seleccion-proveedores">
                        <strong>Opciones de proveedores:</strong>
                        <div class="lista-proveedores">
                            ${proveedoresHTML}
                        </div>
                    </div>
                ` : ''}
            </div>
            `;
        });

        // Calcular y mostrar monto total
        const montoTotal = calcularMontoTotal(solicitud);
        html += `
            <div class="monto-total-container">
                <h3>Monto Total (proveedores seleccionados): <span class="monto-total">$${montoTotal.toLocaleString()}</span></h3>
            </div>
        `;
    } else {
        html += '<p>No hay activos registrados en esta solicitud.</p>';
    }

    return html;
}

// FUNCIÓN PARA GENERAR HTML DE PROVEEDORES
// FUNCIÓN PARA GENERAR HTML DE PROVEEDORES (VERSIÓN CORREGIDA)
function generarHTMLProveedores(activo, indexActivo, proveedoresSolicitud, estaEnProceso) {
    if (!proveedoresSolicitud || !Array.isArray(proveedoresSolicitud)) {
        return '<p>No hay proveedores disponibles</p>';
    }

    // Filtrar proveedores para este activo
    const proveedoresActivo = proveedoresSolicitud.filter(prov => 
        prov.idActivo === activo.id || prov.indexActivo === indexActivo || !prov.idActivo
    );

    if (proveedoresActivo.length === 0) {
        return '<p>No hay proveedores asignados para este activo</p>';
    }

    return proveedoresActivo.map(proveedor => {
        const estaSeleccionado = activo.proveedorSeleccionado && 
            activo.proveedorSeleccionado.indexProveedor === proveedoresSolicitud.indexOf(proveedor);
        
        const monto = proveedor.monto || proveedor.sc_monto || 0;
        const proveedorIndex = proveedoresSolicitud.indexOf(proveedor);
        
        return `
        <div class="proveedor-item ${estaSeleccionado ? 'proveedor-seleccionado' : ''}">
            <label style="display: block; cursor: ${estaEnProceso ? 'pointer' : 'default'};">
                <div class="proveedor-info">
                    <div class="proveedor-datos">
                        <strong class="proveedor-nombre">${proveedor.razonSocial}</strong> 
                        <span class="proveedor-nickname">(${proveedor.nickname})</span><br>
                        <span class="proveedor-monto">Monto: $${monto.toLocaleString()}</span>
                    </div>
                    ${estaEnProceso ? `
                        <input type="radio" 
                               name="proveedor-${indexActivo}" 
                               value="${proveedorIndex}"
                               ${estaSeleccionado ? 'checked' : ''}
                               onchange="manejarSeleccionProveedor(${indexActivo}, ${proveedorIndex})"
                               style="transform: scale(1.2);">
                    ` : ''}
                    ${estaSeleccionado ? '<span class="badge-seleccionado">✅ Seleccionado</span>' : ''}
                </div>
            </label>
        </div>
        `;
    }).join('');
}

// FUNCIÓN PARA CALCULAR MONTO TOTAL
function calcularMontoTotal(solicitud) {
    let montoTotal = 0;
    
    if (solicitud.conceptoActivo && Array.isArray(solicitud.conceptoActivo)) {
        solicitud.conceptoActivo.forEach(activo => {
            if (activo.proveedorSeleccionado) {
                const monto = activo.proveedorSeleccionado.monto || activo.proveedorSeleccionado.sc_monto || 0;
                montoTotal += parseFloat(monto);
            }
        });
    }
    
    return montoTotal;
}

// FUNCIÓN PARA MANEJAR SELECCIÓN/DESELECCIÓN DE PROVEEDORES
// FUNCIÓN CORREGIDA PARA MANEJAR SELECCIÓN DE PROVEEDORES
// FUNCIÓN SIMPLIFICADA PARA MANEJAR SELECCIÓN DE PROVEEDORES
async function manejarSeleccionProveedor(indexActivo, indexProveedor) {
    try {
        console.log('Seleccionando proveedor:', { 
            indexActivo: indexActivo, 
            indexProveedor: indexProveedor
        });

        const headers = getAuthHeaders();

        // Siempre seleccionar el nuevo proveedor (el backend se encargará de limpiar el anterior)
        const response = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}/seleccionarProveedor`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                indexActivo: indexActivo,
                indexProveedor: indexProveedor
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const resultado = await response.json();
        
        if (!resultado.success) {
            alert('Error: ' + resultado.message);
            return;
        }

        console.log('✅ Proveedor seleccionado correctamente');
        
        // Recargar para mostrar los cambios
        cargarDetalleSolicitud();
        
    } catch (error) {
        console.error("Error al manejar selección de proveedor:", error);
        alert("Error al procesar la selección del proveedor: " + error.message);
    }
}

// FUNCIÓN PARA DESELECCIONAR PROVEEDOR (desde botón)
async function deseleccionarProveedor(indexActivo) {
    if (!confirm("¿Estás seguro de que deseas deseleccionar este proveedor?")) {
        return;
    }

    try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${id}/deseleccionarProveedor`, {
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

// FUNCIÓN PARA AUTORIZAR SOLICITUD
async function autorizarSolicitud(solicitudId) {
    if (!confirm(`¿Seguro que deseas autorizar la solicitud de compra #${solicitudId}?`)) return;

    try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitudCompra/${solicitudId}/autorizar`, {
            method: 'PUT',
            headers: headers
        });

        const result = await res.json();
        if (result.success) {
            alert(result.message);
            cargarDetalleSolicitud(); // Recargar los detalles
        } else {
            alert(result.message || "Error al autorizar la solicitud de compra");
        }
    } catch (e) {
        console.error(e);
        alert("Error al autorizar la solicitud de compra");
    }
}