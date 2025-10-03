//=================================================================================================================
//==========================CONCEPTO COMPRA================================================================
//=================================================================================================================
//ESQUEMA Y MODELO DE CONCEPTO COMPRAS
const mongosee = require('mongoose');

const conceptoCompras = new mongosee.Schema({
    id: { type:Number, unique: true },
    estatusConceptoCompra: String,
    conceptoCompra: String
});
module.exports = mongosee.model('conceptoCompra', conceptoCompras, 'conceptoCompra');
