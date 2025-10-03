
//=================================================================================================================
//==========================CONCEPTO COMPRA================================================================
//=================================================================================================================
const formConceptoCompras = document.getElementById("concepCompras");
if(formConceptoCompras){
    formConceptoCompras.addEventListener("submit", async e =>{
        e.preventDefault();
        
        const estatusConceptoCompra = document.getElementById("estatusConceptoCompra").value;
        const conceptoCompra = document.getElementById("conceptoCompra").value;

        if(!estatusConceptoCompra){
            alert("DEBES SELECCIONAR UN ESTATUS PARA EL CONCEPTO");
            return;
        }

        const res = await fetch('/api/routeConceptoCompra/conceptoCompra', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatusConceptoCompra, conceptoCompra})
        });
        
        const result = await res.json();
        alert(result.message || "GUARDADO COEECTAMENTE");
        formConceptoCompras.reset();
    });
}
