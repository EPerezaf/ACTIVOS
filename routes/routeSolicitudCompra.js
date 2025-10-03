const express = require('express');
const router = express.Router();
const registroConceptoCompra = require('../models/modelConceptoCompra');
const registroSolicitudCompra = require('../models/modelSolicitudCompra');
const { getNextSequence } = require('../middleware/counter');

router.post('/solicitudCompra', async (req, res) => {
    console.log("PETICION POST DE SOLICITUD DE COMPRA");

    try{
        const datos = req.body;
        console.log("Datos recibidos:", datos);
        
        //VERIFICACION ESTRICTA - DEBE HACER AL MENOS UNO DE CADA UNO
        if(!datos.personal || !Array.isArray(datos.personal) || datos.personal.length == 0){
            return res.status(400).json({
                message: "ERROR: Debe seleccionar al menos un personal",
                success: false
            });
        }
        if(!datos.conceptoCompras || !Array.isArray(datos.conceptoCompras) || datos.conceptoCompras.length == 0){
            return res.status(400).json({
                message: "ERRRO: Debe seleccionar al menos una familia",
                success: false
            });
        }
        if(!datos.proveedores || !Array.isArray(datos.proveedores)|| datos.proveedores.length == 0){
            return res.status(400).json({
                message: "ERROR: Debe seleccionar al menos un personal",
                success: false
            });
        }
        console.log(`Verifiacacion pasada: Personal: ${datos.personal.length}, Concepto Compras: ${datos.conceptoCompras.length}, Proveedores: ${datos.proveedores.length}`);

        //OBTENER UN SOLO ID PARA TODO EL DOCUMENTO
        const id = await getNextSequence('solicitudCompraId');
        console.log("ID unico generado: ", id);

        //CREAR UN SOLO DOCUMENTO CON TODO
        const solicitudCompleta = {
            id: id,
            fechaCreacion: new Date(),
            clasificacionCompras: datos.clasificacionCompras,
            descripcionConceptoCompra: datos.descripcion,
            personal: datos.personal,
            conceptoCompras: datos.conceptoCompras,
            proveedores: datos.proveedores
        };
        
        console.log("Documento completo a guardar:", solicitudCompleta);

        //GUARDAR UN SOLO DOCUMENTO
        const nuevoRegistro = new registroSolicitudCompra(solicitudCompleta);
        const resultado = await nuevoRegistro.save();

        

        console.log("SOLICITUD GUARDAD CORRECTAMENTE");
        console.log("RESULTADO GUARDADO:", resultado);

        res.json({
            message: "SOLICITUD DE COMPRA GUARDADA CORRECTAMENTE",
            success: true,
            id: resultado.id,
            personalGuardado: datos.personal.length,
            conceptoComprasGuardadas: datos.conceptoCompras.length,
            proveedores: datos.proveedores.length
        });
    }catch(error){
        console.error("ERROR EN EL SERVIDOR:", error);
        res.status(500).json({
            message: "ERROR AL GUARDAR",
            error: error.message,
            success: false
        });
    }
});

module.exports = router;