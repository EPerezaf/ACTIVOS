document.addEventListener("DOMContentLoaded", function() {
    if (!verificarAutenticacion()) {
        return;
    }
    
    // CARGAR DASHBOARD CON REINTENTOS
    cargarDashboardConReintentos();
});

async function cargarDashboardConReintentos(maxReintentos = 3) {
    let intentos = 0;
    
    while (intentos < maxReintentos) {
        try {
            await cargarDashboard();
            break; // Éxito, salir del bucle
        } catch (error) {
            intentos++;
            console.warn(`Intento ${intentos} fallido:`, error);
            
            if (intentos === maxReintentos) {
                // MOSTRAR ERROR FINAL
                const statsContainer = document.getElementById("statsContainer");
                statsContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
                        <div style="font-size: 4rem;">😞</div>
                        <h3>No se pudieron cargar los datos</h3>
                        <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
                        <button onclick="cargarDashboardConReintentos()" 
                                style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                            Reintentar
                        </button>
                    </div>
                `;
            } else {
                // ESPERAR ANTES DEL SIGUIENTE INTENTO
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
}

async function cargarDashboard(){
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username") || "Usuario";

    // MENSAJE DE BIENVENIDA 
    document.getElementById("welcomeMessage").textContent = 
        `Hola ${username}, tienes el rol de ${role}`;

    try {
        // CARGAR ESTADÍSTICAS REALES
        await cargarEstadisticasReales(role);
        
        // CARGAR ACCIONES RÁPIDAS
        cargarAccionesRapidas(role);
        
        // CARGAR GRÁFICOS O DATOS ADICIONALES SI ES ADMINISTRADOR
        if (role === "Administrador") {
            await cargarDatosAdicionalesAdmin();
        }
        
    } catch (error) {
        console.error("Error al cargar dashboard:", error);
        mostrarEstadisticasPorDefecto(role);
    }
}

async function cargarEstadisticasReales(role) {
    const statsContainer = document.getElementById("statsContainer");
    statsContainer.innerHTML = '<div class="cargando">Cargando estadísticas...</div>';

    try {
        const headers = getAuthHeaders();
        
        // VERIFICAR SI TENEMOS HEADERS VÁLIDOS
        if (!headers.Authorization) {
            throw new Error('Token no disponible');
        }
        
        console.log("Realizando solicitud con token:", headers.Authorization.substring(0, 20) + "...");

        // CARGAR DATOS DE SOLICITUDES
        const resSolicitudes = await fetch('/api/routeSolicitudGasto/solicitudesGasto', {
            method: 'GET',
            headers: headers,
            credentials: 'include' // IMPORTANTE para cookies de sesión
        });

        console.log("Respuesta del servidor:", resSolicitudes.status, resSolicitudes.statusText);

        if (resSolicitudes.status === 401) {
            // TOKEN EXPIRADO O INVÁLIDO
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("username");
            window.location.href = "/html/index.html";
            return;
        }

        if (!resSolicitudes.ok) {
            throw new Error(`Error HTTP: ${resSolicitudes.status} ${resSolicitudes.statusText}`);
        }
        
        const resultadoSolicitudes = await resSolicitudes.json();
        console.log("Datos recibidos:", resultadoSolicitudes);
        
        if (!resultadoSolicitudes.success) {
            throw new Error(resultadoSolicitudes.message || 'Error en la respuesta del servidor');
        }

        const solicitudes = resultadoSolicitudes.data;
        
        // CALCULAR ESTADÍSTICAS
        const estadisticas = await calcularEstadisticas(solicitudes, role);
        
        // MOSTRAR ESTADÍSTICAS
        mostrarEstadisticas(estadisticas, role);
        
    } catch (error) {
        console.error("Error al cargar estadísticas reales:", error);
        
        // MOSTRAR ESTADÍSTICAS POR DEFECTO EN CASO DE ERROR
        mostrarEstadisticasPorDefecto(role);
        
        // MOSTRAR MENSAJE DE ERROR AL USUARIO
        const statsContainer = document.getElementById("statsContainer");
        statsContainer.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #e74c3c;">
                <div style="font-size: 3rem;">⚠️</div>
                <h3>Error al cargar estadísticas</h3>
                <p>${error.message}</p>
                <button onclick="cargarDashboard()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
        
        throw error;
    }
}

async function calcularEstadisticas(solicitudes, role) {
    // CONTAR POR ESTATUS
    const conteoEstatus = {
        Pendiente: 0,
        Proceso: 0,
        Autorizada: 0,
        Cancelada: 0,
        Rechazada: 0
    };

    let montoTotalAutorizadas = 0;
    let montoTotalPendientes = 0;
    let totalActivos = new Set();
    let solicitudesRecientes = 0;

    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    solicitudes.forEach(solicitud => {
        // Contar por estatus
        conteoEstatus[solicitud.estatusCompras] = (conteoEstatus[solicitud.estatusCompras] || 0) + 1;
        
        // Calcular montos
        if (solicitud.estatusCompras === "Autorizada") {
            montoTotalAutorizadas += solicitud.montoTotal || 0;
        } else if (solicitud.estatusCompras === "Pendiente") {
            montoTotalPendientes += solicitud.montoTotal || 0;
        }
        
        // Contar activos únicos
        if (solicitud.activos && Array.isArray(solicitud.activos)) {
            solicitud.activos.forEach(activo => {
                if (activo.conceptoActivo) {
                    totalActivos.add(activo.conceptoActivo);
                }
            });
        }
        
        // Solicitudes recientes (últimos 7 días)
        if (new Date(solicitud.fechaCreacion) > hace7Dias) {
            solicitudesRecientes++;
        }
    });

    const estadisticasBase = [
        { 
            titulo: "Solicitudes Pendientes", 
            valor: conteoEstatus.Pendiente, 
            icon: "⏳", 
            color: "#f39c12",
            descripcion: "Esperando revisión"
        },
        { 
            titulo: "Solicitudes Autorizadas", 
            valor: conteoEstatus.Autorizada, 
            icon: "✅", 
            color: "#27ae60",
            descripcion: "Aprobadas y listas"
        },
        { 
            titulo: "En Proceso", 
            valor: conteoEstatus.Proceso, 
            icon: "🔄", 
            color: "#3498db",
            descripcion: "En revisión/autorización"
        }
    ];

    // AGREGAR ESTADÍSTICAS ESPECÍFICAS POR ROL
    if (role === "Administrador") {
        estadisticasBase.push(
            { 
                titulo: "Monto Autorizado", 
                valor: `$${montoTotalAutorizadas.toLocaleString()}`, 
                icon: "💰", 
                color: "#2ecc71",
                descripcion: "Total autorizado"
            },
            { 
                titulo: "Activos con Gastos", 
                valor: totalActivos.size, 
                icon: "💻", 
                color: "#9b59b6",
                descripcion: "Activos registrados"
            },
            { 
                titulo: "Nuevas (7 días)", 
                valor: solicitudesRecientes, 
                icon: "🆕", 
                color: "#e74c3c",
                descripcion: "Solicitudes recientes"
            }
        );
    } else if (role === "Jefe de Activos") {
        estadisticasBase.push(
            { 
                titulo: "Por Enviar a Proceso", 
                valor: conteoEstatus.Pendiente, 
                icon: "📤", 
                color: "#e67e22",
                descripcion: "Listas para enviar"
            },
            { 
                titulo: "Monto Pendiente", 
                valor: `$${montoTotalPendientes.toLocaleString()}`, 
                icon: "💸", 
                color: "#f1c40f",
                descripcion: "Total pendiente de autorización"
            }
        );
    } else if (role === "Gerente General") {
        estadisticasBase.push(
            { 
                titulo: "Por Autorizar", 
                valor: conteoEstatus.Proceso, 
                icon: "📝", 
                color: "#e67e22",
                descripcion: "Esperando su autorización"
            },
            { 
                titulo: "Monto en Proceso", 
                valor: `$${solicitudes
                    .filter(s => s.estatusCompras === "Proceso")
                    .reduce((sum, s) => sum + (s.montoTotal || 0), 0)
                    .toLocaleString()}`, 
                icon: "💳", 
                color: "#2ecc71",
                descripcion: "En espera de autorización"
            }
        );
    }

    return estadisticasBase;
}

function mostrarEstadisticas(estadisticas, role) {
    const statsContainer = document.getElementById("statsContainer");

    statsContainer.innerHTML = estadisticas.map(stat => `
        <div class="stat-card" style="border-left: 4px solid ${stat.color}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <div style="font-size: 2rem;">${stat.icon}</div>
                <div style="font-size: 0.8rem; color: #7f8c8d; background: #f8f9fa; padding: 4px 8px; border-radius: 12px;">
                    ${stat.descripcion}
                </div>
            </div>
            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 0.9rem;">${stat.titulo}</h3>
            <div style="font-size: 1.8rem; font-weight: bold; color: ${stat.color}">
                ${stat.valor}
            </div>
        </div>
    `).join('');
}

function cargarAccionesRapidas(role) {
    const quickActions = document.getElementById('quickActions');
    
    let acciones = [];
    
    if (role === "Administrador") {
        acciones = [
            { texto: "Ver Todas las Solicitudes", url: "/html/listasolicitudgasto.html", icon: "📋" },
            { texto: "Bitácora de Gastos", url: "/html/bitacoraGastos.html", icon: "📊" },
            { texto: "Reportes Completos", url: "/html/bitacoraGastos.html", icon: "📈" },
            { texto: "Gestionar Sistema", url: "#", icon: "⚙️" }
        ];
    } else if (role === "Jefe de Activos") {
        acciones = [
            { texto: "Nueva Solicitud de Gasto", url: "/html/solicitudGasto.html", icon: "➕" },
            { texto: "Mis Solicitudes", url: "/html/listasolicitudgasto.html?filtro=misSolicitudes", icon: "📝" },
            { texto: "Solicitudes Pendientes", url: "/html/listasolicitudgasto.html?estatus=Pendiente", icon: "⏳" },
            { texto: "Registrar Nuevo Activo", url: "/html/registroActivo.html", icon: "💻" }
        ];
    } else if (role === "Gerente General") {
        acciones = [
            { texto: "Revisar Solicitudes", url: "/html/listasolicitudgasto.html?estatus=Proceso", icon: "👀" },
            { texto: "Solicitudes por Autorizar", url: "/html/listasolicitudgasto.html?estatus=Proceso", icon: "✅" },
            { texto: "Historial Autorizadas", url: "/html/listasolicitudgasto.html?estatus=Autorizada", icon: "📊" },
            { texto: "Reportes Financieros", url: "/html/bitacoraGastos.html", icon: "💰" }
        ];
    }
    
    quickActions.innerHTML = acciones.map(accion => `
        <button class="action-btn" onclick="window.location.href='${accion.url}'">
            <span style="font-size: 1.5rem; margin-right: 10px;">${accion.icon}</span>
            <div>
                <div style="font-weight: bold;">${accion.texto}</div>
            </div>
        </button>
    `).join('');
}

async function cargarDatosAdicionalesAdmin() {
    try {
        // PODRÍAS AGREGAR MÁS DATOS ESPECÍFICOS PARA ADMIN AQUÍ
        console.log("Cargando datos adicionales para administrador...");
        
        // Por ejemplo: cargar gráficos, estadísticas avanzadas, etc.
        
    } catch (error) {
        console.error("Error al cargar datos adicionales:", error);
    }
}

function mostrarEstadisticasPorDefecto(role) {
    const statsContainer = document.getElementById("statsContainer");
    
    const estadisticasPorDefecto = [
        { titulo: "Solicitudes Pendientes", valor: "0", icon: "⏳", color: "#f39c12" },
        { titulo: "Solicitudes Autorizadas", valor: "0", icon: "✅", color: "#27ae60" },
        { titulo: "En Proceso", valor: "0", icon: "🔄", color: "#3498db" }
    ];
    
    statsContainer.innerHTML = estadisticasPorDefecto.map(stat => `
        <div class="stat-card" style="border-left: 4px solid ${stat.color}">
            <div style="font-size: 2rem; margin-bottom: 10px;">${stat.icon}</div>
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${stat.titulo}</h3>
            <div style="font-size: 1.5rem; font-weight: bold; color: ${stat.color}">
                ${stat.valor}
            </div>
        </div>
    `).join('');
}

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