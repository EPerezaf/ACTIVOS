let activosDisponibles = [];
let activoSeleccionado = null;
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

    // CARGAR LISTA DE ACTIVOS DISPONIBLES
    cargarActivosDisponibles();

    // EVENT LISTENERS PARA AUTocompletado
    const inputActivo = document.getElementById('filtroActivo');
    inputActivo.addEventListener('input', manejarBusquedaActivo);
    inputActivo.addEventListener('focus', mostrarAutocompletado);
    
    // Ocultar autocompletado al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            ocultarAutocompletado();
        }
    });
    // CARGAR BITÁCORA INICIAL
    cargarBitacora();
});

// CARGAR LISTA DE ACTIVOS DISPONIBLES (CORREGIDA)
async function cargarActivosDisponibles() {
    try {
        const headers = getAuthHeaders();
        const res = await fetch('/api/routeBitacoraGastos/activos', {
            headers: headers
        });

        if (res.ok) {
            const resultado = await res.json();
            if (resultado.success && Array.isArray(resultado.data)) {
                // Filtrar solo activos válidos
                activosDisponibles = resultado.data.filter(activo => 
                    activo && typeof activo === 'object' && activo.conceptoActivo
                );
                console.log('📋 Activos disponibles cargados (filtrados):', activosDisponibles.length);
            } else {
                console.warn('Respuesta inesperada del servidor:', resultado);
                activosDisponibles = [];
            }
        } else {
            console.error('Error HTTP al cargar activos:', res.status);
            activosDisponibles = [];
        }
    } catch (error) {
        console.error('Error al cargar activos:', error);
        activosDisponibles = [];
    }
}

// También mejora la función de manejo de búsqueda
function manejarBusquedaActivo(e) {
    const texto = e.target.value.trim();
    clearTimeout(timeoutBusqueda);
    
    // Limpiar selección si el texto está vacío
    if (texto === '') {
        activoSeleccionado = null;
        document.getElementById('infoActivoSeleccionado').style.display = 'none';
    }
    
    timeoutBusqueda = setTimeout(() => {
        if (texto.length >= 2) {
            buscarActivos(texto);
        } else {
            ocultarAutocompletado();
        }
    }, 300);
}

// BUSCAR ACTIVOS PARA AUTocompletado (CORREGIDO)
function buscarActivos(texto) {
    const textoBusqueda = texto.toLowerCase();
    
    const resultados = activosDisponibles.filter(activo => {
        // Validar que el activo tenga las propiedades necesarias
        if (!activo || typeof activo !== 'object') return false;
        
        const conceptoActivo = (activo.conceptoActivo || '').toLowerCase();
        const familia = (activo.familia || '').toLowerCase();
        const subFamilia = (activo.subFamilia || '').toLowerCase();
        const nomenclatura = (activo.nomenclatura || '').toLowerCase();
        
        return conceptoActivo.includes(textoBusqueda) ||
               familia.includes(textoBusqueda) ||
               subFamilia.includes(textoBusqueda) ||
               nomenclatura.includes(textoBusqueda);
    });

    mostrarResultadosAutocompletado(resultados);
}

// MOSTRAR RESULTADOS DE AUTocompletado (CORREGIDO)
function mostrarResultadosAutocompletado(resultados) {
    const contenedor = document.getElementById('autocompleteResults');
    
    if (resultados.length === 0) {
        contenedor.innerHTML = '<div class="autocomplete-item">No se encontraron activos</div>';
    } else {
        contenedor.innerHTML = resultados.map(activo => {
            // Validar y obtener datos del activo
            const conceptoActivo = activo.conceptoActivo || 'Sin nombre';
            const familia = activo.familia || 'No especificada';
            const subFamilia = activo.subFamilia || 'No especificada';
            const nomenclatura = activo.nomenclatura || 'N/A';
            
            return `
                <div class="autocomplete-item" onclick="seleccionarActivo(${JSON.stringify(activo).replace(/"/g, '&quot;')})">
                    <strong>${conceptoActivo}</strong><br>
                    <small>${familia} - ${subFamilia} | ${nomenclatura}</small>
                </div>
            `;
        }).join('');
    }
    
    contenedor.style.display = 'block';
}


// MOSTRAR AUTocompletado
function mostrarAutocompletado() {
    const input = document.getElementById('filtroActivo');
    if (input.value.trim().length >= 2) {
        buscarActivos(input.value.trim());
    }
}

// OCULTAR AUTocompletado
function ocultarAutocompletado() {
    document.getElementById('autocompleteResults').style.display = 'none';
}

// SELECCIONAR ACTIVO DEL AUTocompletado (CORREGIDO)
function seleccionarActivo(activo) {
    // Validar el activo seleccionado
    if (!activo || !activo.conceptoActivo) {
        console.error('Activo inválido seleccionado:', activo);
        return;
    }
    
    activoSeleccionado = activo;
    document.getElementById('filtroActivo').value = activo.conceptoActivo;
    ocultarAutocompletado();
    
    // Mostrar información del activo seleccionado
    mostrarInfoActivo(activo);
    
    // Cargar bitácora para este activo específico
    cargarBitacora();
}

// MOSTRAR INFORMACIÓN DEL ACTIVO SELECCIONADO (CORREGIDO)
function mostrarInfoActivo(activo) {
    const contenedor = document.getElementById('infoActivoSeleccionado');
    
    // Validar y obtener datos del activo
    const conceptoActivo = activo.conceptoActivo || 'Sin nombre';
    const familia = activo.familia || 'No especificada';
    const subFamilia = activo.subFamilia || 'No especificada';
    const nomenclatura = activo.nomenclatura || 'N/A';
    const numSerie = activo.numSerie || 'N/A';
    
    contenedor.innerHTML = `
        <h3>📋 Información del Activo Seleccionado</h3>
        <div class="detalles-activo">
            <div class="detalle-item"><strong>Nombre:</strong> ${conceptoActivo}</div>
            <div class="detalle-item"><strong>Familia:</strong> ${familia}</div>
            <div class="detalle-item"><strong>Sub Familia:</strong> ${subFamilia}</div>
            <div class="detalle-item"><strong>Nomenclatura:</strong> ${nomenclatura}</div>
            <div class="detalle-item"><strong>Número de Serie:</strong> ${numSerie}</div>
        </div>
    `;
    contenedor.style.display = 'block';
}

// FUNCIÓN PARA OBTENER FILTROS DEL FORMULARIO (CORREGIDA)
function obtenerFiltros() {
    const inputActivo = document.getElementById('filtroActivo').value.trim();
    
    return {
        activo: activoSeleccionado ? activoSeleccionado.conceptoActivo : inputActivo,
        estatus: document.getElementById('filtroEstatus').value,
        fecha: document.getElementById('filtroFecha').value
    };
}

// FUNCIÓN PARA OBTENER FILTROS DEL FORMULARIO
function obtenerFiltros() {
    return {
        activo: document.getElementById('filtroActivo').value.trim(),
        estatus: document.getElementById('filtroEstatus').value,
        fecha: document.getElementById('filtroFecha').value
    };
}

// FUNCIÓN PARA MOSTRAR ESTADÍSTICAS (MEJORADA)
function mostrarEstadisticas(estadisticas) {
    const contenedor = document.getElementById('estadisticas');
    
    // Asegurar que los valores sean números válidos
    const totalGastos = estadisticas.totalGastos || 0;
    const montoTotal = estadisticas.montoTotal || 0;
    const totalActivos = estadisticas.totalActivos || 0;
    const promedioPorActivo = estadisticas.promedioPorActivo || 0;
    
    console.log('📊 Mostrando estadísticas:', {
        totalGastos, montoTotal, totalActivos, promedioPorActivo
    });
    
    contenedor.innerHTML = `
        <div class="tarjeta-estadistica">
            <h3>Total de Gastos</h3>
            <div class="valor">${totalGastos.toLocaleString()}</div>
        </div>
        <div class="tarjeta-estadistica">
            <h3>Monto Total</h3>
            <div class="valor">$${(montoTotal).toLocaleString()}</div>
        </div>
        <div class="tarjeta-estadistica">
            <h3>Activos con Gastos</h3>
            <div class="valor">${totalActivos.toLocaleString()}</div>
        </div>
        <div class="tarjeta-estadistica">
            <h3>Promedio por Activo</h3>
            <div class="valor">$${Math.round(promedioPorActivo).toLocaleString()}</div>
        </div>
    `;
}

// FUNCIÓN PARA GENERAR TABLA DE GASTOS (MEJORADA)
function generarTablaGastos(gastos) {
    if (!gastos || !Array.isArray(gastos)) {
        return '<div class="sin-resultados">Error: Datos de gastos no válidos</div>';
    }

    return `
        <table class="tabla-gastos">
            <thead>
                <tr>
                    <th>Solicitud ID</th>
                    <th>Activo</th>
                    <th>Concepto de Gasto</th>
                    <th>Proveedor Seleccionado</th>
                    <th>Monto</th>
                    <th>Estatus</th>
                    <th>Fecha Creación</th>
                    <th>Tipo Gasto</th>
                </tr>
            </thead>
            <tbody>
                ${gastos.map(gasto => {
                    // Validar y formatear cada gasto
                    const solicitudId = gasto.solicitudId || 'N/A';
                    const conceptoActivo = gasto.activo?.conceptoActivo || 'Sin nombre';
                    const familia = gasto.activo?.familia || 'No especificada';
                    const subFamilia = gasto.activo?.subFamilia || 'No especificada';
                    const conceptoGasto = gasto.conceptoGasto || 'Sin concepto';
                    const proveedorInfo = gasto.proveedorSeleccionado ? 
                        `${gasto.proveedorSeleccionado.razonSocial || 'Sin nombre'}<br>
                         <small>${gasto.proveedorSeleccionado.nickName || ''}</small>` 
                        : '<em>No seleccionado</em>';
                    const monto = gasto.monto || 0;
                    const estatus = gasto.estatus || 'Desconocido';
                    const fechaCreacion = gasto.fechaCreacion ? 
                        new Date(gasto.fechaCreacion).toLocaleDateString() : 'N/A';
                    const tipoGasto = gasto.tipoGasto || 'No especificado';

                    return `
                    <tr>
                        <td>#${solicitudId}</td>
                        <td>
                            <strong>${conceptoActivo}</strong><br>
                            <small>${familia} - ${subFamilia}</small>
                        </td>
                        <td>${conceptoGasto}</td>
                        <td>${proveedorInfo}</td>
                        <td>$${monto.toLocaleString()}</td>
                        <td>
                            <span class="estatus-badge estatus-${estatus}">
                                ${estatus}
                            </span>
                        </td>
                        <td>${fechaCreacion}</td>
                        <td>${tipoGasto}</td>
                    </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// FUNCIÓN PRINCIPAL MEJORADA CON MÁS VALIDACIONES
async function cargarBitacora() {
    const contenedorResultados = document.getElementById('resultadosBitacora');
    const contenedorEstadisticas = document.getElementById('estadisticas');
    
    contenedorResultados.innerHTML = '<div class="cargando">Cargando bitácora de gastos...</div>';
    contenedorEstadisticas.innerHTML = '';

    try {
        const filtros = obtenerFiltros();
        const params = new URLSearchParams();
        
        if (filtros.activo) params.append('activo', filtros.activo);
        if (filtros.estatus) params.append('estatus', filtros.estatus);
        if (filtros.fecha) params.append('dias', filtros.fecha);

        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeBitacoraGastos/bitacora?${params.toString()}`, {
            headers: headers
        });

        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const resultado = await res.json();
        
        console.log('📦 Respuesta completa:', resultado);
        
        if (!resultado.success) {
            throw new Error(resultado.message || 'Error en la respuesta del servidor');
        }

        // Validar que los datos existan
        if (!resultado.data) {
            throw new Error('No se recibieron datos del servidor');
        }

        const datos = resultado.data;
        
        // Validar estadísticas
        if (!datos.estadisticas) {
            datos.estadisticas = {
                totalGastos: 0,
                montoTotal: 0,
                totalActivos: 0,
                promedioPorActivo: 0
            };
        }
        
        // Validar gastos
        if (!datos.gastos || !Array.isArray(datos.gastos)) {
            datos.gastos = [];
        }
        
        // MOSTRAR ESTADÍSTICAS
        mostrarEstadisticas(datos.estadisticas);
        
        // MOSTRAR RESULTADOS
        if (datos.gastos.length === 0) {
            contenedorResultados.innerHTML = `
                <div class="sin-resultados">
                    <h3>No se encontraron gastos</h3>
                    <p>No hay registros de gastos que coincidan con los filtros aplicados.</p>
                </div>
            `;
            return;
        }

        contenedorResultados.innerHTML = generarTablaGastos(datos.gastos);

    } catch (error) {
        console.error("❌ Error al cargar bitácora:", error);
        contenedorResultados.innerHTML = `
            <div class="sin-resultados">
                <h3>Error al cargar la bitácora</h3>
                <p>${error.message}</p>
                <button class="btn-buscar" onclick="cargarBitacora()">Reintentar</button>
            </div>
        `;
    }
}

// FUNCIÓN PARA DESCARGAR REPORTE (MEJORADA)
async function descargarReporte() {
    try {
        const filtros = obtenerFiltros();
        const params = new URLSearchParams();
        
        if (filtros.activo) params.append('activo', filtros.activo);
        if (filtros.estatus) params.append('estatus', filtros.estatus);
        if (filtros.fecha) params.append('dias', filtros.fecha);

        const headers = getAuthHeaders();
        const res = await fetch(`/api/routeBitacoraGastos/descargar-reporte?${params.toString()}`, {
            headers: headers
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.message || `Error ${res.status}: ${res.statusText}`);
        }

        // Verificar que la respuesta sea un blob válido
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
        a.download = `reporte-gastos-${new Date().toISOString().split('T')[0]}.xlsx`;
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
}