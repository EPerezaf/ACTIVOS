const e = require('express');
const express = require('express');
const mongosee = require('mongoose');
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

app.listen(PORT, () => {
    console.log(`SERVIDOR EN http://localhost:${PORT}`)
})




