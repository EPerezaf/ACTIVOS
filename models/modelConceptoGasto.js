//MODELO DE CONCEPTO GASTO=============================================
//REGISTRO conceptoGasto.html
const mongosee = require('mongoose');

const conceptoGasto = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO
    estatus: String,
    conceptoGasto: String
});
module.exports = mongosee.model('conceptoGasto', conceptoGasto, 'conceptoGasto');
