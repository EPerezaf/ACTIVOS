const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// AL CARGAR EL DOM
document.addEventListener("DOMContentLoaded", () => {
    const selectFamilia = document.getElementById("listaFamilia");
    const selectSubFamilia = document.getElementById("listaSubFamilia");
    const conceptoActivos = document.getElementById("conceptoActivos");

    // ---- 1. CARGAR FAMILIAS ----
    async function cargarFamilias() {
        try {
            const res = await fetch("/api/routeSubFamilia/traerFamilia");
            const familias = await res.json();

            selectFamilia.innerHTML = `<option value="" disabled selected>Seleccione una familia</option>`;
            familias.forEach(f => {
                selectFamilia.innerHTML += `<option value="${f.concepto}">${f.concepto}</option>`;
            });
        } catch (error) {
            console.error("Error cargando familia:", error);
            selectFamilia.innerHTML = `<option value="">Error al cargar familias</option>`;
        }
    }

    // ---- 2. CARGAR SUBFAMILIAS SEGÚN LA FAMILIA ----
    async function cargarSubFamilias(familiaSeleccionada) {
        if (!familiaSeleccionada) {
            selectSubFamilia.innerHTML = "<option value='' disabled selected>Selecciona una subfamilia</option>";
            return;
        }

        try {
            const res = await fetch(`/api/routeConceptoActivos/buscarSubFamilia?buscar=${encodeURIComponent(familiaSeleccionada)}`);
            const subfamilias = await res.json();

            selectSubFamilia.innerHTML = `<option value="" disabled selected>Selecciona una subfamilia</option>`;
            subfamilias.forEach(sf => {
                selectSubFamilia.innerHTML += `<option value="${sf.conceptoSubFamilia}">${sf.conceptoSubFamilia}</option>`;
            });
        } catch (error) {
            console.error("Error cargando subfamilias:", error);
            selectSubFamilia.innerHTML = `<option value="">Error al cargar subfamilias</option>`;
        }
    }

    // ---- 3. EVENTO: cuando cambia la familia ----
    selectFamilia.addEventListener("change", async () => {
        const familiaSeleccionada = selectFamilia.value;
        await cargarSubFamilias(familiaSeleccionada);
    });

    // ---- 4. FUNCIÓN PRINCIPAL ----
    async function inicializarFormulario() {
        await cargarFamilias();

        // Si no hay ID, solo cargamos las familias (modo alta)
        if (!id) return;

        try {
            const res = await fetch(`/api/routeListaActivos/listaActivos/${id}`);
            const activos = await res.json();

            if (!activos) {
                alert("Concepto de activos no encontrado");
                return;
            }

            document.title = "Editar Concepto Activo";

            // Rellenar campos
            document.getElementById("estatusConceptoActivos").value = activos.estatus;
            selectFamilia.value = activos.conceptoFamilia;

            // Esperamos a que carguen las subfamilias de la familia seleccionada
            await cargarSubFamilias(activos.conceptoFamilia);

            // Seleccionamos la subfamilia del registro
            selectSubFamilia.value = activos.conceptoSubFamilia;

            conceptoActivos.value = activos.conceptoActivos;

            // Cambiar texto del botón
            document.getElementById("btnGuardar").textContent = "Actualizar Concepto Activo";
        } catch (error) {
            console.error("Hubo un error al cargar el concepto:", error);
            alert("Error al cargar el concepto");
        }
    }

    inicializarFormulario();
});

// ---- 5. GUARDAR / ACTUALIZAR ----
const formConceptoActivos = document.getElementById("formConceptoActivos");
if (formConceptoActivos) {
    formConceptoActivos.addEventListener("submit", async e => {
        e.preventDefault();

        const conceptoFamilia = document.getElementById("listaFamilia").value;
        const conceptoSubFamilia = document.getElementById("listaSubFamilia").value;
        const estatus = document.getElementById("estatusConceptoActivos").value;
        const conceptoActivos = document.getElementById("conceptoActivos").value;

        if (!conceptoFamilia || !conceptoSubFamilia) {
            alert("Debes seleccionar una familia y una subfamilia");
            return;
        }

        const method = id ? 'PUT' : 'POST';
        const url = id 
            ? `/api/routeListaActivos/listaActivos/${id}`
            : '/api/routeConceptoActivos/conceptoActivos';

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estatus, conceptoFamilia, conceptoSubFamilia, conceptoActivos })
        });

        const result = await res.json();
        alert(result.message || "Guardado correctamente");
        formConceptoActivos.reset();
        if(result.success){
            window.location.href = "/html/listaConceptoActivo.html";
        }
    });
}
