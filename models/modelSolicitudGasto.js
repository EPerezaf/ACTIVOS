//MODELO PARA GUARDAR SOLICITUD GASTO
const mongoose = require('mongoose');

const solicitudGastoSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    fechaCreacion: { type: Date, default: Date.now},
    estatusCompras: { 
        type: String, 
        enum: ['Pendiente', 'Proceso', 'Autorizada', 'Cancelada', 'Rechazada'],
        default: "Pendiente"
    },
    clasificacionGasto:{
        type: String,
        enum: ['Urgente', 'Importante', 'Normal'],
        required: true,
    },
    descripcionGasto: String,
    tipoGasto: {
        type: String,
        enum: ['Preventivo', 'Correctivo'] // CORREGIDO: 'Prventivo' -> 'Preventivo'
    },
    lectura: String,
    montoTotal: {
        type: Number,
        min: 0,
        default: 0
    },
    // ESTRUCTURA ACTUALIZADA - PROVEEDORES DENTRO DE CADA ACTIVO
    activos: [
        {
            idActivo: { type: Number, required: true },
            conceptoActivo: { type: String, required: true },
            familia: String,
            subFamilia: String,
            nomenclatura: String,
            numSerie: String,
            conceptoGasto: { type: String, required: true }, // MOVIDO DENTRO DE ACTIVO
            proveedores: [ // MOVIDO DENTRO DE ACTIVO
                {
                    idProveedor: { type: Number, required: true },
                    razonSocial: String,
                    nickName: String,
                    monto: {
                        type: Number,
                        required: true,
                        min: 0
                    },
                    seleccionado: { type: Boolean, default: false}
                }
            ],
            // Agregar este campo al nivel del activo
            proveedorSeleccionado: {
                idProveedor: { type: Number },
                razonSocial: String,
                nickName: String,
                monto: { type: Number }
            }
        }
    ],
    montoTotal: {
    type: Number,
    min: 0,
    default: 0
},
    // ELIMINAR estos arrays separados ya que ahora están dentro de cada activo
    // conceptoGasto: [
    //     {
    //         conceptoGasto: String,
    //     }
    // ],
    // proveedores: [
    //     {
    //         idProveedor: { type: Number, required: true },
    //         razonSocial: String,
    //         nickName: String,
    //         monto: {
    //             type: Number,
    //             required: true,
    //             min: 0
    //         },
    //         seleccionado: { type: Boolean, default: false}
    //     }
    // ],
    fechaAutorizacion: { type: Date },
    autorizadoPor: {
        userId: { type: String},
        role: { type: String },
        username: { type: String},
    },
    motivoRechazo: String,
    fechaCompletacion: Date,
    completadoPor: {
        userId: String,
        role: String,
        username: String
    },
    ultimaModificacion: { type: Date, default: Date.now},
    modificadoPor: {
        userId: { type: String},
        role: { type: String},
        username: { type: String}
    },
    evidencias: [String]
});

solicitudGastoSchema.pre('save', function(next){
    this.ultimaModificacion = Date.now();
    next();
});

module.exports = mongoose.model('SolicitudGasto', solicitudGastoSchema, 'solicitudGasto');