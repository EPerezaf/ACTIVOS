const mongosee = require('mongoose');

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

module.exports = {getNextSequence};