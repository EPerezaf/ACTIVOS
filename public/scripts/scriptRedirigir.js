async function cargarBotones() {
    const btnAltaFamilia = document.getElementById("altaFamilia");

    const useRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if(!token){
        window.location.href = "/html/index.html";
        return;
    }

    if(useRole === "Gerente General"){
        btnAltaFamilia.style.display = "none";
    }
    
}

document.addEventListener("DOMContentLoaded", cargarBotones);