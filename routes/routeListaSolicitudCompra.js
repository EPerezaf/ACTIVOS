
//=================================================================================================================
//=================================================================================================================
//======================LISTA DE SOLICITUDES DE COMPRA===============================================================
//=================================================================================================================
//CARGAR LAS SOLICITUDES DE COMPRAS
const express = require('express');
const router = express.Router();
const registroSolicitudCompra = require('../models/modelSolicitudCompra');
const { getNextSequence }  = require('../middleware/counter');

//VALIDACION DE ROLES CON INICIO DE SESION
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

//CARGAR LAS SOLICITUDES DE COMPRAS (ACCESIBLE PARA TODOS LOS ROLES AUTENTICADOS)
router.get('/solicitudes', authMiddleware, async (req, res) => {
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
            })),
            conceptoActivo: u.conceptoActivo.map(f => ({
                sc_cca_familia: f.sc_cca_familia,
                sc_cca_subFamilia: f.sc_cca_subFamilia,
                sc_cca_descripcion: f.sc_cca_descripcion
            })),
            proveedores: u.proveedores.map(j => ({
                razonSocial: j.razonSocial,
                nickname: j.nickname,
                sc_monto: j.sc_monto
            }))
        }));

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener solicitudes" });
    }
});

//ENDPOINT PARA AUTORIZAR SOLICITUD (SOLO GERENTE GENERAL Y ADMINISTRADOR)
router.put('/solicitudCompra/:id/autorizar', authMiddleware, roleMiddleware(["Gerente General", "Administrador"]), async (req, res) => {
    try{
        const id = Number(req.params.id);

        console.log("AUTORIZANDO SOLICITUD:", id);
        console.log("Usuario que autoriza:", req.user);

        //BUSCAR Y ACTUALIAZR LA SOLICITUD 
        const solicitud = await registroSolicitudCompra.findOne({id: id});
        if(!solicitud){
            return res.status(404).json({ success: false, message: "Solicitud no encontrada"});
        }

        if(solicitud.estatusCompras === 'Autorizada'){
            return res.status(400).json({ success: false, message: "La solciitud ya esta autorizada"});
        }

        //ACTUALIZAR ESTATUS E INFORMACION DE AUTORIZACION 
        solicitud.estatusCompras = "Autorizada";
        solicitud.fechaAutorizacion = new Date();
        solicitud.autorizadoPor = {
            userId: req.user.id,
            role: req.user.role,
            username: req.user.username || "Sistema"
        };

        const resultado = await solicitud.save();
        console.log("Solicitud autorizada:", resultado);

        res.json({
            success: true,
            message: `Solicitud #${id} autorizada correctamente`,
            solicitud: resultado
        });
    }catch(error){
        console.error("Error en PUT /solicitudCompra/:id/autorizar", error);
        res.status(500).json({ success: false, message: "Error al autorizar la solicitud"});
    }
});


//ENDPOINT PARA PODER ELIMINAR SOLICITUD DE COMPRA (SOLO GERENTE GENERAL Y ADMINISTRADOR)
router.delete('/solicitudCompra/:id', authMiddleware, roleMiddleware(["Jefe de Activos", "Administrador"]),async (req, res) => {
    try{
        const id = Number(req.params.id);
        const result = await registroSolicitudCompra.deleteOne({ id });

        if(result.deletedCount == 0){
            return res.status(400).json({ success: false, message: "solicitud no encontrada"});
        }
        res.json({ message: true, message: `Solicitud #${id} eliminada correctamente`});
    }catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: "Error al encontrar la solicitud"});
    }
});

//END POINT PARA EDITAR LA SOLICITUD DE COMPRA
// Obtener UNA solicitud por id
router.get('/solicitudes/:id', authMiddleware,async (req, res) => {
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
router.put('/solicitudCompra/:id', authMiddleware,roleMiddleware(["Jefe de Activos", "Administrador"]), async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;

        console.log("EDITANDO SOLICITUD:", id);
        //console.log("Datos recibidos para actualizar:", datos);

        //VERIFICAR QUE EXISTA LA SOLICITUD
        const solicitud = await registroSolicitudCompra.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({ success: false, message:"Solicitud de compra no encontrada"});
        }

        //ACTUALIZAR CAMPOS
        solicitud.clasificacionCompras = datos.clasificacionCompras || solicitud.clasificacionCompras;
        solicitud.descripcionConceptoCompra = datos.descripcionConceptoCompra || solicitud.descripcionConceptoCompra;
        solicitud.personal = datos.personal || solicitud.personal;
        
        const nuevoConcepto = datos.conceptoActivo;
        console.log("Concepto recibido para actualizar: ", nuevoConcepto);
        solicitud.conceptoActivo = nuevoConcepto;
        console.log("concepto para guardar:", solicitud.conceptoActivo);
        solicitud.conceptoActivo = datos.conceptoActivo;
        //solicitud.proveedores = datos.proveedores || solicitud.proveedores;

       const nuevosProveedores = datos.proveedores;
        solicitud.proveedores = nuevosProveedores;
        console.log("Proveedores para guardar: ", solicitud.proveedores);
        console.log("Concepto activos para guardar: ",solicitud.conceptoActivo);
        const resultado = await solicitud.save();
        console.log("lo que se guarda alfinal: ",resultado);

        res.json({
            success: true,
            message: `Solciitud id:${id} actualizada correctamente`,
            solicitud: resultado
        });
    }catch(error){
        console.error("Error en el PUT /solicitudCompra/:id", error);
        res.status(500).json({ success: false, message:"Error al actualizar la solicitud"});
    }
});

router.put("/solicitudCompra/:id/proceso", authMiddleware,roleMiddleware(["Jefe de Activos", "Administrador"]), async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;
        console.log("Mandando a proceso solicitud id: ", id);

        const solicitud = await registroSolicitudCompra.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({ success: false, message: "Solicitud no encontrada"});
        }
        solicitud.estatusCompras = "Proceso";
        const resultado = await solicitud.save();
        console.log("Como se mando a gaurdar: ", resultado);

        res.json({
            success: true,
            message: `Solicitud id:${id} actualizada correctamente`,
            solicitud: resultado
        });
    }catch(error){
        console.error("Error en el PUT /solicitudCompra/:id/proceso", error);
        res.status(500).json({ success: false, message: "Error al actualizar solicitud"});
    }
})
module.exports = router;