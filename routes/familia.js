
//REGISTRO DE FAMILIA CONCEPTO
//REGISTRO conceptoFamiliaActivos.html

const express = require('express');
const router = express.Router();
const registroFamilia = require('../models/familiaActivos');
const { getNextSequence } = require('../middleware/counter');

//REGISTRO DE FAMILIA CONCEPTO
//REGISTRO conceptoFamiliaActivos.html
router.post('/familiaActivos', async (req, res) => {
    console.log("PETICION POST DE FAMILIA CONCEPTO");
    console.log("RECIBIENDO", req.body);

    const { estatus, concepto } = req.body;
    try {
        const id = await getNextSequence('familiaId');
        console.log('Siguiente ID generado: ', id);
        const nuevo = new registroFamilia({ id, estatus, concepto });
        await nuevo.save();
        res.json({ message: 'Datos agregados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar" })
    }
});

module.exports =router;