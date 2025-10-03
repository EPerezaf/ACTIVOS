//REGISTRO CONCEPTOACTIVOS

const conceptoActivos = document.getElementById('conceptoActivos');

//SELECT CON LA SELECCION DE SELECT FAMILIA 
document.addEventListener("DOMContentLoaded", () => {
    const selectFamilia = document.getElementById("listaFamilia");
    const selectSubFamilia = document.getElementById("listaSubFamilia");


    //CARGAR FAMILIAS AL INICIAR 
    async function cargarFamilias() {
        try{
            const res = await fetch("/api/routeSubFamilia/traerFamilia");
            const familias = await res.json();

            selectFamilia.innerHTML = `<option value ="" disabled selectd>Seleccione una familia</option>`;
            familias.forEach(f => {
                selectFamilia.innerHTML += `<option value="${f.concepto}">${f.concepto}</option>`;
            });
        }catch(error){
            console.error("Error cargando familia:", error);
            selectFamilia.innerHTML = `<option value="">Error al cargar familias</option>`;
        }
    }
    //CAMBIAR SUBFAMILIAS CUANDO CAMBIE FAMILIAS
    selectFamilia.addEventListener("change", async () =>{
        const familiaSeleccionada = selectFamilia.value;
        console.log("Familia seleccionada:", familiaSeleccionada);

        if(!familiaSeleccionada){
            selectSubFamilia.innerHTML = "<option value='' disabled selected>Selecciona una subfamilia</option>";
            return;
        }

        try{
            const res = await fetch(`/api/routeConceptoActivos/buscarSubFamilia?buscar=${encodeURIComponent(familiaSeleccionada)}`);
            const subfamilias = await res.json();

            selectSubFamilia.innerHTML = `<option value="" disabled selected>Selecciona una subfamilia </option>`;
            subfamilias.forEach(sf =>{
                selectSubFamilia.innerHTML += `<option value="${sf.conceptoSubFamilia}"> ${sf.conceptoSubFamilia}</option>`;
            });
        }catch(error){
            console.error("Error cargando subfamilias:", error);
            selectSubFamilia.innerHTML = `<option value=""> Error al cargar sub familias</option>`;
        }
    });

    cargarFamilias();
})

const formConceptoActivos = document.getElementById('formConceptoActivos');
if (formConceptoActivos) {
    formConceptoActivos.addEventListener('submit', async e => {
        e.preventDefault();

        const conceptoFamilia = document.getElementById("listaFamilia").value;
        const conceptoSubFamilia = document.getElementById("listaSubFamilia").value;
        const estatus = document.getElementById("estatusConceptoActivos").value;
        const conceptoActivos = document.getElementById("conceptoActivos").value;
        const listaMedida = document.getElementById("listaMedida").value;

        if (!conceptoFamilia) {
            alert("Debes seleccionar una familia de activos");
            return;
        }

        if (!conceptoSubFamilia) {
            alert("DEbes seleccionar una Sub Familia");
            return;
        }

        if(!listaMedida){
            alert("DEBES SELECCIONAR UNA MEDIDA");
            return;
        }

        const res = await fetch('/api/routeConceptoActivos/conceptoActivos', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({estatus, conceptoFamilia, conceptoSubFamilia, listaMedida, conceptoActivos})
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formConceptoActivos.reset();
    })
}