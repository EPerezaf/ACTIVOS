
const express = require('express');
const router = express.Router();
const registroProveedor = require('../models/modelProveedor');
const { getNextSequence } = require('../middleware/counter');

//ESQUEMA PARA ALTA DE PROVEEDOR
router.post('/altaProveedores', async (req, res) => {
    console.log("PETICION POST ALTA PROVEEDORES");
    console.log("RECIBIENDO: ", req.body);

    try{
        const { estatusProveedor,
            nickName,
            razonSocial,
            rfc,
            domicilioFiscal,
            ciudad,
            cp,
            correo,
            cuenta,
            clabe
        } = req.body;

        const id = await getNextSequence('proveedorId');
        const nuevoRegistro = new registroProveedor({
            id,
            estatusProveedor,
            nickName,
            razonSocial,
            rfc,
            domicilioFiscal,
            ciudad,
            cp,
            correo,
            cuenta,
            clabe
        });

        await nuevoRegistro.save();
        res.json({ message: 'Alta de proveedor EXITOSA!'});
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "ERROR AL GUARDAR"});
    }
});

//BUSCAR PROVEEDORES 
router.get('/buscarProveedores', async (req,res) => {
    console.log("Se escribio: ", req.query);
    try{
        const { buscar } = req.query;
        console.log("VALOR RECIBIDO", buscar);

        let query = {};
        if(buscar){
            query = {
                $or: [
                    { nickName: { $regex: buscar, $options: 'i' } },
                    { razonSocial: { $regex: buscar, $options: 'i' } }
                ]
            };
        }
        const proveedores = await registroProveedor.find(query).limit(20);
        res.json(proveedores);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "ERROR AL BUSCAR PROVEEDORES"});
    }
});

module.exports= router;