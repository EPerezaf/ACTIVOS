//REGISTRO DE CONCEPTO GASTO 
const formConceptoGasto = document.getElementById('formConceptoGasto');
if (formConceptoGasto) {
    formConceptoGasto.addEventListener('submit', async e => {
        e.preventDefault();

        const estatusGasto = document.getElementById('estatusGasto').value;
        const conceptoGasto = document.getElementById('conceptoGasto').value;
        console.log("Escribiendo:", conceptoGasto);
        if (!estatusGasto) {
            alert("Debes seleccionar un estatus");
            return;
        }
        if (!conceptoGasto) {
            alert("Debes escribir un concepto");
            return;
        }

        const res = await fetch('/api/routeConceptoGasto/conceptoGasto', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatusGasto, conceptoGasto })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formConceptoGasto.reset();
    })
}