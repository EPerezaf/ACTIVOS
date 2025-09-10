const e = require('express');
const express = require('express');
const mongosee = require('mongoose');
const { type } = require('os');
const path = require('path');

const app = express();
const PORT = 3000;

//CONEXION A MONGODB
mongosee.connect('mongodb://127.0.0.1:27017/ActivosForm')
    .then(() => console.log('Conectando a MongoDB'))
    .catch(err => console.error('Error de conexion:', err));

//AGREGAR INCREMENTAL DE ID 
const CounterSchema = new mongosee.Schema({
    _id: {type: String, required: true}, //EL NOMBRE DEL CONTADOR
    seq: { type: Number, default: 0}
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

//ESQUEMA Y MODELO DE FAMILIA ACTIVOS
const familiaActivos = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO 
    estatus: String,
    concepto: String
});
const registroFamilia = mongosee.model('familiaActivos', familiaActivos, 'familiaActivos');

//REGISTRO DE FAMILIA CONCEPTO
app.post('/familiaActivos', async (req,res) => {
    console.log("PETICION POST DE FAMILIA CONCEPTO");
    console.log("RECIBIENDO", req.body);

    const { estatus, concepto } = req.body;
    try{
        const id = await getNextSequence('familiaId');
        console.log('Siguiente ID generado: ', id);
        const nuevo = new registroFamilia({ id, estatus, concepto});
        await nuevo.save();
        res.json({ message: 'Datos agregados correctamente'});
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error al guardar"})
    }
});

//ESQUEMA Y MODELO DE SUB FAMILIA ACTIVOS
const subFamilia = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO
    conceptoFamilia: String,
    estatus: String,
    conceptoSubFamilia: String
});
const registroSubFamilia = mongosee.model('subFamilia', subFamilia, 'subFamilia');

app.post('/subFamilia', async (req,res) =>{
    console.log("PETICION POST DE SUB FAMILIA");
    console.log("RECIBIENDO", req.body);
    try{
        const { conceptoFamilia, estatus, conceptoSubFamilia} = req.body;
        //BUSCAR DATOS DEL SELECCIONADO
        const familia = await registroFamilia.findOne({ id: conceptoFamilia});
        if(!familia){
            return res.status(404).json({ message: "Datos no encontrados"});
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
        res.json({ message: 'Concepto guardado correctamente'});
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error al guardar"});
    }
});

app.get('/traerFamilia', async (req,res) =>{
    try{
        const conceptFamilia = await registroFamilia.find();
        res.json(conceptFamilia);
    }catch(error){
        res.status(500).json({ message: "Error al obtener los datos"});
    }
})

//ESQUEMA Y MODELO DE CONCEPTO ACTIVOS
const conceptoFamilia = new mongosee.Schema({
    id: { type: Number, unique: true },//AUTOINCREMENTO
    estatus: String,
    conceptoFamilia: String,
    conceptoSubFamilia: String,
    conceptoActivos: String
});
const registroConceptoActivos = mongosee.model('conceptoActivos', conceptoFamilia, 'conceptoActivos');

app.post('/conceptoActivos', async (req,res) =>{
    console.log("PETICION POST DE CONCEPTO ACTIVOS");
    console.log("RECIBIENDO", req.body);

    try{
        const { estatus, conceptoFamilia, conceptoSubFamilia, conceptoActivos} = req.body;
        //BUSCAR DATOS SELECCIONADO
        const familia = await registroFamilia.findOne({ id: conceptoFamilia});
        if(!familia){
            return res.status(404).json({ message: "Datos no encontrados"});
        }

        //BUSCAR DATOS SELECIONADO EN SUB FAMILIA 
        const subFamilia = await registroSubFamilia.findOne({ id: conceptoSubFamilia});
        if(!subFamilia){
            return res.status(404).json({ message: "Datos no encontrados"});
        }

        //CREAR REGISTRO EN LA COLECCION DE CONCEPTO ACTIVOS
        const id = await getNextSequence('conceptoActivoId');
        const nuevoRegistro = new registroConceptoActivos({
            id,
            estatus,
            conceptoFamilia: familia.concepto,
            conceptoSubFamilia: subFamilia.conceptoSubFamilia,
            conceptoActivos
        });

        await nuevoRegistro.save()
        res.json({ message: 'Concepto guardado correctamente'});
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error al guardar"});
    }
});

app.get('/traerSubFamilia', async (req,res) => {
    try{
        const conceptoSubFamilia = await registroSubFamilia.find();
        res.json(conceptoSubFamilia);
    }catch(error){
        res.status(500).json({ message: "Error a obtener los datos"});
    }
})
//ESQUEMA Y MODELO DE CONCEPTO GASTO
const conceptoGasto = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO
    estatus: String, 
    conceptoGasto: String
});
const registroConceptoGasto = mongosee.model('conceptoGasto', conceptoGasto, 'conceptoGasto');

app.post('/conceptoGasto', async (req,res) => {
    console.log("PETICION POST CONCEPTO GASTO");
    console.log("RECIBIENDO", req.body);

    try{
        const { estatus, conceptoGasto } = req.body;

        const id = await getNextSequence('conceptoGastoId');
        const nuevoRegistro = new registroConceptoGasto({
            id,
            estatus,
            conceptoGasto
        });

        await nuevoRegistro.save()
        res.json({ message: 'Concepto guarado correctamente'});
    }catch(error){
        res.status(500).json({ meesage: "Error al guardar"});
    }
});

app.listen(PORT, () => {
    console.log(`SERVIDOR EN http://localhost:${PORT}`)
})




