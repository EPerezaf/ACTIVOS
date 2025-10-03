//REGISTRO ESQUEMA DE PERSONAL 
//personal.html
const express = require('express');
const router = express.Router();
const registroPersonal = require('../models/modelPersonal');
const { getNextSequence } = require('../middleware/counter');

router.post('/personal', async (req, res) => {
    console.log("PETICION POST DE PERSONAL");
    console.log("RECIBIENDO", req.body);

    try {
        const { estatusPersonal, nombre, aPaterno, aMaterno, fechaNacimiento } = req.body;
        const id = await getNextSequence('personalId');
        const nuevoRegistro = new registroPersonal({
            id,
            estatusPersonal,
            nombre,
            aPaterno,
            aMaterno,
            fechaNacimiento
        });

        await nuevoRegistro.save()
        res.json({ message: 'Personal guardado Correctamente' });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar" });
    }
});


//TRAER TODO EL PERSONAL
router.get('/traerPersonal', async (req, res) => {
    console.log("se escribio: ", req.query);
    try {
        const { buscar } = req.query;
        console.log("VALOR RECIBIDO", buscar);

        let query = {};
        if (buscar) {
            query = {
                $or: [
                    { nombre: { $regex: buscar, $options: 'i' } },
                    { aPaterno: { $regex: buscar, $options: 'i' } },
                    { aMaterno: { $regex: buscar, $options: 'i' } }
                ]
            };
        }
        const usuarios = await registroPersonal.find(query).limit(20);
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "ERROR AL BUSCAR USUARIOS" });
    }
})

module.exports = router;