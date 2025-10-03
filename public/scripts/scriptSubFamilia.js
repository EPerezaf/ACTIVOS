//REGISTRO SUBFAMILIAACTIVOS 
const conceptoSubFamilia = document.getElementById('conceptoSubFamilia');
//const btnGuardar = document.getElementById('btnGuardar');

//CARGA LAS FAMILIA DE ACTIVOS EN EL SELECT
async function cargarSelectFamilia() {
    const response = await fetch('/api/routeSubFamilia/traerFamilia');
    const familias = await response.json();

    const lista = document.getElementById('listaFamilia');
    lista.innerHTML = '<option value="">Seleccione una Familia de Activos</option>';

    familias.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = u.concepto;
        lista.appendChild(option);
    });
}
document.addEventListener('DOMContentLoaded', cargarSelectFamilia);

//FORMULARIO PARA GUARDAR SUB FAMILIA 
//conceptoSubFamilia.html
const formSubFamilia = document.getElementById("formSubFamilia");
if (formSubFamilia) {
    formSubFamilia.addEventListener('submit', async e => {
        e.preventDefault();

        const conceptoFamilia = document.getElementById('listaFamilia').value;
        const estatus = document.getElementById('estatus').value;
        const conceptoSubFamilia = document.getElementById('conceptoSubFamilia').value;

        if (!conceptoFamilia) {
            alert("Debes seleccionar una Familia de Activos");
            return;
        }

        const res = await fetch('/api/routeSubFamilia/subFamilia', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conceptoFamilia, estatus, conceptoSubFamilia })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formSubFamilia.reset();
    })
}