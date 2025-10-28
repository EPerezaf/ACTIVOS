const express = require('express');
const router = express.Router();
const registroConceptoActivos = require('../models/modelConceptoActivos');
const registroSubFamilia = require('../models/modelSubFamilia');
const { getNextSequence } = require('../middleware/counter');


router.post('/conceptoActivos', async (req, res) => {
    console.log("PETICION POST DE CONCEPTO ACTIVOS");
    console.log("RECIBIENDO", req.body);

    try {
        const { estatus, conceptoFamilia, conceptoSubFamilia, listaMedida, conceptoActivos } = req.body;
        

        //CREAR REGISTRO EN LA COLECCION DE CONCEPTO ACTIVOS
        const id = await getNextSequence('conceptoActivoId');
        const nuevoRegistro = new registroConceptoActivos({
            id,
            estatus,
            conceptoFamilia,
            conceptoSubFamilia,
            conceptoActivos
        });

        await nuevoRegistro.save()
        res.json({ message: 'Concepto guardado correctamente' });
        console.log("GUARDANDO", nuevoRegistro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar" });
    }
});

//CONSULTA DE LISTA DE MODELO SUB FAMILIA
router.get('/traerSubFamilia', async (req, res) => {
    try {
        const conceptoSubFamilia = await registroSubFamilia.find();
        res.json(conceptoSubFamilia);
    } catch (error) {
        res.status(500).json({ message: "Error a obtener los datos" });
    }
})

//BUSCAR SUB FAMILIA POR MEDIO DE SELECCION FAMILIA
//conceptoActivos.html 
router.get('/buscarSubFamilia', async (req,res) => {
    console.log("Se escribio: ", req.query);
    try{
        const { buscar } = req.query;
        console.log("VALOR RECIBIDO", buscar);
        
        let query = {};
        if(buscar){
            query = {
                $or: [
                    { conceptoFamilia: { $regex: buscar, $options: 'i' } }
                ]
            };
        }
        const subFamilia = await registroSubFamilia.find(query).limit(20);
        res.json(subFamilia);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al buscar subfamilias"});
    }
});

module.exports = router;