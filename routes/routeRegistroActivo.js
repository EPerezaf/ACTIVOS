const express = require("express");
const router = express.Router();
const registroActivo = require("../models/modelRegistroActivo");
const { getNextSequence } = require('../middleware/counter');

//TRAER TODOS LOS ACTIVOS
router.get("/traerActivo", async ( req,res) => {
    try{
        const activo = await registroActivo.find();
        const resultado = activo.map(u => ({
            id: u.id,
            familia: u.familia,
            subFamilia: u.subFamilia,
            conceptoActivo: u.conceptoActivo,
            nomenclatura: u.nomenclatura,
            marca: u.marca,
            modelo: u.modelo,
            descripcionAdicional: u.descripcionAdicional,
            costo: u.costo,
            numSerie: u.numSerie,
            idSolicitud: u.idSolicitud,
            estatus: u.estatus,
            responsable: u.responsable,
            fechaRegistro: u.fechaRegistro
        }));
        

        res.json(resultado);
    }catch(e){
        console.error("Hubo un error: ", e);
        res.status(500).join({
            message: "Error al obtener el activo"
        });
    }
});
router.get("/listaActivo/:id", async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const solicitud = await registroActivo.findOne({ id: id});

        if(!solicitud){
            return res.status(404).json({
                message: "Solicitud no entrada"
            });
        }
        res.json(solicitud);
    }catch(e){
        console.error("Error en el GET /listaActivo/:id", error);
        res.status(500).json({
            message: "Error en el servidor"
        });
    }
});

router.put("/listaActivo/:id", async(req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;
        
        console.log("Editando el activo ID: ", id, "Datos: ", datos);
        //VERIFICACION QUE EXISTA LA SOLICITUD
        const activo = await registroActivo.findOne({ id: id});
        if(!activo){
            return res.status(404).json({
                success: false,
                message: "Activo no encontrado"
            });
        }

        //ACTUALIZAR LOS CAMPOS SOLO SI EXISTEN EN EL BODY
        const camposPermitidos = [
           'nomenclatura',
           'marca',
           'modelo',
           'descripcionAdicional',
           'costo',
           'numSerie',
           'subFamilia',
           'conceptoActivo'
        ];

        camposPermitidos.forEach(campo =>{
            if(datos[campo] !== undefined){
                activo[campo] = datos[campo]
            }
        })

        activo.fechaModificacion = new Date();

        await activo.save();
        console.log("Activo actualizada correctamente");
        res.json({
            success: true,
            message: `Activo id: ${id} actualizada correctamente`
        });
    }catch(error){
        console.error("Error en el PUT /listaActivo/:id", error);
        res.status(500).json({ 
            success: false,
            message: "Error al actualizar"
        });
    }
});
router.put("/listaRegistroActivoEliminacion/:id", async (req,res) => {
    try{
        const id = parseInt(req.params.id);
        const datos = req.body;
        console.log("HACIENDO ELIMINACION");

        const solicitud = await registroActivo.findOne({ id: id});
        if(!solicitud){
            return res.status(404).json({
                success: false,
                message: "Solicitud de compra no encontrada"
            });
        }
        solicitud.estatus = "Cancelado";
        await solicitud.save();
        console.log("Activo Eliminado");
        res.json({
            success: true,
            message: `Activo id: ${id} Actualizada correctamente`
        });
    }catch(error){
        console.error("Error en el DELETE /listaRegistroActivoEliminacion/:id",error);
        res.status(500).json({ 
            success: false,
            message: "Error al eliminar"
        });
    }
});

router.get('/buscarActivo', async (req,res) => {
    console.log("Se escribio: ", req.query);
    try{
        const { buscar } = req.query;
        console.log("VALOR RECIBIDO: ", buscar);
        let query = {};
        if (buscar) {
            query = {
                $and: [
                    {
                        $or: [
                            { conceptoActivo: { $regex: buscar, $options: 'i' } },
                            { familia: { $regex: buscar, $options: 'i' } },
                            { subFamilia: { $regex: buscar, $options: 'i' } },
                            { nomenclatura: { $regex: buscar, $options: 'i' } },
                            { numSerie: { $regex: buscar, $options: 'i' } }
                        ]
                    },
                    { estatus: { $regex: /^alta$/i } } // SOLO ACTIVOS
                ]
            };
        } else {
            query = { estatus: { $regex: /^alta$/i } };
        }
        const activos = await registroActivo.find(query).limit(20);
        res.json(activos);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "ERROR AL BUSCAR ACTIVOS"});
    }
});

module.exports = router;