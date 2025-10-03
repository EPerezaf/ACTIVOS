//ESQUEMA Y MODELO DE SUB FAMILIA ACTIVOS=============================================
//REGISTRO conceptoSubFamilia.html
const mongosee = require('mongoose');

const subFamilia = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO
    conceptoFamilia: String,
    estatus: String,
    conceptoSubFamilia: String
});
module.exports = mongosee.model('subFamilia', subFamilia, 'subFamilia');
