const express = require('express');
const router = express.Router();
const registroConceptoGasto = require('../models/modelConceptoGasto');
const { getNextSequence } = require('../middleware/counter');

router.get('/listaConcepto', async(req,res) => {
    try{
        const concepto = await registroConceptoGasto.find();
        const resultado = concepto.map(u => ({
            id: u.id,
            estatus: u.estatus,
            conceptoGasto: u.conceptoGasto
        }));
        res.json(resultado);
    }catch(error){
        console.error("Hubo un error: ", error);
        res.status(500).join({ message: "Error al obtener conceptos"});
    }
});

router.get('/listaConcepto/estatus/:estatus', async(req,res) =>{
    try{
        const { estatus } = req.params;

        const estatusPermitidos = ['Alta', 'Baja', 'Cancelado'];
        if(!estatusPermitidos.includes(estatus)){
            return res.status(400).json({
                success: false,
                message: "Estatus no válido. Use: Alta, Baja o Cancelado"
            });
        }
        const concepto = await registroConceptoGasto.find({ estatus: estatus}).sort({ id: 1});
        const resultado = concepto.map(u => ({ // Cambiado de "familias" a "concepto"
            id: u.id,
            estatus: u.estatus,
            conceptoGasto: u.conceptoGasto
        }));
        res.json(resultado);
    }catch(error){
        console.error("Hubo un problema al obtener conceptos por estatus: ", error);
        res.status(500).json({
            success:false,
            message: "Error al obtener conceptos filtrados"
        });
    }
});
router.get('/listaConcepto/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const solicitud = await registroConceptoGasto.findOne({ id: id});

        if(!solicitud){
            return res.status(404).json({ message: "Solicitud no encontrada "});
        }
        res.json(solicitud);
    }catch(error){
        console.error("Error en el GET /listaConcepto/:id ", error);
        res.status(500).json({
            message: "Error en el servidor"
        });
    }
});

router.put('/listaConcepto/:id/actualizar', async (req,res) =>{
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;
        console.log("Editando concepto de Gasto ID: ", id, "Datos: ", datos);

        const concepto = await registroConceptoGasto.findOne({ id: id});
        if(!concepto){
            return res.status(404).json({ success: false, message:"Concepto no encontrado"});
        }
        if(datos.estatus !== undefined) concepto.estatus = datos.estatus;
        if(datos.conceptoGasto !== undefined) concepto.conceptoGasto = datos.conceptoGasto;
        await concepto.save();

        console.log("Concepto actualizada correctamente");
        res.json({
            success: true,
            message: `Solicitud id:${id} actualizada correctamente`
        });
    }catch(error){
        console.error("Error en el PUT /listaConcepto/:id ", error);
        res.status(500).json({ 
            success: false,
            message: "Error al actualizar el concepto"
        });
    }
});

router.put('/listaConcepto/:id/cancelar', async(req,res) => {
    try{
        const id = parseInt(req.params.id);
        const solicitud = await registroConceptoGasto.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({
                success: false,
                message: "Concepto no encontrado"
            });
        }
        solicitud.estatus = "Cancelado"; // Cambiado de "Cancelada" a "Cancelado"
        await solicitud.save();
        res.json({
            success: true,
            message: `Concepto id:${id}, Cancelado correctamente`
        });
    }catch(error){
        console.error("Hubo un problema al intentar cancelar el concepto /listaConcepto/:id/cancelar", error);
        res.status(500).json({
            message: "Error al cancelar",
            success: false
        });
    }
});

module.exports = router;
