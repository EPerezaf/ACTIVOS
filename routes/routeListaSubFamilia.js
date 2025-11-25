const express = require('express');
const router = express.Router();
const registroSubFamilia = require('../models/modelSubFamilia');
const { getNextSequence } = require ('../middleware/counter');

//TRAER TODOS LOS CONCEPTOS DE SUB FAMILIA
router.get("/listaSubFamilia", async (req,res) => {
    try{
        const subFamilia = await registroSubFamilia.find();
        const resultado = subFamilia.map(u => ({
            id: u.id,
            estatus: u.estatus,
            conceptoFamilia: u.conceptoFamilia,
            conceptoSubFamilia: u.conceptoSubFamilia
        }));

        res.json(resultado);
    }catch(e) {
        console.error("Hubo un error: ", e);
        res.status(500).join({ 
            message: "Error al obtener Sub Familia"
        });
    }
});
router.get("/listaSubFamilia/:id", async (req,res) => {
    try{
        const id= parseInt(req.params.id);
        const solicitud = await registroSubFamilia.findOne({id: id});

        if(!solicitud){
            return res.status(404).json({
                message: "Solicitud no encontrada"
            });
        }
        res.json(solicitud);
    }catch(e){
        console.error("Error en el GET /listaSubFamilia/:id", error);
        res.status(500).json({
            message: "Error en el servidor"
        });
    }
});

router.put('/listaSubFamilia/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("Editando concepto Sub Familia ID: ", id, "Datos: ", datos);

        //VERIFICACION QUE EXISTA LA SOLICITUD
        const subFamilia = await registroSubFamilia.findOne({id: id});
        if(!subFamilia){
            return res.status(404).json({
                success: false, 
                message: "Concepto no encontrado"
            });
        }

        //ACTUALIZAR LOS CAMPOS SOLO SI EXISTEN EN EL BODY
        if(datos.estatus !== undefined) subFamilia.estatus = datos.estatus;
        if(datos.conceptoFamilia !== undefined) subFamilia.conceptoFamilia = datos.conceptoFamilia;
        if(datos.conceptoSubFamilia !== undefined) subFamilia.conceptoSubFamilia = datos.conceptoSubFamilia;

        await subFamilia.save();

        console.log("Sub Familia actualizada Correctamente");
        res.json({
            success: true,
            message: `Solicitud id: ${id} actualizada correctamente`
        });
    }catch(e){
        console.error("Error en el PUT /listaSubFamilia/:id", e);
        res.status(500).json({ success: false,
            message: "Error al actualizar"
        });
    }
});

router.put('/listaSubFamiliaEliminacion/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("HACIENDO ELIMINACION");

        const solicitud = await registroSubFamilia.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({
                success: false,
                message: "Solicitud de compra no encontrada" 
            });
        }

        //ACTUALIZAR LOS CAMPOS 
        solicitud.estatus = 'Cancelado';
        solicitud.conceptoFamilia = datos.conceptoFamilia || solicitud.conceptoFamilia;
        solicitud.conceptoSubFamilia = datos.conceptoSubFamilia || solicitud.conceptoSubFamilia;

        await solicitud.save();
        console.log("Sub Familia Eliminada");
        res.json({
            success: true,
            message: `Solicitud id: ${id} actualizada correctamente`
        });
    }catch(error){
        console.error("Error el en DELETE /listaSubFamilia/:id", error);
        res.status(500).json({ success: false,
            message: "Error al eliminar"
        });
    }
});

// OBTENER FAMILIAS ÚNICAS PARA FILTRO
router.get("/familiasUnicas", async (req, res) => {
    try {
        const subFamilias = await registroSubFamilia.find();
        const familiasUnicas = [...new Set(subFamilias.map(sf => sf.conceptoFamilia))].filter(Boolean);
        
        res.json(familiasUnicas);
    } catch (error) {
        console.error("Error al obtener familias únicas:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener familias únicas" 
        });
    }
});
module.exports = router;