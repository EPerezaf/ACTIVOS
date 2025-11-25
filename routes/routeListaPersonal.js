const express = require("express");
const router = express.Router();
const registroPersonal = require('../models/modelPersonal');
const { getNextSequence } = require ('../middleware/counter');

//TRAER EL PERSONAL
router.get("/traerPersonal", async (req,res) => {
    try{
        const personal = await registroPersonal.find();
        const resultado = personal.map(u => ({
            id: u.id,
            estatusPersonal: u.estatusPersonal,
            nombre: u.nombre,
            aPaterno: u.aPaterno,
            aMaterno: u.aMaterno,
            p_curp: u.p_curp,
            p_ciudad: u.p_ciudad,
            p_estado: u.p_estado,
            p_edad: u.p_edad
        }));
        res.json(resultado);
    }catch(e){
        console.error("Hubo un error al traer el personal: ", e);
        res.status(500).json({
            message: "Error al obtener Personal"
        });
    }
});

router.get("/listaPersonal/:id", async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const resultado = await registroPersonal.findOne({id: id});
        if(!resultado){
            return res.status(404).json({
                message: "Personal no encontrada"
            });
        }
        res.json(resultado);
    }catch(e){
        console.error("Error en el GET /listaPersonal/:id", e);
        res.status(500).json({
            success: false,
            message: "Error en el servidor"
        });
    }
});

router.put("/listaPersonal/:id", async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const resultado = req.body;

        const personal = await registroPersonal.findOne({id: id});
        if(!personal){
            return res.status(404).json({
                success: false,
                message: "Personal no encontrado"
            });
        }
        if(resultado.estatusPersonal !== undefined) personal.estatusPersonal = resultado.estatusPersonal;
        if(resultado.nombre !== undefined) personal.nombre = resultado.nombre;
        if(resultado.aPaterno !== undefined) personal.aPaterno = resultado.aPaterno;
        if(resultado.aMaterno !== undefined) personal.aMaterno = resultado.aMaterno;
        if(resultado.p_curp !== undefined) personal.p_curp = resultado.p_curp;
        if(resultado.p_ciudad !== undefined) personal.p_ciudad = resultado.p_ciudad;
        if(resultado.p_estado !== undefined) personal.p_estado = resultado.p_estado;
        if(resultado.p_edad !== undefined) personal.p_edad = resultado.p_edad;
        
        await personal.save();
        console.log("Personal actualziado correctamente");
        res.json({
            success: true,
            message: `Personal id: ${id} actualizada correcteamente`
        });

    }catch(e){
        console.error("Error en el PUT /listaPersonal/:id", e);
        res.status(500).json({
            success: false, 
            message: "Error al actualizar"
        });
    }
});
router.put("/listaPersonalEliminacion/:id", async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;

        const solicitud = await registroPersonal.findOne({id: id});
        if(!solicitud){
            return res.status(404).json({
                success: false, 
                message: "Personal no encontrado"
            });
        }

        solicitud.estatusPersonal = "Cancelado";

        await solicitud.save();
        res.json({
            success: true,
            message: `Personal id: ${id}, Eliminado correctamente`
        });

        if(solicitud.success){
            window.location.href = "/html/listaPersonal.html";
        }
    }catch(e){
        console.error("Error en el DELETE /listaPersonalEliminacion/:id", e);
        res.status(500).json({
            success: false,
            message: "Error al eliminar"
        });
    }
})

// OBTENER ESTADOS ÚNICOS PARA FILTRO
router.get("/estadosUnicos", async (req, res) => {
    try {
        const personal = await registroPersonal.find();
        const estadosUnicos = [...new Set(personal.map(p => p.p_estado))].filter(Boolean);
        
        res.json(estadosUnicos);
    } catch (error) {
        console.error("Error al obtener estados únicos:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al obtener estados únicos" 
        });
    }
});

// OBTENER CIUDADES ÚNICAS PARA FILTRO
router.get("/ciudadesUnicas", async (req, res) => {
    try {
        const personal = await registroPersonal.find();
        const ciudadesUnicas = [...new Set(personal.map(p => p.p_ciudad))].filter(Boolean);
        
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