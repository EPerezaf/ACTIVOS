// scripts/scriptBitacoraCompras.js
let timeoutBusqueda = null;

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

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token || !role) {
        window.location.href = "/html/index.html";
        return;
    }

    // VERIFICAR PERMISOS
    const rolesPermitidos = ["Administrador", "Gerente General", "Jefe de Activos"];
    if(!rolesPermitidos.includes(role)) {
        alert("No tienes permiso para acceder a esta página");
        window.location.href = "/html/index.html";
        return;
    }

    // Cargar opciones de filtro dinámicas
    cargarOpcionesFiltro();

    // Configurar event listeners
    configurarEventListeners();

    // Cargar bitácora inicial
    cargarBitacoraCompras();
});

// CONFIGURAR EVENT LISTENERS
function configurarEventListeners() {
    // Búsqueda en tiempo real para proveedor
    const inputProveedor = document.getElementById('filtroProveedor');
    if (inputProveedor) {
        inputProveedor.addEventListener('input', function() {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(() => {
                if (this.value.trim().length >= 2) {
                    cargarBitacoraCompras();
                }
            }, 500);
        });
    }

    // Cambio en otros filtros
    const selects = ['filtroEstatus', 'filtroFecha', 'filtroTipo', 'filtroClasificacion'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', cargarBitacoraCompras);
        }
    });

    // Búsqueda con Enter
    if (inputProveedor) {
        inputProveedor.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                cargarBitacoraCompras();
            }
        });
    }
}

// CARGAR OPCIONES DE FILTRO DINÁMICAS
async function cargarOpcionesFiltro() {
    try {
        const headers = getAuthHeaders();
        
        // Cargar clasificaciones
        const resClasificaciones = await fetch('/api/routeBitacoraCompras/clasificaciones', {
            headers: headers
        });
        if (resClasificaciones.ok) {
            const data = await resClasificaciones.json();
            if (data.success && data.data) {
                const select = document.getElementById('filtroClasificacion');
                if (select) {
                    // Mantener la opción "Todas las clasificaciones"
                    select.innerHTML = '<option value="">Todas las clasificaciones</option>';
                    data.data.forEach(clasificacion => {
                        const option = document.createElement('option');
                        option.value = clasificacion;
                        option.textContent = clasificacion;
                        select.appendChild(option);
                    });
                }
            }
        }

        // Cargar tipos de compra
        const resTipos = await fetch('/api/routeBitacoraCompras/tipos-compra', {
            headers: headers
        });
        if (resTipos.ok) {
            const data = await resTipos.json();
            if (data.success && data.data) {
                const select = document.getElementById('filtroTipo');
                if (select) {
                    // Mantener la opción "Todos los tipos"
                    select.innerHTML = '<option value="">Todos los tipos</option>';
                    data.data.forEach(tipo => {
                        const option = document.createElement('option');
                        option.value = tipo;
                        option.textContent = tipo;
                        select.appendChild(option);
                    });
                }
            }
        }

    } catch (error) {
        console.error('Error al cargar opciones de filtro:', error);
    }
}

// FUNCIÓN PARA OBTENER FILTROS
function obtenerFiltros() {
    return {
        proveedor: document.getElementById('filtroProveedor').value.trim(),
        estatus: document.getElementById('filtroEstatus').value,
        dias: document.getElementById('filtroFecha').value,
        tipoCompra: document.getElementById('filtroTipo').value,
        clasificacion: document.getElementById('filtroClasificacion').value
    };
}

// FUNCIÓN PARA LIMPIAR FILTROS
function limpiarFiltros() {
    document.getElementById('filtroProveedor').value = '';
    document.getElementById('filtroEstatus').value = '';
    document.getElementById('filtroFecha').value = '';
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroClasificacion').value = '';
    cargarBitacoraCompras();
}

// FUNCIÓN PARA MOSTRAR ESTADÍSTICAS (ACTUALIZADA)
function mostrarEstadisticasCompras(estadisticas) {
    const contenedor = document.getElementById('estadisticasCompras');
    
    if (!estadisticas) {
        contenedor.innerHTML = '<div class="sin-resultados">No hay estadísticas disponibles</div>';
        return;
    }

    // Calcular estadísticas adicionales
    const totalConSeleccion = estadisticas.solicitudesConProveedorSeleccionado || 0;
    const porcentajeConSeleccion = estadisticas.totalSolicitudes > 0 
        ? (totalConSeleccion / estadisticas.totalSolicitudes * 100) 
        : 0;
    
    const montoPromedio = estadisticas.montoTotal > 0 && estadisticas.totalSolicitudes > 0
        ? estadisticas.montoTotal / estadisticas.totalSolicitudes
        : 0;

    contenedor.innerHTML = `
        <div class="tarjeta-estadistica">
            <h3>Total Solicitudes</h3>
            <div class="valor">${estadisticas.totalSolicitudes.toLocaleString()}</div>
            <div class="subvalor">Registros totales</div>
        </div>
        <div class="tarjeta-estadistica">
            <h3>Monto Total</h3>
            <div class="valor">$${estadisticas.montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="subvalor">Inversión total</div>
        </div>
        <div class="tarjeta-estadistica">
            <h3>Monto Promedio</h3>
            <div class="valor">$${montoPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="subvalor">Por solicitud</div>
        </div>
        <div class="tarjeta-estadistica">
            <h3>Con Proveedor</h3>
            <div class="valor">${totalConSeleccion.toLocaleString()}</div>
            <div class="subvalor">${porcentajeConSeleccion.toFixed(1)}% del total</div>
        </div>
        <div class="tarjeta-estadistica">
            <h3>Pendientes</h3>
            <div class="valor">${estadisticas.solicitudesPendientes.toLocaleString()}</div>
            <div class="subvalor">Esperando proceso</div>
        </div>
        <div class="tarjeta-estadistica">
            <h3>En Proceso</h3>
            <div class="valor">${estadisticas.solicitudesProceso.toLocaleString()}</div>
            <div class="subvalor">${(estadisticas.solicitudesProceso || 0) - totalConSeleccion} por seleccionar</div>
        </div>
    `;
}

// FUNCIÓN PARA GENERAR TABLA DE SOLICITUDES (ACTUALIZADA)
function generarTablaSolicitudes(solicitudes) {
    if (!solicitudes || !Array.isArray(solicitudes) || solicitudes.length === 0) {
        return '<div class="sin-resultados">No hay datos para mostrar</div>';
    }

    // Calcular totales
    let montoTotal = 0;
    
    const filas = solicitudes.map(solicitud => {
        // Calcular PROMEDIO de los proveedores disponibles (para mostrar cuando no hay seleccionado)
        let promedioProveedores = 0;
        let montoProveedorSeleccionado = 0;
        let tieneProveedorSeleccionado = false;
        
        if (solicitud.proveedores && solicitud.proveedores.length > 0) {
            // Calcular suma de montos de todos los proveedores
            const sumaMontos = solicitud.proveedores.reduce((sum, p) => {
                return sum + (parseFloat(p.sc_monto) || 0);
            }, 0);
            
            // Calcular promedio
            promedioProveedores = sumaMontos / solicitud.proveedores.length;
            
            // Verificar si hay proveedor seleccionado en algún activo
            if (solicitud.conceptoActivo) {
                solicitud.conceptoActivo.forEach(a => {
                    if (a.proveedorSeleccionado && a.proveedorSeleccionado.sc_monto) {
                        montoProveedorSeleccionado += parseFloat(a.proveedorSeleccionado.sc_monto) || 0;
                        tieneProveedorSeleccionado = true;
                    }
                });
            }
        }
        
        // Determinar qué monto mostrar
        let montoAMostrar = 0;
        let tipoMonto = '';
        
        if (tieneProveedorSeleccionado) {
            // Si hay proveedor seleccionado, mostrar SU monto
            montoAMostrar = montoProveedorSeleccionado;
            tipoMonto = 'seleccionado';
        } else if (promedioProveedores > 0) {
            // Si no hay seleccionado pero hay proveedores, mostrar promedio
            montoAMostrar = promedioProveedores;
            tipoMonto = 'promedio';
        } else {
            // Sin proveedores
            montoAMostrar = 0;
            tipoMonto = 'sin';
        }
        
        montoTotal += montoAMostrar;

        // Formatear datos
        const personalInfo = solicitud.personal && solicitud.personal.length > 0 
            ? solicitud.personal.map(p => `${p.nombre} ${p.aPaterno}`).join(', ')
            : 'Sin personal';

        // Formatear proveedores con información de montos
        const proveedoresInfo = solicitud.proveedores && solicitud.proveedores.length > 0 
            ? solicitud.proveedores.map((p, index) => {
                const monto = parseFloat(p.sc_monto) || 0;
                const esSeleccionado = tieneProveedorSeleccionado && 
                    solicitud.conceptoActivo?.some(a => 
                        a.proveedorSeleccionado && 
                        (a.proveedorSeleccionado.razonSocial === p.razonSocial || 
                         a.proveedorSeleccionado.nickname === p.nickname)
                    );
                
                return `
                    <div class="proveedor-info ${esSeleccionado ? 'proveedor-seleccionado' : ''}">
                        ${p.razonSocial || p.nickname} 
                        <span class="monto-proveedor">$${monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        ${esSeleccionado ? '<span class="badge-seleccionado">✓ Seleccionado</span>' : ''}
                    </div>
                `;
            }).join('')
            : '<div class="proveedor-info">Sin proveedores</div>';

        // Formatear activos con información de proveedor seleccionado
        const activosInfo = solicitud.conceptoActivo && solicitud.conceptoActivo.length > 0
            ? solicitud.conceptoActivo.map((activo, idx) => {
                const tieneProveedor = activo.proveedorSeleccionado;
                const proveedorInfo = tieneProveedor 
                    ? `<div class="proveedor-activo-seleccionado">
                         <strong>✓ Proveedor:</strong> ${activo.proveedorSeleccionado.razonSocial || activo.proveedorSeleccionado.nickname}
                         <span class="monto-proveedor">$${(activo.proveedorSeleccionado.sc_monto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                       </div>`
                    : `<div class="proveedor-activo-pendiente">
                         <em>Pendiente de selección</em>
                         ${promedioProveedores > 0 ? 
                           `<small>(Promedio: $${promedioProveedores.toLocaleString('es-MX', { minimumFractionDigits: 2 })})</small>` : 
                           ''}
                       </div>`;
                
                return `
                    <div class="activo-item ${tieneProveedor ? 'con-proveedor' : 'sin-proveedor'}">
                        <strong>${activo.sc_cca_descripcion || 'Sin descripción'}</strong>
                        ${proveedorInfo}
                    </div>
                `;
            }).join('')
            : '<div class="activo-item">Sin activos</div>';

        // Determinar el texto del tooltip según el tipo de monto
        let tooltipMonto = '';
        switch(tipoMonto) {
            case 'seleccionado':
                tooltipMonto = `Monto del proveedor seleccionado: $${montoAMostrar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
                break;
            case 'promedio':
                tooltipMonto = `Promedio de ${solicitud.proveedores?.length || 0} proveedores: $${montoAMostrar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
                break;
            default:
                tooltipMonto = 'Sin monto disponible';
        }

        // Calcular porcentaje de activos con proveedor seleccionado
        const totalActivos = solicitud.conceptoActivo?.length || 0;
        const activosConProveedor = solicitud.conceptoActivo?.filter(a => a.proveedorSeleccionado).length || 0;
        const porcentajeSeleccionado = totalActivos > 0 ? (activosConProveedor / totalActivos * 100) : 0;

        return `
        <tr>
            <td><strong>#${solicitud.id}</strong></td>
            <td>${new Date(solicitud.fechaCreacion).toLocaleDateString('es-MX')}</td>
            <td>${solicitud.clasificacionCompras || 'Sin clasificación'}</td>
            <td>${solicitud.descripcionConceptoCompra || 'Sin descripción'}</td>
            <td>
                <span class="estatus-badge estatus-${solicitud.estatusCompras}">
                    ${solicitud.estatusCompras || 'Sin estatus'}
                </span>
                ${porcentajeSeleccionado > 0 ? 
                  `<div class="progreso-seleccion" title="${activosConProveedor} de ${totalActivos} activos con proveedor">
                    <div class="barra-progreso" style="width: ${porcentajeSeleccionado}%"></div>
                    <span class="porcentaje-texto">${porcentajeSeleccionado.toFixed(0)}%</span>
                  </div>` : 
                  ''}
            </td>
            <td>${personalInfo}</td>
            <td>${proveedoresInfo}</td>
            <td>${activosInfo}</td>
            <td class="monto-cell" title="${tooltipMonto}">
                <div class="monto-display">
                    $${montoAMostrar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    ${tipoMonto === 'promedio' ? 
                      '<span class="badge-promedio" title="Promedio de proveedores">🅿️</span>' : 
                      tipoMonto === 'seleccionado' ? 
                      '<span class="badge-seleccion" title="Monto seleccionado">✓</span>' : 
                      ''}
                </div>
                ${tipoMonto === 'promedio' ? 
                  `<small class="tipo-monto">Promedio (${solicitud.proveedores?.length || 0} prov.)</small>` : 
                  tipoMonto === 'seleccionado' ? 
                  `<small class="tipo-monto">Seleccionado</small>` : 
                  `<small class="tipo-monto">Sin monto</small>`}
            </td>
            <td>
                <button onclick="verDetalleSolicitud(${solicitud.id})" class="btn-accion btn-ver" title="Ver detalle">
                    👁️ Ver
                </button>
                ${solicitud.estatusCompras === 'Autorizada' ? `
                <button onclick="verActivosRegistrados(${solicitud.id})" class="btn-accion btn-registrar" title="Ver activos registrados" style="margin-top: 5px;">
                    📋 Activos
                </button>
                ` : ''}
                ${solicitud.estatusCompras === 'Proceso' && !tieneProveedorSeleccionado ? `
                <button onclick="seleccionarProveedor(${solicitud.id})" class="btn-accion btn-seleccionar" title="Seleccionar proveedor" style="margin-top: 5px;">
                    📝 Seleccionar
                </button>
                ` : ''}
            </td>
        </tr>
        `;
    }).join('');

    // Fila de totales
    const filaTotal = `
        <tr class="total-fila">
            <td colspan="8"><strong>TOTAL GENERAL</strong></td>
            <td class="monto-cell"><strong>$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></td>
            <td><strong>${solicitudes.length} solicitudes</strong></td>
        </tr>
    `;

    return `
        <div class="tabla-contenedor">
            <table class="tabla-solicitudes">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Clasificación</th>
                        <th>Descripción</th>
                        <th>Estatus</th>
                        <th>Personal</th>
                        <th>Proveedores</th>
                        <th>Activos</th>
                        <th>Monto</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas}
                    ${filaTotal}
                </tbody>
            </table>
        </div>
    `;
}

// FUNCIÓN PRINCIPAL PARA CARGAR LA BITÁCORA (ACTUALIZADA)
async function cargarBitacoraCompras() {
    const contenedorResultados = document.getElementById('resultadosBitacoraCompras');
    const contenedorEstadisticas = document.getElementById('estadisticasCompras');
    
    // Mostrar estado de carga
    mostrarEstadoCarga();
    contenedorEstadisticas.innerHTML = '';

    try {
        const filtros = obtenerFiltros();
        const params = new URLSearchParams();
        
        // Agregar filtros a los parámetros
        if (filtros.proveedor) params.append('proveedor', filtros.proveedor);
        if (filtros.estatus) params.append('estatus', filtros.estatus);
        if (filtros.dias) params.append('dias', filtros.dias);
        if (filtros.tipoCompra) params.append('tipoCompra', filtros.tipoCompra);
        if (filtros.clasificacion) params.append('clasificacion', filtros.clasificacion);

        const headers = getAuthHeaders();
        const url = `/api/routeBitacoraCompras/bitacora?${params.toString()}`;
        
        console.log('🔍 Consultando bitácora de compras:', url);
        
        const res = await fetch(url, {
            headers: headers
        });

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                window.location.href = "/html/index.html";
                return;
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const resultado = await res.json();
        
        if (!resultado.success) {
            throw new Error(resultado.message || 'Error en la respuesta del servidor');
        }

        const datos = resultado.data;
        
        // Validar datos
        if (!datos) {
            throw new Error('No se recibieron datos del servidor');
        }
        
        // MOSTRAR ESTADÍSTICAS
        mostrarEstadisticasCompras(datos.estadisticas);
        
        // MOSTRAR RESULTADOS
        if (!datos.solicitudes || datos.solicitudes.length === 0) {
            mostrarSinResultados(datos.filtrosAplicados || {});
            return;
        }

        // Generar y mostrar la tabla
        const tablaHTML = generarTablaSolicitudes(datos.solicitudes);
        contenedorResultados.className = ''; // <- Añadir esta línea
        contenedorResultados.innerHTML = tablaHTML;

    } catch (error) {
        console.error("❌ Error al cargar bitácora de compras:", error);
        mostrarError(error.message);
    }
}

/*
// FUNCIÓN PARA DESCARGAR REPORTE EN EXCEL
async function descargarReporteCompras() {
    try {
        const filtros = obtenerFiltros();
        const params = new URLSearchParams();
        
        if (filtros.proveedor) params.append('proveedor', filtros.proveedor);
        if (filtros.estatus) params.append('estatus', filtros.estatus);
        if (filtros.dias) params.append('dias', filtros.dias);
        if (filtros.tipoCompra) params.append('tipoCompra', filtros.tipoCompra);
        if (filtros.clasificacion) params.append('clasificacion', filtros.clasificacion);

        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeBitacoraCompras/descargar-reporte?${params.toString()}`, {
            headers: headers
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.message || `Error ${res.status}: ${res.statusText}`);
        }

        // Verificar que sea un archivo Excel
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            throw new Error('El servidor no devolvió un archivo Excel válido');
        }

        // Crear blob y descargar
        const blob = await res.blob();
        
        if (blob.size === 0) {
            throw new Error('El archivo generado está vacío');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-compras-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);

    } catch (error) {
        console.error("❌ Error al descargar reporte:", error);
        alert("Error al descargar el reporte: " + error.message);
    }
}*/

// FUNCIÓN PARA DESCARGAR REPORTE EN EXCEL (VERSIÓN MEJORADA)
async function descargarReporteComprasMejorado() {
    try {
        const filtros = obtenerFiltros();
        const params = new URLSearchParams();
        
        if (filtros.proveedor) params.append('proveedor', filtros.proveedor);
        if (filtros.estatus) params.append('estatus', filtros.estatus);
        if (filtros.dias) params.append('dias', filtros.dias);
        if (filtros.tipoCompra) params.append('tipoCompra', filtros.tipoCompra);
        if (filtros.clasificacion) params.append('clasificacion', filtros.clasificacion);

        const headers = getAuthHeaders();
        
        // Mostrar mensaje de carga
        Swal.fire({
            title: 'Generando reporte...',
            text: 'Por favor espera, estamos preparando tu archivo Excel con formato profesional.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const res = await fetch(`/api/routeBitacoraCompras/descargar-reporte-mejorado?${params.toString()}`, {
            headers: headers
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.message || `Error ${res.status}: ${res.statusText}`);
        }

        // Verificar que sea un archivo Excel
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            throw new Error('El servidor no devolvió un archivo Excel válido');
        }

        // Crear blob y descargar
        const blob = await res.blob();
        
        if (blob.size === 0) {
            throw new Error('El archivo generado está vacío');
        }

        // Cerrar mensaje de carga
        Swal.close();

        // Descargar archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bitácora Compras ${new Date().toLocaleDateString('es-MX')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        
        // Mostrar mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: '¡Reporte descargado!',
            text: 'El archivo Excel se ha generado con éxito y se está descargando.',
            timer: 3000,
            showConfirmButton: false
        });

        // Limpiar
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);

    } catch (error) {
        console.error("❌ Error al descargar reporte mejorado:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error al descargar',
            text: error.message,
            confirmButtonText: 'Entendido'
        });
    }
}

// FUNCIÓN PARA VER DETALLE DE UNA SOLICITUD
function verDetalleSolicitud(id) {
    window.location.href = `/html/detalleSolicitudCompra.html?id=${id}`;
}

// FUNCIÓN PARA VER ACTIVOS REGISTRADOS DE UNA SOLICITUD AUTORIZADA
async function verActivosRegistrados(idSolicitud) {
    try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeListaSolicitudCompra/solicitud/${idSolicitud}/tieneActivos`, {
            headers: headers
        });

        if (res.ok) {
            const resultado = await res.json();
            if (resultado.success && resultado.tieneActivos) {
                // Redirigir a la lista de activos filtrada por esta solicitud
                window.location.href = `/html/listaRegistroActivo.html?solicitud=${idSolicitud}`;
            } else {
                alert('Esta solicitud aún no tiene activos registrados.');
            }
        }
    } catch (error) {
        console.error('Error al verificar activos:', error);
        alert('Error al verificar los activos registrados.');
    }
}

// FUNCIÓN PARA MOSTRAR ESTADO DE CARGA
function mostrarEstadoCarga() {
    const contenedorResultados = document.getElementById('resultadosBitacoraCompras');
    // REMOVER la clase cargando para que no se aplique el pseudo-elemento
    contenedorResultados.className = '';
    contenedorResultados.innerHTML = `
        <div class="estado-carga">
            <div class="spinner"></div>
            <p>Cargando bitácora de compras...</p>
        </div>
    `;
}

// FUNCIÓN PARA MOSTRAR ERROR
function mostrarError(mensaje, mostrarBotonReintentar = true) {
    const contenedorResultados = document.getElementById('resultadosBitacoraCompras');
    // Asegurarse de quitar la clase cargando
    contenedorResultados.className = '';
    
    const botonHTML = mostrarBotonReintentar 
        ? `<button class="btn-buscar" onclick="cargarBitacoraCompras()" style="margin-top: 15px;">
              🔄 Reintentar
           </button>`
        : '';
    
    contenedorResultados.innerHTML = `
        <div class="error-carga">
            <h3>Error al cargar la bitácora</h3>
            <p>${mensaje}</p>
            ${botonHTML}
        </div>
    `;
}

// FUNCIÓN PARA MOSTRAR SIN RESULTADOS
function mostrarSinResultados(filtrosAplicados = {}) {
    const contenedorResultados = document.getElementById('resultadosBitacoraCompras');
    // Asegurarse de quitar la clase cargando
    contenedorResultados.className = '';
    
    const filtrosTexto = Object.entries(filtrosAplicados)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    
    const filtrosInfo = filtrosTexto 
        ? `<p><small>Filtros aplicados: ${filtrosTexto}</small></p>`
        : '';
    
    contenedorResultados.innerHTML = `
        <div class="sin-resultados">
            <h3>No se encontraron solicitudes de compra</h3>
            <p>No hay registros que coincidan con los filtros aplicados.</p>
            ${filtrosInfo}
            <button class="btn-buscar" onclick="limpiarFiltros()" style="margin-top: 15px;">
                🔄 Ver todas las solicitudes
            </button>
        </div>
    `;
}

// FUNCIÓN PARA SELECCIONAR PROVEEDOR (para solicitudes en Proceso)
function seleccionarProveedor(idSolicitud) {
    window.location.href = `/html/detalleSolicitudCompra.html?id=${idSolicitud}&modo=seleccionar`;
}