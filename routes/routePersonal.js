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
        console.log("Entrando al try")
        const { estatusPersonal, nombre, aPaterno, aMaterno, p_curp, p_ciudad, p_estado, p_edad } = req.body;

        //VALIDAR CAMPOS REQUERIDOS 
        if (!nombre || !aPaterno || !aMaterno || !p_curp) {
            return res.status(400).json({
                success: false,
                message: "Nombre, apellidos y CURP son requeridos"
            });
        }
        const id = await getNextSequence('personalId');
        const nuevoRegistro = new registroPersonal({
            id,
            estatusPersonal,
            nombre,
            aPaterno,
            aMaterno,
            p_curp,
            p_ciudad,
            p_estado,
            p_edad
        });

        console.log("Datos a guardar:", nuevoRegistro);

        await nuevoRegistro.save()
        res.json({ message: 'Personal guardado Correctamente', data: nuevoRegistro});
        if(res.success){
            window.location.href = "html/listaPersonal.html"
        }
    } catch (error) {
        res.status(500).json({ message: "Error al guardar", error: error.message });
        console.log("error", error);
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
                $and: [
                    {
                        $or: [
                            { nombre: { $regex: buscar, $options: 'i' } },
                            { aPaterno: { $regex: buscar, $options: 'i' } },
                            { aMaterno: { $regex: buscar, $options: 'i' } }
                        ]
                    },
                    { estatusPersonal: { $regex: /^alta$/i } }
                ]
            };
        }else {
            query = { estatusPersonal: { $regex: /^alta$/i } };
        }
        const usuarios = await registroPersonal.find(query).limit(20);
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "ERROR AL BUSCAR USUARIOS" });
    }
})

module.exports = router;