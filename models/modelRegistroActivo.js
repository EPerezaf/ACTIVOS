const mongoose = require('mongoose');

const registroAct = new mongoose.Schema({
    id: { type: Number, unique: true},
    familia: String,
    subFamilia: String,
    conceptoActivo: String,
    nomenclatura: String,
    marca: String,
    modelo: String,
    descripcionAdicional: String,
    costo: Number,
    numSerie: String,
    idSolicitud: {type: Number},
    estatus:{
        type: String,
        enum: ['Activo', 'Inactivo', 'Baja'],
        default: 'Activo'
    },
    fechaRegistro: { type: Date, default: Date.now},
    responsable: String
});

module.exports = mongoose.model("registroActivo", registroAct, 'registroActivo');