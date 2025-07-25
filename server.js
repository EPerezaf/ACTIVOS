const express = require('express');
const mongosee = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

//CONEXION A MONGO DB
mongosee.connect('mongodb://127.0.0.1:27017/Activos')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexion:', err));

//AGREGAR INCREMENTO DE ID
const CounterSchema = new mongosee.Schema({
    _id: {type: String, required: true}, //EL NOMBRE DEL CONTADOR
    seq: {type: Number, default: 0}
});
const Counter = mongosee.model('IDConcepto', CounterSchema); //CONTADOR DE CONCEPTO DE ACTIVOS
const Cuenta = mongosee.model('ContadorFA', CounterSchema); //CONTADOR DE CONCEPTO FAMILIA ACTIVOS
const subFamiliaContador = mongosee.model('subFamiliaId', CounterSchema); //

//DEFINIR ESQUEMA Y MODELO 
const RegistroSchema = new mongosee.Schema({
    id: {type: Number, unique: true }, //AUTOINCREMENTO ID 
    estatus: String, 
    concepto: String
});
const Registro = mongosee.model('activoConcepto', RegistroSchema);

//MIDDLEAWERS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


//FUNCIONES 
//OBTENER EL ID INCREMENTAL
async function getNextSequence(model, counterName){
    const counter = await Counter.findByIdAndUpdate(
        { _id: counterName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } 
    );
    return counter.seq;
}

//RUTA PARA GUARDAR LOS DATOS DE CONCEPTO DE ACTIVOS
app.post('/guardar', async (req, res) => {
    console.log('PETICION POST CONCEPTO ACTIVO');
    console.log('BODY RECIBIDO: ', req.body);
    const { estatus, concepto } = req.body;
    try{
        const id = await getNextSequence(Counter, 'activoId');
        const nuevo = new Registro({ id, estatus, concepto});
        await nuevo.save();
        res.json({ message: 'Datos agregados correctamente'});
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Error al guardar'})
    }
});

//CONCEPTOFAMILIA
const familiaConceptoSchema = new mongosee.Schema({
    id: {type: Number, unique: true},
    estatus: String,
    descripcion: String
});
const familiaCon = mongosee.model('familiaConcepto',familiaConceptoSchema);

//AUTOINCREMENTO DE CONCEPTO FAMILIA 
app.post('/guardarConceptoFamilia', async (req, res) =>{
    console.log('Peticion POST CONCEPTO FAMILIA');
    console.log('Body recibido: ', req.body);
    const { estatus, descripcion } = req.body;

    try{
        const id = await getNextSequence(Cuenta, 'familiaID');
        console.log('Siguiente ID generado: ', id);
        const nuevoRegistro = new familiaCon({ id, estatus,descripcion});
        await nuevoRegistro.save();
        res.json({ message: 'Datos guardados correctamente' });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar los datos' })
    }
});

const subFamilia = new mongosee.Schema({
    id: {type: Number, unique: true},
    estatus: String,
    concepto: String
});
const conSubFamilia = mongosee.model('subFamilia', subFamilia);

//CONCEPTOSUBFAMILIA
app.post('/guardarSubFamilia', async (req,res) =>{
    console.log('Peticion POST SUB FAMILIA');
    console.log('Recibiendo', req.body);
    const {estatus, concepto} = req.body;
    try{
        const id = await getNextSequence(subFamiliaContador, 'subFamiliaId');
        console.log('Siguiente ID generado:', id);
        const nuevoRegistro = new conSubFamilia({id,estatus,concepto});
        await nuevoRegistro.save();
        res.json({ message: 'Datos guardados correctamente'});
    }catch (error){
        console.error(error);
        res.status(500).json({ message: 'Error al guardar' })
    }
});

//INICIAR SERVIDOR 
app.listen(PORT, () => {
    console.log(`SERVIDOR EN http://localhost:${PORT}`)
})