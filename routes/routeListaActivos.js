const express = require('express');
const router = express.Router();
const registroActivos = require('../models/modelConceptoActivos');
const { getNextSequence } = require ('../middleware/counter');

//TRAER TODOS LOS CONCEPTOS DE ACTIVOS
router.get('/traerActivos', async ( req,res) => {
    try{
        const activos = await registroActivos.find();
        const resultado = activos.map(u => ({
            id: u.id,
            estatus: u.estatus,
            conceptoFamilia: u.conceptoFamilia,
            conceptoSubFamilia: u.conceptoSubFamilia,
            conceptoActivos: u.conceptoActivos
        }));
        res.json(resultado);
    }catch(e){
        console.error("Hubo un error al traer los conceptos: ", e);
        res.status(500).join({
            message: "Error al obtener Concepto Activos"
        });
    }
});

router.get("/listaActivos/:id", async (req,res) => {
    try{
        const id= parseInt(req.params.id);
        const solicitud= await registroActivos.findOne({id:id});
        if(!solicitud){
            return res.status(404).json({
                message: "Solicitud no encontrada"
            });
        }
        res.json(solicitud);
    }catch(e){
        console.error("Error en el GET /listaActivos/:id", error);
        res.status(500).json({
            message: "Error en el servidor"
        });
    }
});

router.put('/listaActivos/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("Editando concepto Activo con ID: ", id, "Datos: ", datos);

        //VERIFICACION QUE EXISTA LA SOLICITUD 
        const activos = await registroActivos.findOne({id: id});
        if(!activos){
            return res.status(404).json({
                success: false,
                message: "concepto no encontrado"
            });
        }

        //ACTUALIZAR LOS CAMPOS SOLO SI EXISTEN EN EL BODY 
        if(datos.estatus !== undefined) activos.estatus = datos.estatus;
        if(datos.conceptoFamilia !== undefined) activos.conceptoFamilia = datos.conceptoFamilia;
        if(datos.conceptoSubFamilia !== undefined) activos.conceptoSubFamilia = datos.conceptoSubFamilia;
        if(datos.conceptoActivos !== undefined) activos.conceptoActivos = datos.conceptoActivos;

        await activos.save();

        console.log("Concepto Activo actualizado correctamente");
        res.json({
            success: true,
            message: `ACtivo id: ${id} actualizada correctamente`
        });
    }catch(e){
        console.error("Error en el PUT /listaActivos/:id", e);
        res.status(500).json({
            success: false,
            message: "Error al actualizar"
        });
    }
});

router.put('/listaActivosEliminacion/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("HAciendo eliminacion");

        const solicitud = await registroActivos.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({
                success: false,
                message: "Activo no encontrado"
            });
        }

        //ACTUALIZAR LOS CAMPOS 
        solicitud.estatus = "Cancelado";
        solicitud.conceptoFamilia = datos.conceptoFamilia || solicitud.conceptoFamilia;
        solicitud.conceptoSubFamilia = datos.conceptoSubFamilia || solicitud.conceptoSubFamilia;
        solicitud.conceptoActivos = datos.conceptoActivos || solicitud.conceptoActivos;

        await solicitud.save();
        console.log("Concepto Activo Eliminado");
        res.json({
            success: true,
            message: `Activo id: ${id}, Eliminado correctamente`
        });
    }catch(e){
        console.error("Error en el DELETE /listaActivos/:id", e);
        res.status(500).json({
            success: false,
            message: "Error al eliminar"
        });
    }
});

// OBTENER FAMILIAS ÚNICAS PARA FILTRO
router.get("/familiasUnicas", async (req, res) => {
    try {
        const activos = await registroActivos.find();
        const familiasUnicas = [...new Set(activos.map(a => a.conceptoFamilia))].filter(Boolean);
        
        res.json(familiasUnicas);
    } catch (error) {
        console.error("Error al obtener familias únicas:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener familias únicas" 
        });
    }
});

// OBTENER SUBFAMILIAS ÚNICAS PARA FILTRO
router.get("/subfamiliasUnicas", async (req, res) => {
    try {
        const activos = await registroActivos.find();
        const subFamiliasUnicas = [...new Set(activos.map(a => a.conceptoSubFamilia))].filter(Boolean);
        
        res.json(subFamiliasUnicas);
    } catch (error) {
        console.error("Error al obtener subfamilias únicas:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener subfamilias únicas" 
        });
    }
});

module.exports = router;