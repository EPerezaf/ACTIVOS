const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/routeAuth/login", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password})
    });

    const data = await res.json();
    msg.textContent = data.message;

    if(res.ok){
        //GUARDAMOS EL TOKEN
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username);//GUARDAR NOMBRE DE USUARIO
        localStorage.setItem("loginTime", new Date().toISOString());

        msg.style.color = "green";
        console.log("Rol recibido", data.role);

        window.location.href = "/html/dashboard.html";
        /*
        if(data.role === "Administrador"){
            window.location.href = "/html/redirigir.html";    
        }else if(data.role === "Gerente General"){
            window.location.href = "/html/listaSolicitudCompras.html";
        }else if (data.role === "Jefe de Activos"){
            window.location.href = "/html/redirigir.html";
        }*/
        
    }else{
        msg.style.color = "red";
    }
});