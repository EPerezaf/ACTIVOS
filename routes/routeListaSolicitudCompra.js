
//=================================================================================================================
//=================================================================================================================
//======================LISTA DE SOLICITUDES DE COMPRA===============================================================
//=================================================================================================================
//CARGAR LAS SOLICITUDES DE COMPRAS
const express = require('express');
const router = express.Router();
const registroSolicitudCompra = require('../models/modelSolicitudCompra');
const { getNextSequence }  = require('../middleware/counter');

router.get('/solicitudes', async (req, res) => {
    try {
        const solicitudes = await registroSolicitudCompra.find();

        const resultado = solicitudes.map(u => ({
            id: u.id,
            estatusCompras: u.estatusCompras,
            fechaCreacion: u.fechaCreacion,
            clasificacionCompras: u.clasificacionCompras,
            descripcionConceptoCompra: u.descripcionConceptoCompra,
            personal: u.personal.map(p => ({
                nombre: p.nombre,
                aPaterno: p.aPaterno,
                aMaterno: p.aMaterno,
                comentario: p.comentario
            })),
            conceptoCompras: u.conceptoCompras.map(f => ({
                conceptoCompra: f.conceptoCompra,
                comentario: f.comentario
            })),
            proveedores: u.proveedores.map(j => ({
                razonSocial: j.razonSocial,
                costo: j.costo
            }))
        }));

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener solicitudes" });
    }
});


//ENDPOINT PARA PODER ELIMINAR SOLICITUD DE COMPRA
router.delete('/solicitudCompra/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const result = await registroSolicitudCompra.deleteOne({ id: Number(id) });

        if(result.deletedCount == 0){
            return res.status(400).json({ success: false, message: "solicitud no encontrada"});
        }
        res.json({ message: true, message: `Solicitud #${id} eliminada correctamente`});
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: "Error al encontrar la solicitud"});
    }try{
        const id = req.params.id;
        const solicitud = await registroSolicitudCompra.findOne({ id: Number(id)});
        if(!solicitud){
            return res.status(404).json({ success: false, message: "Solicitud no encontrada"});
        }
        res.json(solicitud);
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: "Error al encontrar la solicitud"});
    }
});

//END POINT PARA EDITAR LA SOLICITUD DE COMPRA
// Obtener UNA solicitud por id
router.get('/solicitudes/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id); // porque tu campo "id" en el schema es Number
        const solicitud = await registroSolicitudCompra.findOne({ id: id });

        if (!solicitud) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        res.json(solicitud);
    } catch (error) {
        console.error("Error en GET /solicitudes/:id", error);
        res.status(500).json({ message: "Error del servidor" });
    }
});

//ENDPOINT PARA EDITAR UNA SOLICITUD DE COMPRA
router.put('/solicitudCompra/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("EDITANDO SOLICITUD:", id);
        console.log("Datos recibidos para actualizar:", datos);

        //VERIFICAR QUE EXISTA LA SOLICITUD
        const solicitud = await registroSolicitudCompra.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({ success: false, message:"Solicitud de compra no encontrada"});

        }

        //ACTUALIZAR CAMPOS
        solicitud.clasificacionCompras = datos.clasificacionCompras || solicitud.clasificacionCompras;
        solicitud.descripcionConceptoCompra = datos.descripcionConceptoCompra || solicitud.descripcionConceptoCompra;
        solicitud.personal = datos.personal || solicitud.personal;
        solicitud.conceptoCompras = datos.conceptoCompras || solicitud.conceptoCompras;
        solicitud.proveedores = datos.proveedores || solicitud.proveedores;

        const resultado = await solicitud.save();

        res.json({
            success: true,
            message: `Solciitud id:${id} actualizada correctamente`,
            solicitud: resultado
        });
    }catch(error){
        console.error("Error en el PUT /solicitudCompra/:id", error);
        res.status(500).json({ success: false, message:"Error al actualizar la solicitud"});
    }
})

module.exports = router;