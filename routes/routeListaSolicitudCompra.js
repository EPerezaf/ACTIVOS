
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
        solicitud.conceptoActivo = datos.conceptoActivo;
        //solicitud.proveedores = datos.proveedores || solicitud.proveedores;

        /*if(Array.isArray(datos.proveedores) && datos.proveedores.length > 0){
            const proveedoresExistentes = solicitud.proveedores || [];
            const nuevosProveedores = datos.proveedores;
            console.log("proveedores existentes ",proveedoresExistentes );
            console.log("Proveedores nuevos: ", nuevosProveedores)
            const proveedoresCombinados = [...proveedoresExistentes, ...nuevosProveedores];
            console.log("proveedores combinados: ", proveedoresCombinados)
            
            const proveedorSinDuplicados = proveedoresCombinados.filter(
                (prov,index, self) =>
                    index === self.findIndex(p => p.nickname === prov.nickname)
            );
            console.log("proveedor sin duplicados: ", proveedorSinDuplicados);

            solicitud.proveedores = proveedorSinDuplicados;
        }*/
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
})

module.exports = router;