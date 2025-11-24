// En routeSolicitudGasto.js - agregar estas rutas adicionales:

// OBTENER TODAS LAS SOLICITUDES DE GASTO
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

// AUTORIZAR SOLICITUD DE GASTO
router.put("/solicitudGasto/:id/autorizar", authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const solicitud = await registroSolicitudGasto.findOne({ id: id });

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: "Solicitud de gasto no encontrada"
            });
        }

        solicitud.estatusCompras = "Autorizada";
        solicitud.fechaAutorizacion = new Date();
        solicitud.autorizadoPor = {
            userId: req.user.id,
            role: req.user.role,
            username: req.user.username
        };

        await solicitud.save();

        res.json({
            success: true,
            message: "Solicitud de gasto autorizada correctamente"
        });

    } catch (error) {
        console.error("Error al autorizar solicitud de gasto:", error);
        res.status(500).json({
            success: false,
            message: "Error al autorizar la solicitud de gasto"
        });
    }
});

// ELIMINAR SOLICITUD DE GASTO
router.delete("/solicitudGasto/:id", authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const resultado = await registroSolicitudGasto.findOneAndDelete({ id: id });

        if (!resultado) {
            return res.status(404).json({
                success: false,
                message: "Solicitud de gasto no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Solicitud de gasto eliminada correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar solicitud de gasto:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar la solicitud de gasto"
        });
    }
});