document.addEventListener("DOMContentLoaded", function() {
    cargarDashboard();
});

function cargarDashboard(){
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username") || "Usuario";

    //MENSAJE DE BIENVENIDO 
    document.getElementById("welcomeMessage").textContent = 
        `Hola ${username}, tienes el rol de ${role}`;

    //CARGAR ESTADISTICAS Y ACCIONES SEGUN EL ROL 
    cargarEstadisticas(role);
    cargarAccionesRapidas(role);
}

function cargarEstadisticas(role){
    const statsContainer = document.getElementById("statsContainer");

    const estadisticasComunes =[
        { titulo: "solicitudes Pendientes", valor: "5", icon: "", color: "#f39c12"},
        { titulo: "Solicitudes Autorizadas", valor:"12", icon:"", color:"#27ae60"}
    ];

    let estadisticas = [...estadisticasComunes];

    //AGREGAR ESTADISTICAS ESPECIFICAS POR ROL 
    if(role === "Administrador"){
        estadisticas.push(
            { titulo: "Total Usuarios", valor: 25, icon: "", color: "#3498db"},
            { titulo: "Activos Registrados", valor: "150", icon: "", color: "#9b59b6"}
        );
    }else if(role === "Jefe de Activoss"){
        estadisticas.push(
            { titulo: "Activos por Registrar", valor: "8", icon: "", color: "#e74c3c"},
            { titulo: "Proveedores", valor: "15", icon: "", color: "#1abc9c"}
        );
    }else if (role === "Gerente General") {
        estadisticas.push(
            { titulo: "Por Autorizar", valor: "3", icon: "📝", color: "#e67e22" },
            { titulo: "Presupuesto Mensual", valor: "$50,000", icon: "💰", color: "#2ecc71" }
        );
    }

    statsContainer.innerHTML = estadisticas.map(stat => `
        <div class="stat-card" style="border-left: 4px solid ${stat.color}">
            <div style="font-size: 2rem; margin-bottom: 10px;">${stat.icon}</div>
            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">${stat.titulo}</h3>
            <div style="font-size: 1.5rem; font-weight: bold; color: ${stat.color}">
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
            { texto: "Gestionar Usuarios", url: "/html/gestionUsuarios.html", icon: "👥" },
            { texto: "Ver Reportes", url: "/html/reportes.html", icon: "📊" },
            { texto: "Configuración", url: "/html/configuracion.html", icon: "⚙️" }
        ];
    } else if (role === "Jefe de Activos") {
        acciones = [
            { texto: "Nueva Solicitud", url: "/html/comprasActivos.html", icon: "➕" },
            { texto: "Ver Inventario", url: "/html/inventario.html", icon: "📦" },
            { texto: "Registrar Activo", url: "/html/registroActivo.html", icon: "💻" }
        ];
    } else if (role === "Gerente General") {
        acciones = [
            { texto: "Revisar Solicitudes", url: "/html/listaSolicitudCompra.html", icon: "📋" },
            { texto: "Autorizaciones", url: "/html/autorizaciones.html", icon: "✅" },
            { texto: "Reportes Financieros", url: "/html/reportes.html", icon: "💰" }
        ];
    }
    
    quickActions.innerHTML = acciones.map(accion => `
        <button class="action-btn" onclick="window.location.href='${accion.url}'">
            <span style="font-size: 1.2rem; margin-right: 8px;">${accion.icon}</span>
            ${accion.texto}
        </button>
    `).join('');
}