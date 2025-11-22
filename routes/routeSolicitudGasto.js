const express = require("express");
const router = express.Router();
const registroSolicitudGasto = require("../models/modelSolicitudGasto");
const { getNextSequence } = require("../middleware/counter");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/solicitudGasto", authMiddleware, async (req, res) => {
    console.log("=== PETICION POST RECIBIDA ===");
    try {
        const datos = req.body;
        console.log("Headers:", req.headers);
        console.log("Body recibido:", JSON.stringify(datos, null, 2));

        // VERIFICACIONES DETALLADAS
        if (!datos.activos) {
            console.log("ERROR: No hay propiedad 'activos' en los datos");
            return res.status(400).json({
                message: "ERROR: No se encontró la propiedad 'activos' en los datos",
                success: false,
            });
        }

        if (!Array.isArray(datos.activos)) {
            console.log("ERROR: 'activos' no es un array");
            return res.status(400).json({
                message: "ERROR: La propiedad 'activos' debe ser un array",
                success: false,
            });
        }

        if (datos.activos.length === 0) {
            console.log("ERROR: Array 'activos' está vacío");
            return res.status(400).json({
                message: "ERROR: Debe seleccionar al menos un activo",
                success: false,
            });
        }

        console.log(`Activos recibidos: ${datos.activos.length}`);

        // VERIFICAR ESTRUCTURA DE CADA ACTIVO
        datos.activos.forEach((activo, index) => {
            console.log(`Activo ${index}:`, {
                tieneIdActivo: !!activo.idActivo,
                tieneConceptoActivo: !!activo.conceptoActivo,
                tieneConceptoGasto: !!activo.conceptoGasto,
                proveedoresCount: activo.proveedores ? activo.proveedores.length : 0
            });
        });

        // VERIFICAR QUE CADA ACTIVO TENGA CONCEPTO DE GASTO
        for (let i = 0; i < datos.activos.length; i++) {
            const activo = datos.activos[i];
            if (!activo.conceptoGasto || activo.conceptoGasto.trim() === "") {
                console.log(`ERROR: Activo ${i} no tiene conceptoGasto`);
                return res.status(400).json({
                    message: `ERROR: El activo ${i + 1} no tiene concepto de gasto asignado`,
                    success: false,
                });
            }
        }

        // VERIFICAR PROVEEDORES
        const tieneProveedores = datos.activos.some(activo => 
            activo.proveedores && Array.isArray(activo.proveedores) && activo.proveedores.length > 0
        );
        
        if (!tieneProveedores) {
            console.log("ERROR: Ningún activo tiene proveedores");
            return res.status(400).json({
                message: "ERROR: Debe seleccionar al menos un proveedor",
                success: false,
            });
        }

        console.log("✓ Todas las validaciones pasaron");

        // ... resto del código para guardar
        const id = await getNextSequence('solicitudGastoId');
        
        let montoTotal = 0;
        datos.activos.forEach(activo => {
            if (activo.proveedores && Array.isArray(activo.proveedores)) {
                activo.proveedores.forEach(proveedor => {
                    montoTotal += parseFloat(proveedor.monto) || 0;
                });
            }
        });

        const solicitudCompleta = {
            id: id,
            clasificacionGasto: datos.clasificacionGasto,
            descripcionGasto: datos.descripcionGasto,
            tipoGasto: datos.tipoGasto,
            lectura: datos.lectura,
            montoTotal: montoTotal,
            activos: datos.activos,
            fechaCreacion: new Date(),
            modificadoPor: {
                userId: req.user?.id || "sistema",
                role: req.user?.role || "sistema", 
                username: req.user?.username || "Sistema"
            }
        };

        console.log("Documento a guardar:", solicitudCompleta);

        const nuevaSolicitud = new registroSolicitudGasto(solicitudCompleta);
        const resultado = await nuevaSolicitud.save();

        console.log("✓ Solicitud guardada correctamente");
        res.status(201).json({
            message: "Solicitud de gasto creada correctamente",
            success: true,
            id: resultado.id,
            data: resultado
        });

    } catch (error) {
        console.error("❌ ERROR EN EL SERVIDOR:", error);
        res.status(500).json({
            message: "Error al crear la solicitud de gasto",
            error: error.message,
            success: false
        });
    }
});

router.get("/solicitudesGasto", authMiddleware, async (req, res) => {
    try {
        const solicitudes = await registroSolicitudGasto.find().sort({ fechaCreacion: -1 });
        
        res.json({
            success: true,
            data: solicitudes,
            total: solicitudes.length
        });
        
    } catch (error) {
        console.error("Error al obtener solicitudes de gasto:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las solicitudes de gasto"
        });
    }
});

router.get("/solicitudGasto/:id", authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const solicitud = await registroSolicitudGasto.findOne({ id: id });

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: "Solicitud de gasto no encontrada"
            });
        }

        res.json({
            success: true,
            data: solicitud
        });

    } catch (error) {
        console.error("Error al obtener solicitud de gasto:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener la solicitud de gasto"
        });
    }
});

module.exports = router;