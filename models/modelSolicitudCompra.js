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
    sc_seleccionCompra: String,

    personal: [
        {
            nombre: String,
            aPaterno: String,
            aMaterno: String,
        }
        
    ],
    conceptoActivo: [
        {
            sc_cca_familia: String,
            sc_cca_subFamilia: String,
            sc_cca_descripcion: String,
        }
    ],
    proveedores: [
        {
            razonSocial: String,
            nickname: String,
            sc_monto: Number
        }
    ]
});
module.exports = mongosee.model('solicitudCompra', solicitudCompra, 'solicitudCompra');
