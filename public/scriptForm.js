//REGISTRO DE FAMILIA ACTIVOS
const formFamilia = document.getElementById('formFamilia');
if (formFamilia) {
    formFamilia.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(formFamilia);
        const data = {
            estatus: formData.get('estatus'),
            concepto: formData.get('concepto')
        };
        const response = await fetch('/familiaActivos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
        formData.reset();
    })
}

//REGISTRO SUBFAMILIAACTIVOS 
const conceptoSubFamilia = document.getElementById('conceptoSubFamilia');
const btnGuardar = document.getElementById('btnGuardar');

//CARGA LAS FAMILIA DE ACTIVOS EN EL SELECT
async function cargarSelectFamilia() {
    const response = await fetch('/traerFamilia');
    const familias = await response.json();

    const lista = document.getElementById('listaSubFamilia');
    lista.innerHTML = '<option value="">Seleccione un usuario</option>';

    familias.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = u.concepto;
        lista.appendChild(option);
    });
}
document.addEventListener('DOMContentLoaded', cargarSelectFamilia);

const formSubFamilia = document.getElementById("formSubFamilia");
if (formSubFamilia) {
    formSubFamilia.addEventListener('submit', async e => {
        e.preventDefault();

        const conceptoFamilia = document.getElementById('listaSubFamilia').value;
        const estatus = document.getElementById('estatus').value;
        const conceptoSubFamilia = document.getElementById('conceptoSubFamilia').value;

        if(!conceptoFamilia){
            alert("Debes seleccionar una Familia de Activos");
            return;
        }

        const res = await fetch('/subFamilia', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conceptoFamilia, estatus, conceptoSubFamilia })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formSubFamilia.reset();
    })
}


