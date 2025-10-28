//MODELO DE CONCEPTO ACTIVOS=============================================
//REGISTRO conceptoActivos.html
const mongosee = require('mongoose');

const conceptoFamilia = new mongosee.Schema({
    id: { type: Number, unique: true },//AUTOINCREMENTO
    estatus: String,
    conceptoFamilia: String,
    conceptoSubFamilia: String,
    conceptoActivos: String
});
module.exports = mongosee.model('conceptoActivos', conceptoFamilia, 'conceptoActivos');
