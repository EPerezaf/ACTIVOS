//REGISTRO ESQUEMA DE CONCEPTO COMPRA
//conceptoCompra.html
const express = require('express');
const router = express.Router();
const registroConceptoCompra  = require('../models/modelConceptoCompra');
const { getNextSequence } = require('../middleware/counter');

router.post('/conceptoCompra', async (req,res)=> {
    console.log('PETICION POST');
    console.log("RECIBIENDO", req.body);

    try{
        const { estatusConceptoCompra, conceptoCompra} = req.body;

        //CREAR REGISTRO EN LA COLECCION
        const id = await getNextSequence('conceptoCompraId');
        const nuevoRegistro = new registroConceptoCompra({
            id,
            estatusConceptoCompra,
            conceptoCompra
        });

        await nuevoRegistro.save();
        res.json({ message: 'Concepto guardado correctamente'});
        console.log('Se ha guardado: ', nuevoRegistro);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error al guardar"});
    }
});

router.get('/traerConceptoCompra', async (req, res) => {
    try{
        const { buscar } = req.query;
        console.log("VALOR RECIBIDO DE FAMILIA", buscar);

        let query = {};
        if(buscar) {
            query = {
                $or: [
                    { conceptoCompra: { $regex: buscar, $options: 'i' } }
                ]
            };
        }
        const conceptoCompras = await registroConceptoCompra.find(query).limit(20);
        res.json(conceptoCompras);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "ERROR AL BUSCAR EN FAMILIAS ACTIVOS"});
    }
})

module.exports = router;
