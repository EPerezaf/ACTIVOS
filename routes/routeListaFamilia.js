const express = require('express');
const router = express.Router();
const registroFamilia = require('../models/familiaActivos');
const { getNextSequence } = require ('../middleware/counter');

//TRAER TODOS LOS CONCEPTOS DE FAMILIA 
router.get('/listaFamilia', async (req, res) => {
    try{
        const familias = await registroFamilia.find();

        const resultado =familias.map(u => ({
            id: u.id,
            estatus: u.estatus,
            concepto: u.concepto
        }));

        res.json(resultado);
    }catch(error){
        console.error("HUbo un error: ", error);
        res.status(500).join({ message: "Error al obtener familias"});
    }
});

//TRAER POR ID EL CONCEPTO DE FAMILIA
router.get("/listaFamilia/:id", async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const solicitud = await registroFamilia.findOne({id: id});

        if(!solicitud){
            return res.status(404).json({ message: "Solicitud no encontrada"});
        }

        res.json(solicitud);
    }catch(error) {
        console.error("Error en el GET /listaFamilia/:id ", error);
        res.status(500).json({ message: "Error en el servidor"});
    }
});

router.put('/listaFamilia/:id', async (req,res) => {
    try{
        const id= parseInt(req.params.id);
        const datos = req.body;

        console.log("Editando concepto familia ID: ", id, "Datos: ", datos);

        //VERIFICAR QUE EXISTA LA SOLICITUD
        const familia = await registroFamilia.findOne({id: id});
        if(!familia){
            return res.status(404).json({ success: false, message: "Concepto no encontrado"});
        }

        //ACTUALIZAR LOS CAMPOS SOLO SI EXISTEN EN EL BODY
        if(datos.estatus !== undefined) familia.estatus = datos.estatus;
        if(datos.concepto !== undefined) familia.concepto = datos.concepto;

        await familia.save();

        console.log("Familia actualizada correctamente");
        res.json({
            success: true,
            message: `Solicitud id:${id} actualizada correctamente`
        });

    }catch(error){
        console.error("Error en el PUT /listaFamilia/:id ", error);
        res.status(500).json({ success: false, message: "Error al actualizar la solicitud"});
    }
})

module.exports = router;