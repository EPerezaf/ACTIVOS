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

const formSubFamilia = document.getElementById("formSubFamilia");
if (formSubFamilia) {
    formSubFamilia.addEventListener('submit', async e => {
        e.preventDefault();

        const conceptoFamilia = document.getElementById('listaFamilia').value;
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

//REGISTRO CONCEPTOACTIVOS
const conceptoActivos = document.getElementById('conceptoActivos');

//CARGA LAS FAMILIAS DE ACTIVOS EN EL SELECT
async function cargarSelectSubFamilia() {
    const response = await fetch('/traerSubFamilia');
    const subFamilia = await response.json();

    const lista = document.getElementById('listaSubFamilia');
    lista.innerHTML = '<option value="">Seleecione una Sub Familia</option>';

    subFamilia.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = u.conceptoSubFamilia;
        lista.appendChild(option);
    });
}
document.addEventListener('DOMContentLoaded', cargarSelectSubFamilia);

const formConceptoActivos = document.getElementById('formConceptoActivos');
if(formConceptoActivos){
    formConceptoActivos.addEventListener('submit', async e =>{
        e.preventDefault();

        const conceptoFamilia = document.getElementById("listaFamilia").value;
        const conceptoSubFamilia = document.getElementById("listaSubFamilia").value;
        const estatus = document.getElementById("estatusConceptoActivos").value;
        const conceptoActivos = document.getElementById("conceptoActivos").value;

        if(!conceptoFamilia){
            alert("Debes seleccionar una familia de activos");
            return;
        }

        if(!conceptoSubFamilia){
            alert("DEbes seleccionar una Sub Familia");
            return;
        }

        const res = await fetch('/conceptoActivos', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conceptoFamilia, conceptoSubFamilia, estatus, conceptoActivos })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formConceptoActivos.reset();
    })
}

//REGISTRO DE CONCEPTO GASTO 
const formConceptoGasto = document.getElementById('formConceptogasto');
if(formConceptoGasto){
    formConceptoGasto.addEventListener('submit', async e =>{
        e.preventDefault();

        const estatusGasto = document.getElementById('estatusGasto').value;
        const conceptoGasto = document.getElementById('conceptoGasto').value;

        if(!estatusGasto){
            alert("Debes seleccionar un estatus");
            return;
        }
        if(!conceptoGasto){
            alert("Debes escribir un concepto");
            return;
        }

        const res = await fetch('/conceptoGasto', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatusGasto, conceptoGasto})
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formConceptoGasto.reset();
    })
}