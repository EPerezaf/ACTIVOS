//=================================================================================================================
//=====================altaProveedor.html=========================================================================
//=====================ALTA DE PROVEEDORES================================================================
const mongosee = require('mongoose');

const proveedores = new mongosee.Schema({
    id: {type: Number, unique: true },
    estatusProveedor: String,
    nickName: String,
    razonSocial: String,
    rfc: String,
    domicilioFiscal: String,
    ciudad: String,
    cp: String,
    correo: String,
    cuenta: String,
    clabe: String
});
module.exports = mongosee.model('proveedores', proveedores, 'proveedores');
