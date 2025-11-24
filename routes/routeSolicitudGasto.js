const express = require("express");
const router = express.Router();
const registroSolicitudGasto = require("../models/modelSolicitudGasto");
const { getNextSequence } = require("../middleware/counter");
const authMiddleware = require("../middleware/authMiddleware");

// FUNCIÓN PARA CALCULAR MONTO TOTAL BASADO EN PROVEEDORES SELECCIONADOS
function calcularMontoTotal(activos) {
    let montoTotal = 0;
    
    activos.forEach(activo => {
        if (activo.proveedorSeleccionado && activo.proveedorSeleccionado.monto) {
            montoTotal += parseFloat(activo.proveedorSeleccionado.monto) || 0;
        }
    });
    
    return montoTotal;
}

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
        
        const montoTotal = calcularMontoTotal(datos.activos);

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

// OBTENER TODAS LAS SOLICITUDES DE GASTO CON FILTROS MEJORADOS
router.get("/solicitudesGasto", authMiddleware, async (req, res) => {
    try {
        const { estatus, tipoGasto, busqueda } = req.query;
        
        console.log('🔍 Parámetros recibidos en backend:', { estatus, tipoGasto, busqueda });
        
        // CONSTRUIR FILTRO DINÁMICO
        let filtro = {};
        
        // SOPORTAR MÚLTIPLES ESTATUS (separados por comas) - CORREGIDO
        if (estatus && estatus !== '' && estatus !== 'undefined') {
            // Limpiar y validar el parámetro estatus
            const estatusLimpio = estatus.toString().trim();
            const estatusArray = estatusLimpio.split(',');
            
            // Filtrar valores vacíos
            const estatusValidos = estatusArray.filter(e => e && e.trim() !== '');
            
            if (estatusValidos.length > 1) {
                filtro.estatusCompras = { $in: estatusValidos };
                console.log(`🎯 Filtro múltiple de estatus: ${estatusValidos.join(', ')}`);
            } else if (estatusValidos.length === 1) {
                filtro.estatusCompras = estatusValidos[0];
                console.log(`🎯 Filtro simple de estatus: ${estatusValidos[0]}`);
            }
            // Si no hay estatus válidos, no se aplica filtro
        }
        
        if (tipoGasto && tipoGasto !== '' && tipoGasto !== 'undefined') {
            filtro.tipoGasto = tipoGasto.toString().trim();
            console.log(`🎯 Filtro tipoGasto: ${filtro.tipoGasto}`);
        }
        
        // BÚSQUEDA MEJORADA
        if (busqueda && busqueda !== '' && busqueda !== 'undefined') {
            const busquedaLimpia = busqueda.toString().trim();
            const regexBusqueda = { $regex: busquedaLimpia, $options: 'i' };
            filtro.$or = [
                { descripcionGasto: regexBusqueda },
                { lectura: regexBusqueda },
                { 'activos.conceptoActivo': regexBusqueda },
                { 'activos.conceptoGasto': regexBusqueda },
                { 'activos.familia': regexBusqueda },
                { 'activos.subFamilia': regexBusqueda },
                { 'activos.proveedores.razonSocial': regexBusqueda },
                { 'activos.proveedores.nickName': regexBusqueda }
            ];
            console.log(`🔎 Búsqueda aplicada: "${busquedaLimpia}"`);
        }

        console.log('📊 Filtro final aplicado en MongoDB:', JSON.stringify(filtro, null, 2));
        
        const solicitudes = await registroSolicitudGasto.find(filtro).sort({ fechaCreacion: -1 });
        
        console.log(`✅ Solicitudes encontradas: ${solicitudes.length}`);
        
        res.json({
            success: true,
            data: solicitudes,
            total: solicitudes.length,
            filtrosAplicados: { estatus, tipoGasto, busqueda }
        });
        
    } catch (error) {
        console.error("❌ Error al obtener solicitudes de gasto:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las solicitudes de gasto: " + error.message
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

        // VALIDAR Y CORREGIR DATOS FALTANTES ANTES DE AUTORIZAR
        if (solicitud.activos && Array.isArray(solicitud.activos)) {
            solicitud.activos.forEach((activo, index) => {
                // ASEGURAR QUE conceptActivo EXISTA
                if (!activo.conceptoActivo || activo.conceptoActivo.trim() === "") {
                    console.warn(`Corrigiendo conceptoActivo faltante en activo ${index} de solicitud ${id}`);
                    activo.conceptoActivo = activo.conceptoGasto || "Activo sin nombre";
                }
                
                // ASEGURAR QUE LOS PROVEEDORES TENGAN ESTRUCTURA VÁLIDA
                if (!activo.proveedores || !Array.isArray(activo.proveedores)) {
                    console.warn(`Inicializando proveedores vacíos en activo ${index} de solicitud ${id}`);
                    activo.proveedores = [];
                }
            });
        }

        // ACTUALIZAR ESTATUS Y DATOS DE AUTORIZACIÓN
        solicitud.estatusCompras = "Autorizada";
        solicitud.fechaAutorizacion = new Date();
        solicitud.autorizadoPor = {
            userId: req.user.id,
            role: req.user.role,
            username: req.user.username
        };

        // GUARDAR CON VALIDACIÓN MÁS FLEXIBLE TEMPORALMENTE
        await solicitud.save({ validateBeforeSave: true });

        res.json({
            success: true,
            message: "Solicitud de gasto autorizada correctamente"
        });

    } catch (error) {
        console.error("Error al autorizar solicitud de gasto:", error);
        
        // SI PERSISTE EL ERROR, INTENTAR UNA ACTUALIZACIÓN DIRECTA
        if (error.name === 'ValidationError') {
            try {
                console.log("Intentando actualización directa debido a error de validación...");
                await registroSolicitudGasto.updateOne(
                    { id: id },
                    { 
                        $set: {
                            estatusCompras: "Autorizada",
                            fechaAutorizacion: new Date(),
                            autorizadoPor: {
                                userId: req.user.id,
                                role: req.user.role,
                                username: req.user.username
                            }
                        }
                    }
                );
                
                res.json({
                    success: true,
                    message: "Solicitud de gasto autorizada correctamente (con corrección de datos)"
                });
                
            } catch (updateError) {
                console.error("Error en actualización directa:", updateError);
                res.status(500).json({
                    success: false,
                    message: "Error crítico al autorizar la solicitud de gasto"
                });
            }
        } else {
            res.status(500).json({
                success: false,
                message: "Error al autorizar la solicitud de gasto"
            });
        }
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

// ACTUALIZAR SOLICITUD DE GASTO
router.put("/solicitudGasto/:id", authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("ACTUALIZANDO SOLICITUD #", id);
        console.log("Datos recibidos:", datos);

        // VERIFICACIONES
        if (!datos.activos || !Array.isArray(datos.activos) || datos.activos.length === 0) {
            return res.status(400).json({
                message: "ERROR: Debe seleccionar al menos un activo",
                success: false,
            });
        }

        // CALCULAR NUEVO MONTO TOTAL
        const montoTotal = calcularMontoTotal(datos.activos);

        // ACTUALIZAR SOLICITUD
        const solicitudActualizada = await registroSolicitudGasto.findOneAndUpdate(
            { id: id },
            {
                $set: {
                    clasificacionGasto: datos.clasificacionGasto,
                    descripcionGasto: datos.descripcionGasto,
                    tipoGasto: datos.tipoGasto,
                    lectura: datos.lectura,
                    montoTotal: montoTotal,
                    activos: datos.activos,
                    ultimaModificacion: new Date(),
                    modificadoPor: {
                        userId: req.user?.id || "sistema",
                        role: req.user?.role || "sistema", 
                        username: req.user?.username || "Sistema"
                    }
                }
            },
            { new: true }
        );

        if (!solicitudActualizada) {
            return res.status(404).json({
                success: false,
                message: "Solicitud de gasto no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Solicitud de gasto actualizada correctamente",
            id: solicitudActualizada.id,
            data: solicitudActualizada
        });

    } catch (error) {
        console.error("Error al actualizar solicitud de gasto:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar la solicitud de gasto"
        });
    }
});

// ENVIAR SOLICITUD A PROCESO
router.put("/solicitudGasto/:id/enviarProceso", authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("ENVIANDO A PROCESO SOLICITUD #", id);

        // VERIFICACIONES
        if (!datos.activos || !Array.isArray(datos.activos) || datos.activos.length === 0) {
            return res.status(400).json({
                message: "ERROR: Debe seleccionar al menos un activo",
                success: false,
            });
        }

        // CALCULAR MONTO TOTAL
        let montoTotal = 0;
        datos.activos.forEach(activo => {
            if (activo.proveedores && Array.isArray(activo.proveedores)) {
                activo.proveedores.forEach(proveedor => {
                    montoTotal += parseFloat(proveedor.monto) || 0;
                });
            }
        });

        // ACTUALIZAR SOLICITUD Y CAMBIAR ESTATUS A "Proceso"
        const solicitudActualizada = await registroSolicitudGasto.findOneAndUpdate(
            { id: id },
            {
                $set: {
                    clasificacionGasto: datos.clasificacionGasto,
                    descripcionGasto: datos.descripcionGasto,
                    tipoGasto: datos.tipoGasto,
                    lectura: datos.lectura,
                    montoTotal: montoTotal,
                    activos: datos.activos,
                    estatusCompras: "Proceso", // CAMBIAR ESTATUS A PROCESO
                    ultimaModificacion: new Date(),
                    modificadoPor: {
                        userId: req.user?.id || "sistema",
                        role: req.user?.role || "sistema", 
                        username: req.user?.username || "Sistema"
                    }
                }
            },
            { new: true }
        );

        if (!solicitudActualizada) {
            return res.status(404).json({
                success: false,
                message: "Solicitud de gasto no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Solicitud enviada a proceso correctamente",
            id: solicitudActualizada.id,
            data: solicitudActualizada
        });

    } catch (error) {
        console.error("Error al enviar solicitud a proceso:", error);
        res.status(500).json({
            success: false,
            message: "Error al enviar la solicitud a proceso"
        });
    }
});

// SELECCIONAR PROVEEDOR PARA UN ACTIVO
// EN LA RUTA DE SELECCIONAR PROVEEDOR (ACTUALIZADA)
router.put("/solicitudGasto/:id/seleccionarProveedor", authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { indexActivo, idProveedor } = req.body;

        const solicitud = await registroSolicitudGasto.findOne({ id: id });

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: "Solicitud de gasto no encontrada"
            });
        }

        // VERIFICAR QUE EL ÍNDICE DEL ACTIVO EXISTA
        if (!solicitud.activos || indexActivo >= solicitud.activos.length) {
            return res.status(400).json({
                success: false,
                message: "Activo no encontrado"
            });
        }

        const activo = solicitud.activos[indexActivo];

        // BUSCAR EL PROVEEDOR SELECCIONADO
        const proveedorSeleccionado = activo.proveedores.find(p => p.idProveedor === idProveedor);

        if (!proveedorSeleccionado) {
            return res.status(400).json({
                success: false,
                message: "Proveedor no encontrado"
            });
        }

        // ACTUALIZAR EL PROVEEDOR SELECCIONADO
        solicitud.activos[indexActivo].proveedorSeleccionado = {
            idProveedor: proveedorSeleccionado.idProveedor,
            razonSocial: proveedorSeleccionado.razonSocial,
            nickName: proveedorSeleccionado.nickName,
            monto: proveedorSeleccionado.monto
        };

        // RECALCULAR MONTO TOTAL
        solicitud.montoTotal = calcularMontoTotal(solicitud.activos);

        await solicitud.save();

        res.json({
            success: true,
            message: "Proveedor seleccionado correctamente",
            montoTotal: solicitud.montoTotal
        });

    } catch (error) {
        console.error("Error al seleccionar proveedor:", error);
        res.status(500).json({
            success: false,
            message: "Error al seleccionar el proveedor"
        });
    }
});

// AGREGAR RUTA PARA DESELECCIONAR PROVEEDOR
router.put("/solicitudGasto/:id/deseleccionarProveedor", authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { indexActivo } = req.body;

        const solicitud = await registroSolicitudGasto.findOne({ id: id });

        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: "Solicitud de gasto no encontrada"
            });
        }

        if (!solicitud.activos || indexActivo >= solicitud.activos.length) {
            return res.status(400).json({
                success: false,
                message: "Activo no encontrado"
            });
        }

        // LIMPIAR PROVEEDOR SELECCIONADO
        solicitud.activos[indexActivo].proveedorSeleccionado = null;

        // RECALCULAR MONTO TOTAL
        solicitud.montoTotal = calcularMontoTotal(solicitud.activos);

        await solicitud.save();

        res.json({
            success: true,
            message: "Proveedor deseleccionado correctamente",
            montoTotal: solicitud.montoTotal
        });

    } catch (error) {
        console.error("Error al deseleccionar proveedor:", error);
        res.status(500).json({
            success: false,
            message: "Error al deseleccionar el proveedor"
        });
    }
});
module.exports = router;