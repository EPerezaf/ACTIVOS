//ESQUEMA Y MODELO DE FAMILIA ACTIVOS=============================================

const mongosee = require('mongoose');

const familiaActivos = new mongosee.Schema({
    id: { type: Number, unique: true }, //AUTOINCREMENTO 
    estatus: String,
    concepto: String
});
module.exports = mongosee.model('familiaActivos', familiaActivos, 'familiaActivos');
