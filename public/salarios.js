const inputBuscar = document.getElementById("buscarPersonal");
const resultadosDiv = document.getElementById("resultadosBusqueda");
const contenedor = document.getElementById("contenedorPersonal");
const btnGuardar = document.getElementById("guardarBtn");

let timeout = null;

//BUSCARDOR EN TIEMPO REAL
inputBuscar.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const texto = inputBuscar.value.trim();
        if (!texto) {
            resultadosDiv.innerHTML = "";
            return;
        }

        const res = await fetch(`/usuarios?buscar=${encodeURIComponent(texto)}`);
        const usuarios = await res.json();

        if (usuarios.length == 0) {
            resultadosDiv.innerHTML = "<p>No se encontraron resultados<p>";
            return;
        }

        resultadosDiv.innerHTML = usuarios.map(u =>
            `<div>
            <button onclick='seleccionarUsuario(${JSON.stringify(u)})'>
            ${u.nombre} ${u.aPaterno} ${u.aMaterno}
            </button>
            </div>`
        ).join("");
    }, 400);
});

//SELECCIONAR USUARIO Y AGREGARLO A INPUTS
function seleccionarUsuario(usuario) {
    const fila = document.createElement("div");
    fila.classList.add("fila");

    fila.innerHTML = `
        <input type="text" value="${usuario.nombre}" readonly>
        <input type="text" value="${usuario.aPaterno}" readonly>
        <input type="text" value="${usuario.aMaterno}" readonly>
        <input type="number" placeholder="Salario" class="salario">
        <button class="btn-remove">X</button>
        `;

    //BOTON PARA ELIMINAR
    fila.querySelector(".btn-remove").addEventListener("click", () => fila.remove());
    contenedor.appendChild(fila);
    resultadosDiv.innerHTML = ""; //limpiar resultados
    inputBuscar.value = "";
}

//GUARDAR TODOS
btnGuardar.addEventListener("click", async () => {
    const filas = contenedor.querySelectorAll(".fila");
    const data = [];

    filas.forEach(fila => {
        const inputs = fila.querySelectorAll("input");
        if (inputs.length >= 4) {
            data.push({
                nombre: inputs[0].value,
                aPaterno: inputs[1].value,
                aMaterno: inputs[2].value,
                comentario: inputs[3].value
            });
        }

    });

    console.log("DATA a enviar, ", data);
    
    const res = await fetch("/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message || " guardado correctamente");
});
