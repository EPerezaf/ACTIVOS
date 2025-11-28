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
        const conceptoSubFamilia = await registroSubFamilia.find({
            estatus: { $regex: /^alta$/i }
        });
        res.json(conceptoSubFamilia);
    } catch (error) {
        console.log("Error al obtener familias activas: ", error);
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
                    { conceptoFamilia: { $regex: buscar, $options: 'i' } },
                    { estatus: { $regex: /^alta$/i }}
                ]
            };
        }else{
            query = { estatus: { $regex: /^alta$/i } };
        }

        const subFamilia = await registroSubFamilia.find(query).limit(20);
        console.log(`SubFamilias activas encontradas: ${subFamilia.length}`);
        res.json(subFamilia);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al buscar subfamilias"});
    }
});

//BUSCAR CONCEPTOS DE COMPRA ACTIVOS
//comprasActivos.html
router.get('/buscarActivo', async (req, res) => {
    console.log("Se escribio: ",req.query);
    try{
        const { buscar } = req.query;
        console.log("Valor recibido: ", buscar);

        let query = {};
        if(buscar){
            query = {
                $and: [
                    { conceptoActivos : { $regex: buscar, $options: 'i' } },
                    { estatus: { $regex: /^alta$/i } }
                ]
            };
        }else{
            query = { estatus: { $regex: /^alta$/i } };
        }
        const concepto = await registroConceptoActivos.find(query).limit(20);
        res.json(concepto);
    }catch(error){
        console.error("Error: ", error);
        res.status(500).json({ message: "Error al buscar el activo"});
    }
})

// BUSCAR SUBFAMILIAS POR FAMILIA ESPECÍFICA (SOLO ACTIVAS)
// conceptoActivos.html
router.get('/buscarSubFamiliaPorFamilia', async (req, res) => {
    console.log("Buscando subfamilias para familia:", req.query);
    try {
        const { familia } = req.query;
        console.log("FAMILIA RECIBIDA:", familia);
        
        if (!familia) {
            return res.status(400).json({ message: "Se requiere el parámetro 'familia'" });
        }

        // Buscar subfamilias que pertenezcan EXACTAMENTE a esta familia y estén activas
        const query = {
            conceptoFamilia: { $regex: `^${familia}$`, $options: 'i' }, // Búsqueda exacta case insensitive
            estatus: { $regex: /^alta$/i } // SOLO SUBFAMILIAS ACTIVAS
        };

        console.log("Query ejecutado:", query);
        
        const subfamilias = await registroSubFamilia.find(query);
        console.log(`Subfamilias encontradas para "${familia}": ${subfamilias.length}`);
        
        res.json(subfamilias);
    } catch (error) {
        console.error("Error al buscar subfamilias por familia:", error);
        res.status(500).json({ message: "Error al buscar subfamilias" });
    }
});

module.exports = router;