document.addEventListener("DOMContentLoaded", function() {
    if (!verificarAutenticacion()) {
        return;
    }
    
    // INICIALIZAR DASHBOARD
    inicializarDashboard();
});

async function inicializarDashboard() {
    try {
        // MOSTRAR ESQUELETO MIENTRAS CARGA
        mostrarEsqueleto();
        
        // CARGAR DATOS CON REINTENTOS
        await cargarDashboardConReintentos(3);
        
        // ACTUALIZAR AUTOMÁTICAMENTE CADA 5 MINUTOS
        iniciarActualizacionAutomatica();
        
    } catch (error) {
        console.error("Error al inicializar dashboard:", error);
    }
}

async function cargarDashboardConReintentos(maxReintentos = 3) {
    let intentos = 0;
    
    while (intentos < maxReintentos) {
        try {
            await cargarDashboard();
            
            // GUARDAR EN CACHE LOCAL SI FUE EXITOSO
            guardarEnCache();
            
            break; // Éxito, salir del bucle
            
        } catch (error) {
            intentos++;
            console.warn(`Intento ${intentos} fallido:`, error);
            
            // INTENTAR CARGAR DEL CACHE EN CASO DE ERROR
            if (intentos === 1) {
                if (await cargarDesdeCache()) {
                    console.log("Mostrando datos cacheados");
                    break;
                }
            }
            
            if (intentos === maxReintentos) {
                mostrarErrorFinal();
            } else {
                // MOSTRAR INTENTO ACTUAL
                mostrarMensajeIntento(intentos, maxReintentos);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
}

async function cargarDashboard() {
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username") || "Usuario";
    const userId = localStorage.getItem("userId");

    // ACTUALIZAR MENSAJE DE BIENVENIDA
    document.getElementById("welcomeMessage").textContent = 
        `Hola ${username}, tienes el rol de ${role}`;

    try {
        // MOSTRAR INDICADOR DE CARGA
        mostrarIndicadorCarga();
        
        // CARGAR ESTADÍSTICAS REALES (CONEXIÓN DIRECTA)
        const estadisticas = await cargarEstadisticasReales(role, userId);
        
        // OCULTAR INDICADOR DE CARGA
        ocultarIndicadorCarga();
        
        // MOSTRAR ESTADÍSTICAS
        mostrarEstadisticas(estadisticas, role);
        
        // CARGAR ACCIONES RÁPIDAS
        cargarAccionesRapidas(role);
        
        // CARGAR GRÁFICOS O DATOS ADICIONALES SI ES ADMINISTRADOR
        if (role === "Administrador") {
            await cargarDatosAdicionalesAdmin();
        }
        
        // AGREGAR GRÁFICO SIMPLE DE ACTIVIDAD RECIENTE
        await cargarGraficoActividad(role);
        
    } catch (error) {
        console.error("Error al cargar dashboard:", error);
        throw error;
    }
}

async function cargarEstadisticasReales(role, userId) {
    try {
        const headers = getAuthHeaders();
        
        if (!headers.Authorization) {
            throw new Error('Token no disponible');
        }

        // 1. OBTENER SOLICITUDES DE GASTO
        console.log("Cargando solicitudes de gasto...");
        const resSolicitudes = await fetch('/api/routeSolicitudGasto/solicitudesGasto', {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });

        if (resSolicitudes.status === 401) {
            localStorage.clear();
            window.location.href = "/html/index.html";
            return [];
        }

        if (!resSolicitudes.ok) {
            throw new Error(`Error HTTP: ${resSolicitudes.status}`);
        }
        
        const resultadoSolicitudes = await resSolicitudes.json();
        
        if (!resultadoSolicitudes.success) {
            throw new Error(resultadoSolicitudes.message || 'Error en la respuesta del servidor');
        }

        const solicitudes = resultadoSolicitudes.data || [];
        console.log(`✓ ${solicitudes.length} solicitudes cargadas`);

        // 2. OBTENER SOLICITUDES DE COMPRA SI ES NECESARIO
        let solicitudesCompra = [];
        if (role === "Administrador" || role === "Gerente General") {
            try {
                const resSolicitudesCompra = await fetch('/api/routeListaSolicitudCompra/solicitudes', {
                    method: 'GET',
                    headers: headers,
                    credentials: 'include'
                });
                
                if (resSolicitudesCompra.ok) {
                    const resultadoCompra = await resSolicitudesCompra.json();
                    solicitudesCompra = Array.isArray(resultadoCompra) ? resultadoCompra : [];
                    console.log(`✓ ${solicitudesCompra.length} solicitudes de compra cargadas`);
                }
            } catch (error) {
                console.warn("No se pudieron cargar solicitudes de compra:", error);
            }
        }

        // 3. CALCULAR ESTADÍSTICAS MEJORADAS
        return await calcularEstadisticasMejoradas(solicitudes, solicitudesCompra, role, userId);
        
    } catch (error) {
        console.error("Error en cargarEstadisticasReales:", error);
        throw error;
    }
}

async function calcularEstadisticasMejoradas(solicitudes, solicitudesCompra, role, userId) {
    // FECHAS PARA FILTROS
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo de esta semana
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hoy.getDate() - 30);

    // INICIALIZAR CONTADORES
    const conteoEstatus = {
        Pendiente: 0,
        Proceso: 0,
        Autorizada: 0,
        Cancelada: 0,
        Rechazada: 0,
        'En Proceso': 0
    };

    let montoTotalAutorizadas = 0;
    let montoTotalPendientes = 0;
    let montoTotalProceso = 0;
    let montoTotalMes = 0;
    let totalActivos = new Set();
    let solicitudesHoy = 0;
    let solicitudesSemana = 0;
    let solicitudesMes = 0;
    let solicitudesUsuario = 0;

    // PROCESAR SOLICITUDES DE GASTO
    solicitudes.forEach(solicitud => {
        const fechaCreacion = new Date(solicitud.fechaCreacion);
        const estatus = solicitud.estatusCompras || "Pendiente";
        
        // Contar por estatus
        conteoEstatus[estatus] = (conteoEstatus[estatus] || 0) + 1;
        
        // Calcular montos
        const monto = parseFloat(solicitud.montoTotal) || 0;
        
        if (estatus === "Autorizada") {
            montoTotalAutorizadas += monto;
        } else if (estatus === "Pendiente") {
            montoTotalPendientes += monto;
        } else if (estatus === "Proceso" || estatus === "En Proceso") {
            montoTotalProceso += monto;
        }
        
        // Montos del mes
        if (fechaCreacion >= inicioMes) {
            montoTotalMes += monto;
        }
        
        // Contar activos únicos
        if (solicitud.activos && Array.isArray(solicitud.activos)) {
            solicitud.activos.forEach(activo => {
                if (activo.conceptoActivo) {
                    totalActivos.add(activo.conceptoActivo);
                }
            });
        }
        
        // Contar por periodo
        if (fechaCreacion.toDateString() === hoy.toDateString()) {
            solicitudesHoy++;
        }
        if (fechaCreacion >= inicioSemana) {
            solicitudesSemana++;
        }
        if (fechaCreacion >= hace30Dias) {
            solicitudesMes++;
        }
        
        // Solicitudes del usuario actual (si hay userId)
        if (userId && solicitud.modificadoPor && solicitud.modificadoPor.userId === userId) {
            solicitudesUsuario++;
        }
    });

    // PROCESAR SOLICITUDES DE COMPRA SI EXISTEN
    let comprasPendientes = 0;
    let comprasAutorizadas = 0;
    
    if (Array.isArray(solicitudesCompra)) {
        solicitudesCompra.forEach(compra => {
            if (compra.estatusCompras === "Pendiente") {
                comprasPendientes++;
            } else if (compra.estatusCompras === "Autorizada") {
                comprasAutorizadas++;
            }
        });
    }

    // CONSTRUIR ARRAY DE ESTADÍSTICAS
    const estadisticasBase = [
        { 
            titulo: "Solicitudes Pendientes", 
            valor: conteoEstatus.Pendiente, 
            icon: "⏳", 
            color: "#f39c12",
            descripcion: "Esperando revisión",
            tendencia: solicitudesHoy > 0 ? `+${solicitudesHoy} hoy` : "Sin cambios hoy"
        },
        { 
            titulo: "En Proceso", 
            valor: conteoEstatus.Proceso + conteoEstatus['En Proceso'], 
            icon: "🔄", 
            color: "#3498db",
            descripcion: "En revisión/autorización",
            tendencia: "En revisión"
        },
        { 
            titulo: "Autorizadas", 
            valor: conteoEstatus.Autorizada, 
            icon: "✅", 
            color: "#27ae60",
            descripcion: "Aprobadas y listas",
            tendencia: montoTotalAutorizadas > 0 ? `$${montoTotalAutorizadas.toLocaleString()}` : "Sin autorizaciones"
        }
    ];

    // AGREGAR ESTADÍSTICAS ESPECÍFICAS POR ROL
    if (role === "Administrador") {
        estadisticasBase.push(
            { 
                titulo: "Monto del Mes", 
                valor: `$${montoTotalMes.toLocaleString()}`, 
                icon: "💰", 
                color: "#2ecc71",
                descripcion: "Total este mes",
                tendencia: `$${montoTotalMes.toLocaleString()}`
            },
            { 
                titulo: "Activos Únicos", 
                valor: totalActivos.size, 
                icon: "💻", 
                color: "#9b59b6",
                descripcion: "Conceptos diferentes",
                tendencia: `${totalActivos.size} registrados`
            },
            { 
                titulo: "Nuevas (7 días)", 
                valor: solicitudesSemana, 
                icon: "🆕", 
                color: "#e74c3c",
                descripcion: "Solicitudes recientes",
                tendencia: `+${solicitudesSemana} esta semana`
            },
            { 
                titulo: "Compras Pendientes", 
                valor: comprasPendientes, 
                icon: "🛒", 
                color: "#e67e22",
                descripcion: "Solicitudes de compra",
                tendencia: comprasAutorizadas > 0 ? `${comprasAutorizadas} autorizadas` : "Sin autorizaciones"
            }
        );
    } else if (role === "Jefe de Activos") {
        estadisticasBase.push(
            { 
                titulo: "Mis Solicitudes", 
                valor: solicitudesUsuario, 
                icon: "👤", 
                color: "#e67e22",
                descripcion: "Creadas por mí",
                tendencia: solicitudesUsuario > 0 ? `${solicitudesUsuario} creadas` : "Sin solicitudes"
            },
            { 
                titulo: "Monto Pendiente", 
                valor: `$${montoTotalPendientes.toLocaleString()}`, 
                icon: "💸", 
                color: "#f1c40f",
                descripcion: "Total pendiente",
                tendencia: `$${montoTotalPendientes.toLocaleString()}`
            },
            { 
                titulo: "Por Enviar", 
                valor: conteoEstatus.Pendiente, 
                icon: "📤", 
                color: "#3498db",
                descripcion: "Listas para enviar",
                tendencia: "Listas para proceso"
            }
        );
    } else if (role === "Gerente General") {
        estadisticasBase.push(
            { 
                titulo: "Por Autorizar", 
                valor: conteoEstatus.Proceso, 
                icon: "📝", 
                color: "#e67e22",
                descripcion: "Esperando su firma",
                tendencia: `$${montoTotalProceso.toLocaleString()} en espera`
            },
            { 
                titulo: "Monto en Proceso", 
                valor: `$${montoTotalProceso.toLocaleString()}`, 
                icon: "💳", 
                color: "#2ecc71",
                descripcion: "En espera de autorización",
                tendencia: `$${montoTotalProceso.toLocaleString()}`
            },
            { 
                titulo: "Autorizaciones Pendientes", 
                valor: comprasPendientes, 
                icon: "✅", 
                color: "#9b59b6",
                descripcion: "Compras por autorizar",
                tendencia: `${comprasPendientes} por revisar`
            }
        );
    }

    return estadisticasBase;
}

function mostrarEstadisticas(estadisticas, role) {
    const statsContainer = document.getElementById("statsContainer");
    
    if (estadisticas.length === 0) {
        statsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7f8c8d;">
                <div style="font-size: 4rem;">📊</div>
                <h3>No hay datos disponibles</h3>
                <p>No se encontraron solicitudes para mostrar.</p>
                <button onclick="cargarDashboard()" 
                        style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Actualizar
                </button>
            </div>
        `;
        return;
    }

    statsContainer.innerHTML = estadisticas.map(stat => `
        <div class="stat-card" style="border-left: 4px solid ${stat.color}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <div style="font-size: 2rem;">${stat.icon}</div>
                <div style="font-size: 0.7rem; color: #fff; background: ${stat.color}; padding: 3px 8px; border-radius: 12px; font-weight: bold;">
                    ${stat.tendencia || ''}
                </div>
            </div>
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 0.9rem;">${stat.titulo}</h3>
            <div style="font-size: 1.8rem; font-weight: bold; color: ${stat.color}; margin-bottom: 5px;">
                ${stat.valor}
            </div>
            <div style="font-size: 0.8rem; color: #7f8c8d;">
                ${stat.descripcion}
            </div>
            <div class="stat-progress" style="margin-top: 10px; height: 4px; background: #ecf0f1; border-radius: 2px; overflow: hidden;">
                <div style="height: 100%; width: ${Math.min(100, parseInt(stat.valor) * 10)}%; background: ${stat.color}; transition: width 1s ease;"></div>
            </div>
        </div>
    `).join('');
    
    // ANIMACIÓN DE ENTRADA
    setTimeout(() => {
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
}

async function cargarGraficoActividad(role) {
    const actionsContainer = document.getElementById("quickActions");
    if (!actionsContainer) return;
    
    try {
        const headers = getAuthHeaders();
        const res = await fetch('/api/routeSolicitudGasto/solicitudesGasto?limit=5', {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        });
        
        if (res.ok) {
            const resultado = await res.json();
            const solicitudesRecientes = resultado.data?.slice(0, 5) || [];
            
            if (solicitudesRecientes.length > 0) {
                // AGREGAR SECCIÓN DE ACTIVIDAD RECIENTE
                const actividadHTML = `
                    <div style="grid-column: 1 / -1; margin-top: 30px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3 style="margin-top: 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                            📈 Actividad Reciente
                        </h3>
                        <div style="max-height: 200px; overflow-y: auto;">
                            ${solicitudesRecientes.map(solicitud => `
                                <div style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: bold; color: #2c3e50;">${solicitud.descripcionGasto || 'Sin descripción'}</div>
                                        <div style="font-size: 0.8rem; color: #7f8c8d;">
                                            ${new Date(solicitud.fechaCreacion).toLocaleDateString()}
                                            • ${solicitud.estatusCompras || 'Pendiente'}
                                        </div>
                                    </div>
                                    <span style="background: ${getColorByStatus(solicitud.estatusCompras)}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.7rem;">
                                        $${parseFloat(solicitud.montoTotal || 0).toLocaleString()}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                actionsContainer.insertAdjacentHTML('afterend', actividadHTML);
            }
        }
    } catch (error) {
        console.warn("No se pudo cargar actividad reciente:", error);
    }
}

function getColorByStatus(status) {
    const colors = {
        'Autorizada': '#27ae60',
        'Pendiente': '#f39c12',
        'Proceso': '#3498db',
        'Cancelada': '#e74c3c',
        'Rechazada': '#95a5a6'
    };
    return colors[status] || '#7f8c8d';
}

// FUNCIONES DE CACHE
async function guardarEnCache() {
    try {
        const cacheData = {
            estadisticas: document.getElementById("statsContainer").innerHTML,
            acciones: document.getElementById("quickActions").innerHTML,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('dashboardCache', JSON.stringify(cacheData));
    } catch (error) {
        console.warn("No se pudo guardar en cache:", error);
    }
}

async function cargarDesdeCache() {
    try {
        const cacheStr = localStorage.getItem('dashboardCache');
        if (!cacheStr) return false;
        
        const cacheData = JSON.parse(cacheStr);
        const ahora = new Date().getTime();
        const diferenciaHoras = (ahora - cacheData.timestamp) / (1000 * 60 * 60);
        
        // USAR CACHE SI TIENE MENOS DE 2 HORAS
        if (diferenciaHoras < 2) {
            document.getElementById("statsContainer").innerHTML = cacheData.estadisticas;
            document.getElementById("quickActions").innerHTML = cacheData.acciones;
            
            // AGREGAR INDICADOR DE CACHE
            const welcomeCard = document.querySelector('.welcome-card');
            if (welcomeCard) {
                const cacheIndicator = document.createElement('div');
                cacheIndicator.style.cssText = `
                    font-size: 0.8rem;
                    color: #7f8c8d;
                    margin-top: 10px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                `;
                cacheIndicator.innerHTML = `
                    🔄 Datos cacheados • Actualizados hace ${Math.round(diferenciaHoras * 60)} minutos
                    <button onclick="cargarDashboardConReintentos()" style="margin-left: 10px; background: #3498db; color: white; border: none; padding: 2px 8px; border-radius: 3px; font-size: 0.7rem; cursor: pointer;">
                        Actualizar
                    </button>
                `;
                welcomeCard.appendChild(cacheIndicator);
            }
            
            return true;
        }
    } catch (error) {
        console.warn("Error al cargar cache:", error);
    }
    return false;
}

// FUNCIONES DE UI MEJORADAS
function mostrarEsqueleto() {
    const statsContainer = document.getElementById("statsContainer");
    statsContainer.innerHTML = `
        ${Array(6).fill().map(() => `
            <div class="skeleton-card">
                <div class="skeleton-icon"></div>
                <div class="skeleton-title"></div>
                <div class="skeleton-value"></div>
            </div>
        `).join('')}
    `;
}

function mostrarIndicadorCarga() {
    let indicator = document.getElementById('loadingIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'loadingIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #3498db, #2ecc71, #3498db);
            background-size: 200% 100%;
            animation: loading 1.5s infinite linear;
            z-index: 1000;
        `;
        document.body.appendChild(indicator);
        
        // AGREGAR ANIMACIÓN CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .skeleton-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .skeleton-icon {
                width: 40px;
                height: 40px;
                background: #ecf0f1;
                border-radius: 50%;
                margin-bottom: 15px;
            }
            .skeleton-title {
                width: 70%;
                height: 16px;
                background: #ecf0f1;
                border-radius: 4px;
                margin-bottom: 10px;
            }
            .skeleton-value {
                width: 50%;
                height: 24px;
                background: #ecf0f1;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }
}

function ocultarIndicadorCarga() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.style.transition = 'opacity 0.3s';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }
}

function mostrarMensajeIntento(intento, maxIntentos) {
    const statsContainer = document.getElementById("statsContainer");
    statsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: #f39c12;">
            <div style="font-size: 3rem;">🔄</div>
            <h3>Reintentando conexión...</h3>
            <p>Intento ${intento} de ${maxIntentos}</p>
            <div style="width: 200px; height: 4px; background: #ecf0f1; margin: 20px auto; border-radius: 2px; overflow: hidden;">
                <div style="width: ${(intento/maxIntentos)*100}%; height: 100%; background: #f39c12; transition: width 0.5s;"></div>
            </div>
        </div>
    `;
}

function mostrarErrorFinal() {
    const statsContainer = document.getElementById("statsContainer");
    statsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
            <div style="font-size: 4rem;">😞</div>
            <h3>No se pudieron cargar los datos</h3>
            <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button onclick="cargarDashboardConReintentos()" 
                        style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                    Reintentar
                </button>
                <button onclick="window.location.reload()" 
                        style="background: #95a5a6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                    Recargar Página
                </button>
            </div>
        </div>
    `;
}

function iniciarActualizacionAutomatica() {
    // ACTUALIZAR CADA 5 MINUTOS
    setInterval(() => {
        console.log("Actualización automática del dashboard...");
        cargarDashboardConReintentos(1); // 1 solo intento para actualización automática
    }, 5 * 60 * 1000);
}

// LAS FUNCIONES EXISTENTES SE MANTIENEN IGUAL O CON MEJORAS MENORES
function cargarAccionesRapidas(role) {
    const quickActions = document.getElementById('quickActions');
    
    let acciones = [];
    
    if (role === "Administrador") {
        acciones = [
            { texto: "Ver Todas las Solicitudes", url: "/html/listasolicitudgasto.html", icon: "📋", color: "#3498db" },
            { texto: "Bitácora de Gastos", url: "/html/bitacoraGastos.html", icon: "📊", color: "#2ecc71" },
            { texto: "Reportes Completos", url: "/html/bitacoraGastos.html", icon: "📈", color: "#9b59b6" },
            { texto: "Gestionar Sistema", url: "#", icon: "⚙️", color: "#7f8c8d" }
        ];
    } else if (role === "Jefe de Activos") {
        acciones = [
            { texto: "Nueva Solicitud de Gasto", url: "/html/solicitudGasto.html", icon: "➕", color: "#27ae60" },
            { texto: "Nueva Solicitud de Compra", url: "/html/comprasActivos.html", icon: "📝", color: "#3498db" },
            { texto: "Solicitudes Pendientes Gasto", url: "/html/listasolicitudgasto.html?estatus=Pendiente", icon: "⏳", color: "#f39c12" },
            { texto: "Registrar Nueva Solicitud Compra", url: "/html/comprasActivos.html", icon: "💻", color: "#9b59b6" }
        ];
    } else if (role === "Gerente General") {
        acciones = [
            { texto: "Revisar Solicitudes Gasto", url: "/html/listasolicitudgasto.html?estatus=Proceso", icon: "👀", color: "#3498db" },
            { texto: "Revisar Solicitudes Compras", url: "/html/listaSolicitudCompras.html?estatus=Proceso", icon: "✅", color: "#27ae60" },
            { texto: "Bitacoras Compras", url: "/html/bitacoraCompras.html", icon: "📊", color: "#9b59b6" },
            { texto: "Bitacoras Gastos", url: "/html/bitacoraGastos.html", icon: "💰", color: "#f1c40f" }
        ];
    }
    
    quickActions.innerHTML = acciones.map(accion => `
        <button class="action-btn" onclick="window.location.href='${accion.url}'" 
                style="background: ${accion.color}; border-left: 4px solid ${accion.color}40;">
            <span style="font-size: 1.5rem; margin-right: 10px;">${accion.icon}</span>
            <div style="text-align: left;">
                <div style="font-weight: bold;">${accion.texto}</div>
            </div>
            <span style="margin-left: auto; font-size: 1.2rem;">→</span>
        </button>
    `).join('');
}

// LAS FUNCIONES getAuthHeaders() Y verificarAutenticacion() SE MANTIENEN IGUAL

// FUNCIÓN MEJORADA PARA OBTENER EL TOKEN
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        console.error("No se encontró token en localStorage");
        window.location.href = "/html/index.html";
        return {};
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// VERIFICAR AUTENTICACIÓN AL INICIO
function verificarAutenticacion() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || !role) {
        console.warn("No hay token o rol, redirigiendo al login");
        window.location.href = "/html/index.html";
        return false;
    }
    
    // VERIFICAR SI EL TOKEN ES VÁLIDO (formato básico)
    if (token.length < 10) {
        console.warn("Token inválido, redirigiendo al login");
        localStorage.clear();
        window.location.href = "/html/index.html";
        return false;
    }
    
    return true;
}