const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// AL CARGAR EL DOM
document.addEventListener("DOMContentLoaded", () => {
    //AUTENTICACION DE ROL DE USUARIO
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token || !role){
        window.location.href = "/html/index.html";
        return;
    }

    //VERIFICACION QUE EL ROL TENGA ACCESO A ESTA PAGINA
    const rolesPermitidos = ["Administrador", "Jefe de Activos"];
    if(!rolesPermitidos.includes(role)){
        alert("No tienes acceso para acceder a esta pagina");
        window.location.href = "/html/index.html";
        return;
    }

    const selectFamilia = document.getElementById("listaFamilia");
    const selectSubFamilia = document.getElementById("listaSubFamilia");
    const conceptoActivos = document.getElementById("conceptoActivos");

    // ---- 1. CARGAR FAMILIAS (SOLO LAS ACTIVAS) ----
    async function cargarFamilias() {
        try {
            const res = await fetch("/api/routeSubFamilia/traerFamilia");
            const familias = await res.json();

            // FILTRAR SOLO FAMILIAS CON ESTATUS "alta"
            const familiasActivas = familias.filter(f => 
                f.estatus && f.estatus.toLowerCase() === 'alta'
            );

            selectFamilia.innerHTML = `<option value="" disabled selected>Seleccione una familia</option>`;
            
            if (familiasActivas.length === 0) {
                selectFamilia.innerHTML += `<option value="" disabled>No hay familias activas disponibles</option>`;
                selectFamilia.disabled = true;
                selectSubFamilia.disabled = true;
                document.getElementById('conceptoActivos').disabled = true;
                document.getElementById('btnGuardar').disabled = true;
                alert("No hay familias activas disponibles. Debes crear una familia primero.");
                return;
            }

            familiasActivas.forEach(f => {
                selectFamilia.innerHTML += `<option value="${f.concepto}">${f.concepto}</option>`;
            });

            console.log(`Familias activas cargadas: ${familiasActivas.length}`);
        } catch (error) {
            console.error("Error cargando familia:", error);
            selectFamilia.innerHTML = `<option value="" disabled>Error al cargar familias</option>`;
        }
    }

    // ---- 2. CARGAR SUBFAMILIAS ESPECÍFICAS DE LA FAMILIA SELECCIONADA (SOLO LAS ACTIVAS) ----
    async function cargarSubFamilias(familiaSeleccionada) {
        if (!familiaSeleccionada) {
            selectSubFamilia.innerHTML = "<option value='' disabled selected>Seleccione una familia primero</option>";
            selectSubFamilia.disabled = true;
            return;
        }

        try {
            // Buscar subfamilias que pertenezcan específicamente a la familia seleccionada y estén activas
            const res = await fetch(`/api/routeConceptoActivos/buscarSubFamiliaPorFamilia?familia=${encodeURIComponent(familiaSeleccionada)}`);
            const subfamilias = await res.json();

            selectSubFamilia.innerHTML = `<option value="" disabled selected>Seleccione una subfamilia</option>`;
            selectSubFamilia.disabled = false;

            if (subfamilias.length === 0) {
                selectSubFamilia.innerHTML += `<option value="" disabled>No hay subfamilias activas para esta familia</option>`;
                selectSubFamilia.disabled = true;
                alert(`No hay subfamilias activas para la familia "${familiaSeleccionada}"`);
                return;
            }

            subfamilias.forEach(sf => {
                selectSubFamilia.innerHTML += `<option value="${sf.conceptoSubFamilia}">${sf.conceptoSubFamilia}</option>`;
            });

            console.log(`Subfamilias activas cargadas: ${subfamilias.length} para familia "${familiaSeleccionada}"`);
        } catch (error) {
            console.error("Error cargando subfamilias:", error);
            selectSubFamilia.innerHTML = `<option value="" disabled>Error al cargar subfamilias</option>`;
            selectSubFamilia.disabled = true;
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
            
            // Para edición, permitimos seleccionar incluso si la familia/subfamilia no está activa
            let familiaEncontrada = false;
            for (const option of selectFamilia.options) {
                if (option.value === activos.conceptoFamilia) {
                    option.selected = true;
                    familiaEncontrada = true;
                    break;
                }
            }

            // Si la familia no está activa, la añadimos temporalmente
            if (!familiaEncontrada && activos.conceptoFamilia) {
                const option = document.createElement('option');
                option.value = activos.conceptoFamilia;
                option.textContent = `${activos.conceptoFamilia} (No activa)`;
                option.selected = true;
                selectFamilia.appendChild(option);
            }

            // Cargar subfamilias para la familia seleccionada
            await cargarSubFamilias(activos.conceptoFamilia);

            // Para subfamilia en edición, permitimos seleccionar incluso si no está activa
            let subfamiliaEncontrada = false;
            for (const option of selectSubFamilia.options) {
                if (option.value === activos.conceptoSubFamilia) {
                    option.selected = true;
                    subfamiliaEncontrada = true;
                    break;
                }
            }

            // Si la subfamilia no está activa, la añadimos temporalmente
            if (!subfamiliaEncontrada && activos.conceptoSubFamilia) {
                const option = document.createElement('option');
                option.value = activos.conceptoSubFamilia;
                option.textContent = `${activos.conceptoSubFamilia} (No activa)`;
                option.selected = true;
                selectSubFamilia.appendChild(option);
                selectSubFamilia.disabled = false;
            }

            conceptoActivos.value = activos.conceptoActivos || '';

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

        // Validar que no se estén seleccionando opciones marcadas como "no activas"
        if (conceptoFamilia.includes('(No activa)')) {
            alert("No puedes usar una familia que no está activa. Por favor selecciona una familia activa.");
            return;
        }

        if (conceptoSubFamilia.includes('(No activa)')) {
            alert("No puedes usar una subfamilia que no está activa. Por favor selecciona una subfamilia activa.");
            return;
        }

        if (!conceptoFamilia || !conceptoSubFamilia) {
            alert("Debes seleccionar una familia y una subfamilia");
            return;
        }

        if (!conceptoActivos.trim()) {
            alert("Debes escribir un concepto de activo");
            return;
        }

        const method = id ? 'PUT' : 'POST';
        const url = id 
            ? `/api/routeListaActivos/listaActivos/${id}`
            : '/api/routeConceptoActivos/conceptoActivos';

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    estatus, 
                    conceptoFamilia, 
                    conceptoSubFamilia, 
                    conceptoActivos: conceptoActivos.trim() 
                })
            });

            const result = await res.json();
            
            if (result.success || res.ok) {
                alert(id ? "Concepto actualizado correctamente" : "Concepto guardado correctamente");
                window.location.href = "/html/listaConceptoActivo.html";
            } else {
                alert(result.message || "Error al guardar");
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar el concepto");
        }
    });
}