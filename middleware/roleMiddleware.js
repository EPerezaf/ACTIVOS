module.exports = function(rolesPermitidos) {
    return (req,res, next) =>{
        if(!rolesPermitidos.includes(req.user.role)){
            return res.status(403).json({ message: "Acceso denegado"});
        }
        next();
    };
};