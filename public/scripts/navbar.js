// scripts/navbar.js

// Configuración de rutas por rol con menús desplegables
const rutasPorRol = {
    "Administrador": [
        { 
            nombre: "Inicio", 
            url: "/html/dashboard.html", 
            icon: "🏠",
            tipo: "simple"
        },
        { 
            nombre: "Altas", 
            icon: "📋",
            tipo: "dropdown",
            submenu: [
                { nombre: "Alta Familia", url: "/html/conceptoFamiliaActivos.html", icon: "🛒" },
                { nombre: "Alta Sub Familia", url: "/html/conceptoSubFamilia.html", icon: "" },
                { nombre: "Alta Concepto Activo", url: "/html/conceptoActivos.html", icon: "" },
                { nombre: "Concepto Gasto", url: "/html/conceptoGasto.html", icon: "" },
                { nombre: "Alta Personal", url: "/html/personal.html", icon: ""},
                { nombre: "Alta Proveedor", url: "/html/altaProveedor.html", icon: ""},
            ]
        },
        { 
            nombre: "Solicitudes", 
            icon: "📋",
            tipo: "dropdown",
            submenu: [
                { nombre: "Solicitud de Compra", url: "/html/comprasActivos.html", icon: "🛒" },
                { nombre: "Solicitud de Gasto", url: "/html/solicitudGasto.html", icon: "💰" },
            ]
        },
        {
            nombre: "Listas",
            icon: "📃",
            tipo: "dropdown",
            submenu: [
                {nombre: "Lista de Familia", url: "/html/listaFamilia.html", icon: "" },
                { nombre: "Lista de Sub Familia", url: "/html/listaSubFamilia.html", icon: "" },
                { nombre: "Lista de Concepto Activos", url: "/html/listaConceptoActivo.html", icon: ""},
                { nombre: "Lista de Concepto Gasto", url: "/html/listaConceptoGasto.html", icon: ""},
                { nombre: "Lista de Personal", url: "/html/listaPersonal.html", icon: ""},
                { nombre: "Lista de Proveedores", url: "/html/listaProveedores.html", icon: ""},
                { nombre: "Lista Solicitud Compra", url: "/html/listaSolicitudCompras.html", icon: ""},
                { nombre: "Lista de Solicitud Gasto", url:"/html/listaSolicitudGasto.html", icon: ""},
                { nombre: "Lista de Activos", url: "/html/listaRegistroActivo.html", icon: ""},
            ]
        },
    ],
    "Gerente General": [
        { 
            nombre: "Inicio", 
            url: "/html/dashboard.html", 
            icon: "🏠",
            tipo: "simple"
        },
        { 
            nombre: "Solicitudes", 
            icon: "📋",
            tipo: "dropdown",
            submenu: [
                { nombre: "Lista de Compras", url: "/html/listaSolicitudCompras.html", icon: "🛒" },
                { nombre: "Lista de Gastos", url: "/html/listaSolicitudGasto.html", icon: "💰" },
            ]
        },
        {
            nombre: "Bitacora",
            url: "/html/bitacoraGastos.html",
            icon: "📈",
            tipo: "simple",
        }
    ],
    "Jefe de Activos": [
        { 
            nombre: "Inicio", 
            url: "/html/dashboard.html", 
            icon: "🏠",
            tipo: "simple"
        },
        { 
            nombre: "Altas", 
            icon: "📋",
            tipo: "dropdown",
            submenu: [
                { nombre: "Alta Familia", url: "/html/conceptoFamiliaActivos.html", icon: "🛒" },
                { nombre: "Alta Sub Familia", url: "/html/conceptoSubFamilia.html", icon: "" },
                { nombre: "Alta Concepto Activo", url: "/html/conceptoActivos.html", icon: "" },
                { nombre: "Concepto Gasto", url: "/html/conceptoGasto.html", icon: "" },
                { nombre: "Alta Personal", url: "/html/personal.html", icon: ""},
                { nombre: "Alta Proveedor", url: "/html/altaProveedor.html", icon: ""},
            ]
        },
        { 
            nombre: "Solicitudes", 
            icon: "📋",
            tipo: "dropdown",
            submenu: [
                { nombre: "Solicitud de Compra", url: "/html/comprasActivos.html", icon: "🛒" },
                { nombre: "Solicitud de Gasto", url: "/html/solicitudGasto.html", icon: "💰" },
            ]
        },
        {
            nombre: "Listas",
            icon: "📃",
            tipo: "dropdown",
            submenu: [
                {nombre: "Lista de Familia", url: "/html/listaFamilia.html", icon: "" },
                { nombre: "Lista de Sub Familia", url: "/html/listaSubFamilia.html", icon: "" },
                { nombre: "Lista de Concepto Activos", url: "/html/listaConceptoActivo.html", icon: ""},
                { nombre: "Lista de Concepto Gasto", url: "/html/listaConceptoGasto.html", icon: ""},
                { nombre: "Lista de Personal", url: "/html/listaPersonal.html", icon: ""},
                { nombre: "Lista de Proveedores", url: "/html/listaProveedores.html", icon: ""},
                { nombre: "Lista de Solicitudes de Compras", url: "/html/listaSolicitudCompras.html", icon: ""},
                { nombre: "Lista de Solicitud Gasto", url:"/html/listaSolicitudGasto.html", icon: ""},
                { nombre: "Lista de Activos", url: "/html/listaRegistroActivo.html", icon: ""},
            ]
        },
        {
            nombre: "Bitacora",
            url: "/html/bitacoraGastos.html",
            icon: "📈",
            tipo: "simple",
        }
    ]
};
//FUNCION PARA CARGAR CSS DINAMICAMENTE
function cargarEstilosNavbar(){
    //VERIFICAR SI EL CSS YA ESTA CARGADO
    if(document.getElementById("navbar-styles")){
        return;
    }

    const link = document.createElement("link");
    link.id = "navbar-styles";
    link.rel = "stylesheet";
    link.hrfe = "/styles/navbar.css";
    document.head.appendChild(link);
}


// Función para crear el navbar con menús desplegables
function crearNavbar() {
    //CARGAR LOS ESTILOS PRIMERO
    cargarEstilosNavbar();

    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username") || "Usuario";
    
    if (!role) {
        console.error("No se encontró el rol del usuario");
        return;
    }

    const rutas = rutasPorRol[role] || [];

    const navbarHTML = `
        <nav class="navbar">
            <div class="nav-brand">
                <h2>🏢 Sistema de Activos</h2>
            </div>
            
            <div class="nav-menu" id="navMenu">
                ${rutas.map(ruta => crearItemNavbar(ruta)).join('')}
            </div>
            
            <div class="nav-user">
                <div class="user-info">
                    <span class="user-name">${username}</span>
                    <span class="user-role">${role}</span>
                </div>
                <button id="btnLogout" class="btn-logout">
                    <span class="logout-icon">🚪</span>
                    Salir
                </button>
            </div>
            
            <button class="nav-toggle" id="navToggle">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    configurarNavbar();
}

// Función para crear items del navbar (simples o desplegables)
function crearItemNavbar(ruta) {
    if (ruta.tipo === "dropdown") {
        return `
            <div class="nav-dropdown">
                <button class="nav-link dropdown-toggle">
                    <span class="nav-icon">${ruta.icon}</span>
                    ${ruta.nombre}
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="dropdown-menu">
                    ${ruta.submenu.map(subitem => `
                        <a href="${subitem.url}" class="dropdown-link">
                            <span class="dropdown-icon">${subitem.icon}</span>
                            ${subitem.nombre}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        return `
            <a href="${ruta.url}" class="nav-link">
                <span class="nav-icon">${ruta.icon}</span>
                ${ruta.nombre}
            </a>
        `;
    }
}

// Función para configurar eventos del navbar
function configurarNavbar() {
    // Toggle menu móvil
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav-menu-active');
            navToggle.classList.toggle('nav-toggle-active');
        });
    }

    // Configurar menús desplegables
    configurarDropdowns();

    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                logout();
            }
        });
    }

    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            cerrarTodosLosDropdowns();
        }
    });

    // Resaltar enlace activo
    resaltarEnlaceActivo();
}

// Función para configurar menús desplegables
function configurarDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        // Hover para desktop
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                cerrarTodosLosDropdowns();
                menu.classList.add('dropdown-active');
                toggle.classList.add('dropdown-active');
            }
        });
        
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                setTimeout(() => {
                    if (!dropdown.matches(':hover')) {
                        menu.classList.remove('dropdown-active');
                        toggle.classList.remove('dropdown-active');
                    }
                }, 100);
            }
        });
        
        // Click para móvil
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const isActive = menu.classList.contains('dropdown-active');
                cerrarTodosLosDropdowns();
                if (!isActive) {
                    menu.classList.add('dropdown-active');
                    toggle.classList.add('dropdown-active');
                }
            }
        });
    });
}

// Función para cerrar todos los menús desplegables
function cerrarTodosLosDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu, .dropdown-toggle');
    dropdowns.forEach(element => {
        element.classList.remove('dropdown-active');
    });
}

// Función para resaltar el enlace activo (mejorada para dropdowns)
function resaltarEnlaceActivo() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('nav-link-active');
            
            // Si es un dropdown link, resaltar también el padre
            const dropdownItem = link.closest('.nav-dropdown');
            if (dropdownItem) {
                const dropdownToggle = dropdownItem.querySelector('.dropdown-toggle');
                dropdownToggle.classList.add('nav-link-active');
            }
        }
    });
}

// Resto de las funciones permanecen igual...
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("loginTime");
    window.location.href = "/html/index.html";
}

function verificarAutenticacion() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!window.location.pathname.includes("index.html") && !token) {
        window.location.href = "/html/index.html";
        return false;
    }
    
    if (window.location.pathname.includes("index.html") && token) {
        window.location.href = "/html/dashboard.html";
        return false;
    }
    
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    if (verificarAutenticacion()) {
        crearNavbar();
    }
});