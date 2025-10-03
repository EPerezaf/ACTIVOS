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
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;

        if (!estatusPersonal) {
            alert("Debes seleccionar un estatus");
            return;
        }
        if (!nombre && !aPaterno && !aMaterno && !fechaNacimiento) {
            alert("Debes rellenar el campo")
            return;
        }

        const res = await fetch('/api/routePersonal/personal', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatusPersonal, nombre, aPaterno, aMaterno, fechaNacimiento })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formPersonal.reset();
    })
}

