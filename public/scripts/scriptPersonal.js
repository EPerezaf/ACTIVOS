//==========================================================================
//====================REGISTRO DE PERSONAL==================================
//================personal.html==============================================
const formPersonal = document.getElementById('formPersonal');
if (formPersonal) {
    formPersonal.addEventListener('submit', async e => {
        e.preventDefault();

        const estatusPersonal = document.getElementById('estatusPersonal').value;
        const nombre = document.getElementById('nombre').value;
        const aPaterno = document.getElementById('aPaterno').value;
        const aMaterno = document.getElementById('aMaterno').value;
        const p_curp = document.getElementById('p_curp').value;
        const p_ciudad = document.getElementById('p_ciudad').value;
        const p_estado = document.getElementById('p_estado').value;
        const p_edad = document.getElementById('p_edad').value;

        if (!estatusPersonal) {
            alert("Debes seleccionar un estatus");
            return;
        }
        if (!nombre && !aPaterno && !aMaterno && !p_curp && !p_ciudad && !p_estado && !p_edad) {
            alert("Debes rellenar el campo")
            return;
        }

        const res = await fetch('/api/routePersonal/personal', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatusPersonal, nombre, aPaterno, aMaterno, p_curp, p_ciudad, p_estado, p_edad })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formPersonal.reset();
    })
}

