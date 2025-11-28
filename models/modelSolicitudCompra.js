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
            proveedorSeleccionado: {  // AGREGAR ESTE CAMPO
                idProveedor: String,
                razonSocial: String,
                nickname: String,
                sc_monto: Number
            }
        }
    ],
    proveedores: [
        {
            razonSocial: String,
            nickname: String,
            sc_monto: Number
        }
    ],

    //NUEVOS CAMPOS PARA AUTORIZACION 
    fechaAutorizacion: { type: Date},
    autorizadoPor: {
        userId: { type: String},
        role: {type: String},
        username: { type: String}
    },

    //CAMPO ADICIONAL PARA TRACKING DE MODIFICACIONES
    ultimaModificacion: { type: Date, default: Date.now},
    modificadoPor: {
        userId: { type: String},
        role: { type: String},
        username: { type: String}
    }
});

//MIDDLEWARE PARA ACTUALIZAR LA FECHA DE MODIFIACION ANTES DE GUARDAR
solicitudCompra.pre('save', function(next){
    this.ultimaModificacion = Date.now();
    next();
});
module.exports = mongosee.model('solicitudCompra', solicitudCompra, 'solicitudCompra');
