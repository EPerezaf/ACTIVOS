document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");

    if(!role){
        window.location.href = "/html/index.html";
        return;
    }

    //OCULTAR/MOSTRAR SEGUN EL ROL 
    if(role === "Gerente General"){
        document.querySelectorAll(".btn-editar").forEach(btn => btn.style.display = "none");
        document.querySelectorAll(".btn-autorizar").forEach(btn => btn.style.display = "inline-block");
    }

    if(role === "Jefe de Activos"){
        document.querySelectorAll(".btn-autorizar").forEach(btn => btn.style.display = "none");
    }

    if(role === "Administrador"){
        //TIENE ACCESO A TODO
    }
});