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
    _id: {type: String }, //EL NOMBRE DEL CONTADOR
    seq: {type: Number, default: 0}
});
const Counter = mongosee.model('Counter', CounterSchema);

//DEFINIR ESQUEMA Y MODELO 
const RegistroSchema = new mongosee.Schema({
    id: {type: Number, unique: true }, //AUTOINCREMENTO ID 
    estatus: String, 
    concepto: String
});
const Registro = mongosee.model('Registro', RegistroSchema);

//MIDDLEAWERS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//RUTA PARA GUARDAR LOS DATOS
app.post('/guardar', async (req, res) => {
    console.log('LLego una peticion POST');
    console.log('Body recibido: ', req.body);

    const { estatus, concepto } = req.body;

    try {
        //OBTENER EL SIGUIENTE NUMERO DE SECUENCIA
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'registroId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        console.log('Siguiente ID generado:', counter.seq);
        const nuevoRegistro = new Registro({
            id: counter.seq,
            estatus,
            concepto
        });

        await nuevoRegistro.save();
        res.json({ message: 'Datos guardados correctamente' });
    }catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error al guardar los datos' })
    }
});

//CONCEPTOFAMILIA
const CuentaSchema = new mongosee.Schema({
    _id: {type: String }, //
    seq: {type: Number, default: 0}
});
const Cuenta = mongosee.model('ContadorFA', CuentaSchema);

//CONCEPTOFAMILIA
const familiaConceptoSchema = new mongosee.Schema({
    id: {type: Number, unique: true},
    estatus: String,
    descripcion: String
});
const familiaCon = mongosee.model('familiaConcepto',familiaConceptoSchema);

//AUTOINCREMENTO DE CONCEPTO
app.post('/guardarConceptoFamilia', async (req, res) =>{
    console.log('Peticion post');
    console.log('Body recibido: ', req.body);
    const { estatus, descripcion } = req.body;

    try{
        //OBETENER EL SIGUIENTE NUMERO DE SECUENCIA
        const counter = await Cuenta.findByIdAndUpdate(
            { _id: 'registroId'},
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        console.log('Siguiente ID generado: ',counter.seq);
        const nuevoRegistro = new familiaCon({
            id: counter.seq,
            estatus,
            descripcion
        });
        await nuevoRegistro.save();
        res.json({ message: 'Datos guardados correctamente' });
    }catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error al guardar los datos' })
    }
});

const contadorSubFamiliaSchema = new mongosee.Schema({
    _id: {type: String},
    seq: {type: Number, default: 0}
});
const contadorSF = mongosee.model('ContadorSF', contadorSubFamiliaSchema);

const subFamiliaSchema = new mongosee.Schema({
    id: {type: Number, unique: true},
    estatus: String,
    descripcion: String
});


//CONCEPTOSUBFAMILIA
app.post('/guardarSubFamilia', async (req,res) =>{
    console.log('Peticion POST');
    console.log('Recibiendo');
    const {estatus, concepto} = req.body;
    try{
        //OBTENER EL NUMERO DE SECUENCIA
        const counter =await contadorSF.findByIdAndUpdate(
            { _id: 'registroId'},
            { $inc: {seq: 1}},
            { new: true, upsert: true }
        );
        console.log('Siguiente ID generado:', counter.seq);
        const nuevoRegistro = new subFamiliaSchema({
            id: counter.seq,
            estatus,
            descripcion
        });
        await nuevoRegistro.save();
        res.json({ message: 'Datos guardados correctamente'});
    }catch (err){
        console.log(err),
        res.status(500).json('Error al guardar')
    }

});

//INICIAR SERVIDOR 
app.listen(PORT, () => {
    console.log(`SERVIDOR EN http://localhost:${PORT}`)
})