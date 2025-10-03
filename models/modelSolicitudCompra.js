//=================================================================================================================
//=================================================================================================================
//MODELO PARA GUARDAR SOLICITUD COMPRA=============================================
const mongosee = require('mongoose');

const solicitudCompra = new mongosee.Schema({
    id: { type: Number, unique: true },
    fechaCreacion: {type: Date, default: Date.now},
    estatusCompras: {type: String, default: "Pendiente"},
    clasificacionCompras: String,
    descripcionConceptoCompra: String,
    personal: [
        {
            nombre: String,
            aPaterno: String,
            aMaterno: String,
            comentario: String
        }
        
    ],
    conceptoCompras: [
        {
            conceptoCompra: String,
            comentario: String
        }
    ],
    proveedores: [
        {
            razonSocial: String,
            costo: String
        }
    ]
});
module.exports = mongosee.model('solicitudCompra', solicitudCompra, 'solicitudCompra');
