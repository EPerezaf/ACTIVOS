const { error } = require('console');
const e = require('express');
const express = require('express');
const mongosee = require('mongoose');
const { type } = require('os');
const path = require('path');
const { DEFAULT_CIPHERS } = require('tls');

const app = express();
const PORT = 3000;

//CONEXION A MONGODB
mongosee.connect('mongodb://127.0.0.1:27017/ActivosForm')
    .then(() => console.log('Conectando a MongoDB'))
    .catch(err => console.error('Error de conexion:', err));

//AGREGAR INCREMENTAL DE ID 
const CounterSchema = new mongosee.Schema({
    _id: { type: String, required: true }, //EL NOMBRE DEL CONTADOR
    seq: { type: Number, default: 0 }
});

//COLECCION GENERAL PARA LOS ID'S
const Counter = mongosee.model('Counter', CounterSchema);

//FUNCION PARA EL CONTADOR GENERAL
async function getNextSequence(counterName) {
    const counter = await Counter.findByIdAndUpdate(
        { _id: counterName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
}

//MIDDLEAWERS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//ESQUEMA Y MODELO DE FAMILIA ACTIVOS=============================================
const familiaActivos = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO 
    estatus: String,
    concepto: String
});
const registroFamilia = mongosee.model('familiaActivos', familiaActivos, 'familiaActivos');

//REGISTRO DE FAMILIA CONCEPTO
//REGISTRO conceptoFamiliaActivos.html
app.post('/familiaActivos', async (req, res) => {
    console.log("PETICION POST DE FAMILIA CONCEPTO");
    console.log("RECIBIENDO", req.body);

    const { estatus, concepto } = req.body;
    try {
        const id = await getNextSequence('familiaId');
        console.log('Siguiente ID generado: ', id);
        const nuevo = new registroFamilia({ id, estatus, concepto });
        await nuevo.save();
        res.json({ message: 'Datos agregados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar" })
    }
});

//ESQUEMA Y MODELO DE SUB FAMILIA ACTIVOS=============================================
//REGISTRO conceptoSubFamilia.html
const subFamilia = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO
    conceptoFamilia: String,
    estatus: String,
    conceptoSubFamilia: String
});
const registroSubFamilia = mongosee.model('subFamilia', subFamilia, 'subFamilia');

app.post('/subFamilia', async (req, res) => {
    console.log("PETICION POST DE SUB FAMILIA");
    console.log("RECIBIENDO", req.body);
    try {
        const { conceptoFamilia, estatus, conceptoSubFamilia } = req.body;
        //BUSCAR DATOS DEL SELECCIONADO
        const familia = await registroFamilia.findOne({ id: conceptoFamilia });
        if (!familia) {
            return res.status(404).json({ message: "Datos no encontrados" });
        }

        //CREAR REGISTRO EN LA COLECCION DE SUB FAMILIA
        const id = await getNextSequence('subFamiliaId');
        const nuevoRegistro = new registroSubFamilia({
            id,
            conceptoFamilia: familia.concepto,
            estatus,
            conceptoSubFamilia
        });

        await nuevoRegistro.save()
        res.json({ message: 'Concepto guardado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar" });
    }
});

/*
app.get('/traerFamilia', async (req, res) => {
    try {
        const conceptFamilia = await registroFamilia.find();
        res.json(conceptFamilia);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los datos" });
    }
})*/

//ESQUEMA Y MODELO DE CONCEPTO ACTIVOS=============================================
//REGISTRO conceptoActivos.html
const conceptoFamilia = new mongosee.Schema({
    id: { type: Number, unique: true },//AUTOINCREMENTO
    estatus: String,
    conceptoFamilia: String,
    conceptoSubFamilia: String,
    listaMedida: String,
    conceptoActivos: String
});
const registroConceptoActivos = mongosee.model('conceptoActivos', conceptoFamilia, 'conceptoActivos');

app.post('/conceptoActivos', async (req, res) => {
    console.log("PETICION POST DE CONCEPTO ACTIVOS");
    console.log("RECIBIENDO", req.body);

    try {
        const { estatus, conceptoFamilia, conceptoSubFamilia, listaMedida, conceptoActivos } = req.body;
        

        //CREAR REGISTRO EN LA COLECCION DE CONCEPTO ACTIVOS
        const id = await getNextSequence('conceptoActivoId');
        const nuevoRegistro = new registroConceptoActivos({
            id,
            estatus,
            conceptoFamilia,
            conceptoSubFamilia,
            listaMedida,
            conceptoActivos
        });

        await nuevoRegistro.save()
        res.json({ message: 'Concepto guardado correctamente' });
        console.log("GUARDANDO", nuevoRegistro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar" });
    }
});

//CONSULTA DE LISTA DE MODELO SUB FAMILIA
app.get('/traerSubFamilia', async (req, res) => {
    try {
        const conceptoSubFamilia = await registroSubFamilia.find();
        res.json(conceptoSubFamilia);
    } catch (error) {
        res.status(500).json({ message: "Error a obtener los datos" });
    }
})

//BUSCAR SUB FAMILIA POR MEDIO DE SELECCION FAMILIA
//conceptoActivos.html 
app.get('/buscarSubFamilia', async (req,res) => {
    console.log("Se escribio: ", req.query);
    try{
        const { buscar } = req.query;
        console.log("VALOR RECIBIDO", buscar);
        
        let query = {};
        if(buscar){
            query = {
                $or: [
                    { conceptoFamilia: { $regex: buscar, $options: 'i' } }
                ]
            };
        }
        const subFamilia = await registroSubFamilia.find(query).limit(20);
        res.json(subFamilia);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al buscar subfamilias"});
    }
});


//ESQUEMA Y MODELO DE CONCEPTO GASTO=============================================
//REGISTRO conceptoGasto.html
const conceptoGasto = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO
    estatus: String,
    conceptoGasto: String
});
const registroConceptoGasto = mongosee.model('conceptoGasto', conceptoGasto, 'conceptoGasto');

app.post('/conceptoGasto', async (req, res) => {
    console.log("PETICION POST CONCEPTO GASTO");
    console.log("RECIBIENDO", req.body);

    try {
        const { estatus, conceptoGasto } = req.body;

        const id = await getNextSequence('conceptoGastoId');
        const nuevoRegistro = new registroConceptoGasto({
            id,
            estatus,
            conceptoGasto
        });

        await nuevoRegistro.save()
        res.json({ message: 'Concepto guarado correctamente' });
    } catch (error) {
        res.status(500).json({ meesage: "Error al guardar" });
    }
});

//ESQUEMA Y MODELO DE PERSONAL=============================================
//REGISTRO personal.html
const personal = new mongosee.Schema({
    id: { type: Number, unique: true },
    estatusPersonal: String,
    nombre: String,
    aPaterno: String,
    aMaterno: String,
    fechaNacimiento: Date
});
const registroPersonal = mongosee.model('personal', personal, 'personal');

app.post('/personal', async (req, res) => {
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

app.get('/traerPersonal', async (req, res) => {
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

//=================================================================================================================
//==========================CONCEPTO COMPRA================================================================
//=================================================================================================================
//ESQUEMA Y MODELO DE CONCEPTO COMPRAS
const conceptoCompras = new mongosee.Schema({
    id: { type:Number, unique: true },
    estatusConceptoCompra: String,
    conceptoCompra: String
});
const registroConceptoCompra = mongosee.model('conceptoCompra', conceptoCompras, 'conceptoCompra');

app.post('/conceptoCompra', async (req,res)=> {
    console.log('PETICION POST');
    console.log("RECIBIENDO", req.body);

    try{
        const { estatusConceptoCompra, conceptoCompra} = req.body;

        //CREAR REGISTRO EN LA COLECCION
        const id = await getNextSequence('conceptoCompraId');
        const nuevoRegistro = new registroConceptoCompra({
            id,
            estatusConceptoCompra,
            conceptoCompra
        });

        await nuevoRegistro.save();
        res.json({ message: 'Concepto guardado correctamente'});
        console.log('Se ha guardado: ', nuevoRegistro);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error al guardar"});
    }
});


//=================================================================================================================
//=================================================================================================================
//MODELO Y ESQUEMA PARA GUARDAR SOLICITUD COMPRA=============================================
const solicitudCompra = new mongosee.Schema({
    id: { type: Number, unique: true },
    fechaCreacion: {type: Date, default: Date.now},
    estatusCompras: {type: String, default: "Pendiente"},
    clasificacionCompras: String,
    descripcionConceptoCompra: String,
    personal: [
        {
            nombre: String,
            aPaterno: String,
            aMaterno: String,
            comentario: String
        }
        
    ],
    conceptoCompras: [
        {
            conceptoCompra: String,
            comentario: String
        }
    ],
    proveedores: [
        {
            razonSocial: String,
            costo: String
        }
    ]
});
const registroSolicitudCompra = mongosee.model('solicitudCompra', solicitudCompra, 'solicitudCompra');

//BUSCAR EN FAMILIA ACTIVOS
app.get('/traerConceptoCompra', async (req, res) => {
    try{
        const { buscar } = req.query;
        console.log("VALOR RECIBIDO DE FAMILIA", buscar);

        let query = {};
        if(buscar) {
            query = {
                $or: [
                    { conceptoCompra: { $regex: buscar, $options: 'i' } }
                ]
            };
        }
        const conceptoCompras = await registroConceptoCompra.find(query).limit(20);
        res.json(conceptoCompras);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "ERROR AL BUSCAR EN FAMILIAS ACTIVOS"});
    }
})

app.post('/solicitudCompra', async (req, res) => {
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
//=================================================================================================================
//=================================================================================================================
//=================================================================================================================




//=================================================================================================================
//=================================================================================================================
//======================LISTA DE SOLICITUDES DE COMPRA===============================================================
//=================================================================================================================
//CARGAR LAS SOLICITUDES DE COMPRAS
app.get('/solicitudes', async (req, res) => {
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
app.delete('/solicitudCompra/:id', async (req, res) => {
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
app.get('/solicitudes/:id', async (req, res) => {
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
app.put('/solicitudCompra/:id', async (req,res) => {
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


//=================================================================================================================
//=====================altaProveedor.html=========================================================================
//=====================ALTA DE PROVEEDORES================================================================
const proveedores = new mongosee.Schema({
    id: {type: Number, unique: true },
    estatusProveedor: String,
    nickName: String,
    razonSocial: String,
    rfc: String,
    domicilioFiscal: String,
    ciudad: String,
    cp: String,
    correo: String,
    cuenta: String,
    clabe: String
});
const registroProveedor = mongosee.model('proveedores', proveedores, 'proveedores');

app.post('/altaProveedores', async (req, res) => {
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
app.get('/buscarProveedores', async (req,res) => {
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

app.listen(PORT, () => {
    console.log(`SERVIDOR EN http://localhost:${PORT}`)
})




