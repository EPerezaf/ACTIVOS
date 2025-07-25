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
const Consubfamilia = document.getElementById('ConSubFamilia');
if(Consubfamilia){
    Consubfamilia.addEventListener('submit', async e =>{
        e.preventDefault();
        const formData = new FormData(Consubfamilia);
        const data = {
            estatus: formData.get('estatus'),
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
