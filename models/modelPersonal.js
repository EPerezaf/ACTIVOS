//MODELO DE PERSONAL=============================================
//REGISTRO personal.html
const mongosee = require('mongoose');

const personal = new mongosee.Schema({
    id: { type: Number, unique: true },
    estatusPersonal: String,
    nombre: String,
    aPaterno: String,
    aMaterno: String,
    fechaNacimiento: Date
});
module.exports = mongosee.model('personal', personal, 'personal');
