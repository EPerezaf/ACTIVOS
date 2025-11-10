//FUNCION PARA CERRAR SESION
function logout(){
    //ELIMINAR DATOS DEL LOCALSTORAGE
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    //REDIRIGIR AL LOGIN
    window.location.href = "/html/index.html";
}

//FUNCION PARA VERIFICAR AUTENTICACION Y MOSTRAR INOFMRACION DEL USUARIO
function checkAuth(){
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userInfo = document.getElementById("userInfo");

    if(!token && window.location.pathname !== "/html/index.html"){
        //SI NO HAY TOKEN Y NO ESTA EN LA PAGINA DE LOGIN, REDIRIGIR
        window.location.href = "/html/index.html";
        return false;
    }

    //MOSTRAR INFORMACION DEL USUARIO SI ESTA DISPONIBLE
    if(userInfo && role){
        userInfo.textContent = `Rol: ${role}`;
    }

    return true;
}

//CONFIGURAR EL BOTON DE LOGOUT
document.addEventListener("DOMContentLoaded", function(){
    const btnLogout = document.getElementById("btnLogout");

    if(btnLogout){
        btnLogout.addEventListener("click", function(){
            if(confirm("¿Estas seguro que deseas cerrar sesion")){
                logout();
            }
        });
    }

    //VERIFICAR AUTENTICACION EN CADA CARGA DE PAGINA (EXPETO LOGIN)
    if(window.location.pathname.includes("index.html")){
        checkAuth();
    }
});

//TAMBIEN PUEDES AGREGAR VERIFICACION DE INACTIVIDAD
let inactivityTime = function(){
    let time;

    function resetTimer(){
        clearTimeout(time);
        //CERRAR SESION DESPUES DE 30 MINUTOS DE INACTIVIDAD
        time= setTimeout(logout, 30 * 60 * 1000);
    }

    window.onload = resetTimer;
    window.onmousemove= resetTimer;
    window.ontouchstart = resetTimer;
    window.onclick = resetTimer;
    window.onkeypress = resetTimer;
};

inactivityTime();