//REGISTRO DE FAMILIA ACTIVOS
//conceptoFamiliaActivos.html
const formFamilia = document.getElementById('formFamilia');
if (formFamilia) {
    formFamilia.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(formFamilia);
        const data = {
            estatus: formData.get('estatus'),
            concepto: formData.get('concepto')
        };
        const response = await fetch('/api/familia/familiaActivos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert(result.message);
        formData.reset();
    })
}