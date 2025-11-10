const jwt = require("jsonwebtoken");
const SECRET = "mi_clave_secreta";

module.exports = (req,res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader)
        return res.status(401).json({ message: "Token no proporcionado"});

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    }catch(error){
        res.status(401).json({ message: "Token no valido o expirado"});
    }
};