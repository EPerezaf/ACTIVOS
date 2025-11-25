const express = require('express');
const registroProveedor = require("../models/modelProveedor");
const router = express.Router();
const { getNextSequence } = require ("../middleware/counter");

//TRAER TODOS LOS PROVEEDORES
router.get("/traerProveedor", async (req,res) => {
    try{
        const proveedor = await registroProveedor.find();
        const resultado = proveedor.map(u =>({
            id: u.id,
            estatusProveedor: u.estatusProveedor,
            nickName: u.nickName,
            razonSocial: u.razonSocial,
            rfc: u.rfc,
            domicilioFiscal: u.domicilioFiscal,
            ciudad: u.ciudad,
            cp: u.cp,
            correo: u.correo,
            cuenta: u.cuenta,
            clabe: u.clabe
        }));
        res.json(resultado);
    }catch(e){
        console.error("Hubo un error al traer los Proveedores");
        res.status(500).join({
            message: "Error al obtener Proveedores"
        });
    }
});

router.get("/listaProveedor/:id", async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const solicitud = await registroProveedor.findOne({id: id});
        if(!solicitud){
            return res.status(404).json({
                success: false,
                message: "Solicitud no encontrada"
            });
        }
        res.json(solicitud);
    }catch(e){
        console.error("Error en el GET /listaProveedor/:id", error);
        res.status(500).json({
            message: "Error en el servidor"
        });
    }
});

router.put("/listaProveedor/:id", async(req,res) => {
    try{
        const id = parseInt(req.params.id);
        const solicitud = req.body;

        console.log("Editando Proveedor ID: ", id, "Datos: ", solicitud);

        //VERFICACION QUE EXISTA LA SOLICITUD   
        const proveedor = await registroProveedor.findOne({ id: id});
        if(!proveedor){
            return res.status(404).json({
                success: false, 
                message: "Proveedor no encontrado"
            });
        }

        //ACTUALIZAR LOS CAMPOS SOLO SI EXISTEN EN EL BODY  
        if(!solicitud.estatusProveedor !== undefined) proveedor.estatusProveedor = solicitud.estatusProveedor;
        if(!solicitud.nickName !== undefined) proveedor.nickName = solicitud.nickName;
        if(!solicitud.razonSocial !== undefined) proveedor.razonSocial = solicitud.razonSocial;
        if(!solicitud.rfc !== undefined) proveedor.rfc = solicitud.rfc;
        if(!solicitud.domicilioFiscal !== undefined) proveedor.domicilioFiscal = solicitud.domicilioFiscal;
        if(!solicitud.ciudad !== undefined) proveedor.ciudad = solicitud.ciudad;
        if(!solicitud.cp !== undefined) proveedor.cp = solicitud.cp;
        if(!solicitud.correo !== undefined) proveedor.correo = solicitud.correo;
        if(!solicitud.cuenta !== undefined) proveedor.cuenta = solicitud.cuenta;
        if(!solicitud.clabe !== undefined) proveedor.clabe = solicitud.clabe;

        await proveedor.save();
        res.json({
            success: true,
            message: `Proveedor id: ${id} actuliazado correctamente`
        });
    }catch(e){
        console.log("Error en el PUT /listaProveedor/:id ", e);
        res.status(500).json({
            success: false,
            message: "Error al actualizar"
        });
    }
})

router.put('/listaProveedorEliminar/:id', async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const proveedor = req.body;

        const solicitud = await registroProveedor.findOne({id: id});
        if(!solicitud){
            return res.status(404).json({
                success: false,
                message: "Proveedor no encontrado"
            });
        }
        //ACTUALIZAR LOS CAMPOS
        solicitud.estatusProveedor = "Cancelado";
        solicitud.nickName = proveedor.nickName || solicitud.nickName;
        solicitud.razonSocial = proveedor.razonSocial || solicitud.razonSocial;
        solicitud.rfc = proveedor.rfc || solicitud.rfc;
        solicitud.domicilioFiscal = proveedor.domicilioFiscal || solicitud.domicilioFiscal;
        solicitud.ciudad = proveedor.ciudad || solicitud.ciudad;
        solicitud.cp = proveedor.cp || solicitud.cp;
        solicitud.correo = proveedor.correo || solicitud.correo;
        solicitud.cuenta = proveedor.cuenta || solicitud.cuenta;
        solicitud.clabe = proveedor.clabe || solicitud.clabe;

        await solicitud.save();

        res.json({
            success: true,
            message: `Proveedor id: ${id}, Eliminado correctamente`
        });
    }catch(e){
        console.error("Error en el DELETE /listaProveedores/:id", e);
        res.status(500).json({
            success: false,
            message: "Error al eliminar"
        });
    }
});

// OBTENER CIUDADES ÚNICAS PARA FILTRO
router.get("/ciudadesUnicas", async (req, res) => {
    try {
        const proveedores = await registroProveedor.find();
        const ciudadesUnicas = [...new Set(proveedores.map(p => p.ciudad))].filter(Boolean);
        
        res.json(ciudadesUnicas);
    } catch (error) {
        console.error("Error al obtener ciudades únicas:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener ciudades únicas" 
        });
    }
});

module.exports = router;