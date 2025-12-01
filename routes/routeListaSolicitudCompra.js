
//=================================================================================================================
//=================================================================================================================
//======================LISTA DE SOLICITUDES DE COMPRA===============================================================
//=================================================================================================================
//CARGAR LAS SOLICITUDES DE COMPRAS
const express = require('express');
const router = express.Router();
const registroSolicitudCompra = require('../models/modelSolicitudCompra');
const registroActivo = require('../models/modelRegistroActivo');
const { getNextSequence }  = require('../middleware/counter');

//VALIDACION DE ROLES CON INICIO DE SESION
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

//CARGAR LAS SOLICITUDES DE COMPRAS (ACCESIBLE PARA TODOS LOS ROLES AUTENTICADOS)
router.get('/solicitudes', authMiddleware, async (req, res) => {
    try {
        const solicitudes = await registroSolicitudCompra.find();

        const resultado = solicitudes.map(u => ({
            id: u.id,
            estatusCompras: u.estatusCompras,
            fechaCreacion: u.fechaCreacion,
            clasificacionCompras: u.clasificacionCompras,
            descripcionConceptoCompra: u.descripcionConceptoCompra,
            personal: u.personal.map(p => ({
                nombre: p.nombre,
                aPaterno: p.aPaterno,
                aMaterno: p.aMaterno,
            })),
            conceptoActivo: u.conceptoActivo.map(f => ({
                sc_cca_familia: f.sc_cca_familia,
                sc_cca_subFamilia: f.sc_cca_subFamilia,
                sc_cca_descripcion: f.sc_cca_descripcion
            })),
            proveedores: u.proveedores.map(j => ({
                razonSocial: j.razonSocial,
                nickname: j.nickname,
                sc_monto: j.sc_monto
            }))
        }));

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener solicitudes" });
    }
});

//ENDPOINT PARA AUTORIZAR SOLICITUD (SOLO GERENTE GENERAL Y ADMINISTRADOR)
router.put('/solicitudCompra/:id/autorizar', authMiddleware, roleMiddleware(["Gerente General", "Administrador"]), async (req, res) => {
    try{
        const id = Number(req.params.id);

        console.log("AUTORIZANDO SOLICITUD:", id);
        console.log("Usuario que autoriza:", req.user);

        //BUSCAR Y ACTUALIAZR LA SOLICITUD 
        const solicitud = await registroSolicitudCompra.findOne({id: id});
        if(!solicitud){
            return res.status(404).json({ success: false, message: "Solicitud no encontrada"});
        }

        if(solicitud.estatusCompras === 'Autorizada'){
            return res.status(400).json({ success: false, message: "La solciitud ya esta autorizada"});
        }

        //ACTUALIZAR ESTATUS E INFORMACION DE AUTORIZACION 
        solicitud.estatusCompras = "Autorizada";
        solicitud.fechaAutorizacion = new Date();
        solicitud.autorizadoPor = {
            userId: req.user.id,
            role: req.user.role,
            username: req.user.username || "Sistema"
        };

        const resultado = await solicitud.save();
        console.log("Solicitud autorizada:", resultado);

        res.json({
            success: true,
            message: `Solicitud #${id} autorizada correctamente`,
            solicitud: resultado
        });
    }catch(error){
        console.error("Error en PUT /solicitudCompra/:id/autorizar", error);
        res.status(500).json({ success: false, message: "Error al autorizar la solicitud"});
    }
});


//ENDPOINT PARA PODER ELIMINAR SOLICITUD DE COMPRA (SOLO GERENTE GENERAL Y ADMINISTRADOR)
router.delete('/solicitudCompra/:id', authMiddleware, roleMiddleware(["Jefe de Activos", "Administrador"]),async (req, res) => {
    try{
        const id = Number(req.params.id);
        const result = await registroSolicitudCompra.deleteOne({ id });
        if(result.deletedCount == 0){
            return res.status(400).json({ success: false, message: "solicitud no encontrada"});
        }
        res.json({ message: true, message: `Solicitud #${id} eliminada correctamente`});
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: "Error al encontrar la solicitud"});
    }
});

//ENDPOINT PARA PODER CANCELAR LA SOLICITUD DE COMPRA
router.put('/solicitudCompra/:id/cancelar', async (req,res) =>{
    try{
        const id = parseInt(req.params.id);
        const result = await registroSolicitudCompra.findOne({ id:id });
        if(!result){
            return res.status(404).json({ success: false, message: "Solicitud no encontrada"});
        }

        //ACTUALIZAR ESTATUS
        result.estatusCompras = "Cancelada";

        const resultado = await result.save();
        console.log("Solicitud Cancelada:", resultado);

        res.json({
            success: true,
            message: `Solicitud #${id} cancelada correctamente`,
            solicitud: resultado
        });
    }catch(error){
        console.error("Erro al cancelar solicitud: ", error);
        res.status(500).json({ success: false, message: "Error al cancelar solicitud"});
    }
})

//END POINT PARA EDITAR LA SOLICITUD DE COMPRA
// Obtener UNA solicitud por id
router.get('/solicitudes/:id', authMiddleware,async (req, res) => {
    try {
        const id = parseInt(req.params.id); // porque tu campo "id" en el schema es Number
        const solicitud = await registroSolicitudCompra.findOne({ id: id });

        if (!solicitud) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        // Incluir la información completa de los proveedores seleccionados
        const solicitudConProveedores = {
            ...solicitud.toObject(),
            conceptoActivo: solicitud.conceptoActivo.map(activo => ({
                ...activo,
                proveedorSeleccionado: activo.proveedorSeleccionado || null
            }))
        };

        res.json(solicitud);
    } catch (error) {
        console.error("Error en GET /solicitudes/:id", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//ENDPOINT PARA EDITAR UNA SOLICITUD DE COMPRA
router.put('/solicitudCompra/:id', authMiddleware,roleMiddleware(["Jefe de Activos", "Administrador"]), async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("EDITANDO SOLICITUD:", id);
        //console.log("Datos recibidos para actualizar:", datos);

        //VERIFICAR QUE EXISTA LA SOLICITUD
        const solicitud = await registroSolicitudCompra.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({ success: false, message:"Solicitud de compra no encontrada"});
        }

        //ACTUALIZAR CAMPOS
        solicitud.clasificacionCompras = datos.clasificacionCompras || solicitud.clasificacionCompras;
        solicitud.descripcionConceptoCompra = datos.descripcionConceptoCompra || solicitud.descripcionConceptoCompra;
        solicitud.personal = datos.personal || solicitud.personal;
        
        const nuevoConcepto = datos.conceptoActivo;
        console.log("Concepto recibido para actualizar: ", nuevoConcepto);
        solicitud.conceptoActivo = nuevoConcepto;
        console.log("concepto para guardar:", solicitud.conceptoActivo);
        solicitud.conceptoActivo = datos.conceptoActivo;
        //solicitud.proveedores = datos.proveedores || solicitud.proveedores;

       const nuevosProveedores = datos.proveedores;
        solicitud.proveedores = nuevosProveedores;
        console.log("Proveedores para guardar: ", solicitud.proveedores);
        console.log("Concepto activos para guardar: ",solicitud.conceptoActivo);
        const resultado = await solicitud.save();
        console.log("lo que se guarda alfinal: ",resultado);

        res.json({
            success: true,
            message: `Solciitud id:${id} actualizada correctamente`,
            solicitud: resultado
        });
    }catch(error){
        console.error("Error en el PUT /solicitudCompra/:id", error);
        res.status(500).json({ success: false, message:"Error al actualizar la solicitud"});
    }
});

router.put("/solicitudCompra/:id/proceso", authMiddleware,roleMiddleware(["Jefe de Activos", "Administrador"]), async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;
        console.log("Mandando a proceso solicitud id: ", id);

        const solicitud = await registroSolicitudCompra.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({ success: false, message: "Solicitud no encontrada"});
        }
        solicitud.estatusCompras = "Proceso";
        const resultado = await solicitud.save();
        console.log("Como se mando a gaurdar: ", resultado);

        res.json({
            success: true,
            message: `Solicitud id:${id} actualizada correctamente`,
            solicitud: resultado
        });
    }catch(error){
        console.error("Error en el PUT /solicitudCompra/:id/proceso", error);
        res.status(500).json({ success: false, message: "Error al actualizar solicitud"});
    }
})


router.post("/registroActivo", authMiddleware,roleMiddleware(["Jefe de Activos", "Administrador"]), async (req,res) => {
    try{
        const conceptosArray = req.body;
        console.log("Datos recibidos: ",conceptosArray);

        //VERIFICAR QUE ES UN ARRAY Y TIENE ELEMENTOS   
        if(!Array.isArray(conceptosArray) || conceptosArray.length === 0){
            return res.status(400).json({
                message: "Se esperaba un array de activos",
                success: false
            });
        }

        const resultados = [];
        const errores = [];

        // ✅ CORREGIDO: Manejar ambos nombres del campo
        const primerConcepto = conceptosArray[0];
        const idSolicitud = primerConcepto.solicitudCompraId || primerConcepto.solcitudCompraId;
        
        console.log("ID de solicitud encontrado:", idSolicitud);
        if(!idSolicitud){
            return res.status(400).json({
                message: "No se encontro el ID de la solicitud",
                success: false,
                camposDisponibles: Object.keys(primerConcepto)
            });
        }

        //VERIFICAR SI YA EXISTEN ACTIVOS REGISTRADOS PARA ESTA SOLICITUD
        const activosExistentes = await registroActivo.find({ idSolicitud: parseInt(idSolicitud)});
        if(activosExistentes.length > 0){
            return res.status(400).json({
                message: "Esta solicitud ya tiene activos registrados. No se pueden registrar mas activos",
                success: false,
                activosExistentes: activosExistentes.length
            });
        }

        for(const [index, concepto] of conceptosArray.entries()){
            try{
                console.log(`Procesando concepto ${index + 1}:`, concepto);
                const id = await getNextSequence('registroActivoId');
                console.log("ID unico generado: ",id);

                const registroActivoData = {
                    id: id,
                    familia: concepto.familia,
                    subFamilia: concepto.subFamilia,
                    conceptoActivo: concepto.conceptoActivo,
                    nomenclatura: concepto.nomenclatura,
                    marca: concepto.marca,
                    modelo: concepto.modelo,
                    descripcionAdicional: concepto.descripcionAdicional,
                    costo: parseFloat(concepto.costo) || 0,
                    numSerie: concepto.numSerie,
                    idSolicitud: parseInt(idSolicitud),
                    responsable: concepto.responsable || ""
                };
                console.log(`Activo ${index + 1} a guardar:`, registroActivoData);

                 // Validar campos obligatorios
                if (!registroActivoData.numSerie) {
                    throw new Error(`Concepto ${index + 1}: Número de serie es requerido`);
                }

                if (!registroActivoData.nomenclatura) {
                    throw new Error(`Concepto ${index + 1}: Nomenclatura es requerida`);
                }

                //GUARDAR CADA ACTIVO INDIVIDUALMENTE
                const nuevoRegistro = new registroActivo(registroActivoData);
                const resultado = await nuevoRegistro.save();
               
                resultados.push({
                    concepto: index + 1,
                    id: resultado.id,
                    numSerie: resultado.numSerie,
                    nomenclatura: resultado.nomenclatura,
                    success: true
                });

                console.log(`Concepto ${index + 1} guardado correctamente`);
                
            }catch(error){
                console.error(`Error en concepto ${index + 1}:`, error.message);
                errores.push({
                    concepto: index + 1,
                    error: error.message,
                    success: false
                });
            }
        }

        //ACTUALIZAR EL ESTATUS DE LA SOLICITUD A "ACTIVOS REGISTRADOS"
        if(resultados.length > 0){
            try{
                const SolicitudCompra = require("../models/modelSolicitudCompra");
                
                await SolicitudCompra.findOneAndUpdate(
                    { id: parseInt(idSolicitud)},
                    {
                        //estatusCompras: 'Activos Registrados',
                        fechaRegistroActivos: new Date()
                    }
                );
                console.log(`Fecha de registro de activos actualizada para solicitud ${idSolicitud}`);
            }catch(error){
                console.error("Error al actualizar estatus de la solicitud: ", error);
            }
        }

        // Preparar respuesta
        const response = {
            message: `Procesamiento completado: ${resultados.length} exitosos, ${errores.length} con errores`,
            success: true,
            resultados: resultados,
            errores: errores,
            resumen: {
                totalConceptos: conceptosArray.length,
                guardados: resultados.length,
                conError: errores.length
            }
        };

        console.log("RESUMEN DEL PROCESO:", response.resumen);
        res.json(response);
    }catch(error){
        console.error("ERROR EN EL SERVIDOR: ", error);
        res.status(500).json({
            message: "ERROR AL GUARDAR",
            error: error.message,
            success: false
        });
    }
});

router.get("/solicitud/:idSolicitud/tieneActivos", authMiddleware, async ( req,res) => {
    try{
        const { idSolicitud } = req.params;

        const activosCount = await registroActivo.countDocuments({
            idSolicitud: parseInt(idSolicitud)
        });

        res.json({
            success: true,
            tieneActivos: activosCount > 0,
            cantidadActivos: activosCount
        });

    }catch(error){
        console.error("Error al verificar activos: ", error);
        res.status(500).json({
            success: false,
            message: "Error al verificar activos registrados"
        });
    }
});

// OBTENER CLASIFICACIONES ÚNICAS PARA FILTRO
router.get("/clasificacionesUnicas", authMiddleware, async (req, res) => {
    try {
        const solicitudes = await registroSolicitudCompra.find();
        const clasificacionesUnicas = [...new Set(solicitudes.map(s => s.clasificacionCompras))].filter(Boolean);
        
        res.json(clasificacionesUnicas);
    } catch (error) {
        console.error("Error al obtener clasificaciones únicas:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener clasificaciones únicas" 
        });
    }
});

// OBTENER PROVEEDORES ÚNICOS PARA FILTRO
router.get("/proveedoresUnicos", authMiddleware, async (req, res) => {
    try {
        const solicitudes = await registroSolicitudCompra.find();
        const todosLosProveedores = solicitudes.flatMap(s => 
            s.proveedores.map(p => p.razonSocial || p.nickname)
        ).filter(Boolean);
        const proveedoresUnicos = [...new Set(todosLosProveedores)];
        
        res.json(proveedoresUnicos);
    } catch (error) {
        console.error("Error al obtener proveedores únicos:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener proveedores únicos" 
        });
    }
});

// ENDPOINT PARA SELECCIONAR PROVEEDOR
// ENDPOINT CORREGIDO PARA SELECCIONAR PROVEEDOR
// ENDPOINT CORREGIDO PARA SELECCIONAR PROVEEDOR
// ENDPOINT MEJORADO PARA SELECCIONAR PROVEEDOR
router.put('/solicitudCompra/:id/seleccionarProveedor', authMiddleware, roleMiddleware(["Gerente General", "Administrador"]), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { indexActivo, indexProveedor } = req.body;

        console.log('Seleccionando proveedor:', { id, indexActivo, indexProveedor });

        const solicitud = await registroSolicitudCompra.findOne({ id: id });
        if (!solicitud) {
            return res.status(404).json({ success: false, message: "Solicitud no encontrada" });
        }

        // Verificar que el índice del activo existe
        if (!solicitud.conceptoActivo[indexActivo]) {
            return res.status(400).json({ success: false, message: "Activo no encontrado" });
        }

        // Verificar que el índice del proveedor existe
        if (!solicitud.proveedores[indexProveedor]) {
            return res.status(400).json({ 
                success: false, 
                message: "Proveedor no encontrado",
                indexProveedor: indexProveedor,
                totalProveedores: solicitud.proveedores.length
            });
        }

        const proveedor = solicitud.proveedores[indexProveedor];

        // IMPORTANTE: Limpiar cualquier proveedor seleccionado anteriormente para este activo
        solicitud.conceptoActivo[indexActivo].proveedorSeleccionado = undefined;

        // Asignar el NUEVO proveedor seleccionado al activo
        solicitud.conceptoActivo[indexActivo].proveedorSeleccionado = {
            razonSocial: proveedor.razonSocial,
            nickname: proveedor.nickname,
            sc_monto: proveedor.sc_monto,
            indexProveedor: indexProveedor
        };

        await solicitud.save();

        res.json({
            success: true,
            message: "Proveedor seleccionado correctamente",
            activo: solicitud.conceptoActivo[indexActivo]
        });

    } catch (error) {
        console.error("Error en PUT /seleccionarProveedor:", error);
        res.status(500).json({ success: false, message: "Error al seleccionar proveedor" });
    }
});

// ENDPOINT PARA DESELECCIONAR PROVEEDOR
router.put('/solicitudCompra/:id/deseleccionarProveedor', authMiddleware, roleMiddleware(["Gerente General", "Administrador"]), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { indexActivo } = req.body;

        const solicitud = await registroSolicitudCompra.findOne({ id: id });
        if (!solicitud) {
            return res.status(404).json({ success: false, message: "Solicitud no encontrada" });
        }

        // Verificar que el índice del activo existe
        if (!solicitud.conceptoActivo[indexActivo]) {
            return res.status(400).json({ success: false, message: "Activo no encontrado" });
        }

        // Remover el proveedor seleccionado
        solicitud.conceptoActivo[indexActivo].proveedorSeleccionado = undefined;

        await solicitud.save();

        res.json({
            success: true,
            message: "Proveedor deseleccionado correctamente",
            activo: solicitud.conceptoActivo[indexActivo]
        });

    } catch (error) {
        console.error("Error en PUT /deseleccionarProveedor:", error);
        res.status(500).json({ success: false, message: "Error al deseleccionar proveedor" });
    }
});
module.exports = router;