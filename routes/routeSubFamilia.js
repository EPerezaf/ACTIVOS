//REGISTRO DE SUBFAMILIA 
//conceptoSubFamilia.html
const express = require('express');
const router = express.Router();
const registroSubFamilia = require('../models/modelSubFamilia');
const registroFamilia = require('../models/familiaActivos');
const { getNextSequence } = require('../middleware/counter');

router.post('/subFamilia', async (req, res) => {
    console.log("PETICION POST DE SUB FAMILIA");
    console.log("RECIBIENDO", req.body);
    try {
        const { conceptoFamilia, estatus, conceptoSubFamilia } = req.body;
        //BUSCAR DATOS DEL SELECCIONADO
        const familia = await registroFamilia.findOne({ id: conceptoFamilia });
        if (!familia) {
            return res.status(404).json({ message: "Datos no encontrados" });
        }

        //CREAR REGISTRO EN LA COLECCION DE SUB FAMILIA
        const id = await getNextSequence('subFamiliaId');
        const nuevoRegistro = new registroSubFamilia({
            id,
            conceptoFamilia: familia.concepto,
            estatus,
            conceptoSubFamilia
        });

        await nuevoRegistro.save()
        res.json({ message: 'Concepto guardado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar" });
    }
});


router.get('/traerFamilia', async (req, res) => {
    try {
        const conceptFamilia = await registroFamilia.find();
        res.json(conceptFamilia);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los datos" });
    }
})

module.exports = router;