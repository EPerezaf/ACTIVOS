const formulario = document.getElementById('formulario');
if (formulario) {
    formulario.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(formulario);
        const data = {
            estatus: formData.get('estatus'),
            concepto: formData.get('concepto')
        };

        const response = await fetch('/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
        formulario.reset();
    })
}


//AGREGAR CONCEPTOFAMILIA 
const familiaConcepto = document.getElementById('familiaConcepto');
if (familiaConcepto) {
    familiaConcepto.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(familiaConcepto);
        const data = {
            estatus: formData.get('estatus'),
            descripcion: formData.get('descripcion')
        };

        const response = await fetch('/guardarConceptoFamilia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
    })
}

//AGREGAR CONCEPTO SUB FAMILIA
const subfamilia = document.getElementById('ConSubFamilia');
if(subfamilia){
    subfamilia.addEventListener('submit', async e =>{
        e.preventDefault();
        const formData = new FormData(subfamilia);
        const data = {
            estatus: formData('estatus'),
            concepto: formData.get('concepto')
        };

        const response = await fetch('/guardarSubFamilia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.message);
    })
}


window.addEventListener('DOMContentLoaded', async () => {
    const select = document.getElementById('selectEstatus');

    try {
        const response = await fetch('/estatus');
        const estatusList = await response.json();

        estatusList.forEach(item => {
            const option = document.createElement('option');
            option.value = item.nombre;
            option.textContent = item.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error(' Error cargando estatus');
    }
});