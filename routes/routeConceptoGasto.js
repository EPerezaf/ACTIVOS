//ESQUEMA DE CONCEPTO GASTO 
//conceptoGasto.html
const express = require('express');
const router = express.Router();
const registroConceptoGasto = require('../models/modelConceptoGasto');
const { getNextSequence } = require('../middleware/counter');


router.post('/conceptoGasto', async (req, res) => {
    console.log("PETICION POST CONCEPTO GASTO");
    console.log("RECIBIENDO", req.body);

    try {
        const { estatus, conceptoGasto } = req.body;

        const id = await getNextSequence('conceptoGastoId');
        const nuevoRegistro = new registroConceptoGasto({
            id,
            estatus,
            conceptoGasto
        });

        await nuevoRegistro.save()
        res.json({ message: 'Concepto guarado correctamente' });
    } catch (error) {
        res.status(500).json({ meesage: "Error al guardar" });
    }
});

module.exports = router;