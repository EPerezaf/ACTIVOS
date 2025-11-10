const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/modelUser");
const router = express.Router();
const jwt = require("jsonwebtoken");

const SECRET = "mi_clave_secreta";

//REGISTRO (SOLO PARA PRUEBAS)
router.post("/register", async (req,res) => {
    try{
        const { username, password, role } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashed, role });
        await newUser.save();
        res.json({ message: "Usuario registrado correctamente"});
    }catch(error){
        res.status(500).json({ error: error.message});
    }
});

//LOGIN
router.post("/login", async (req,res) => {
    try{
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if(!user) return res.status(404).json({ message: "Usuario no encontrado"});

        const valid = await bcrypt.compare(password, user.password);
        if(!valid) return res.status(400).json({ message: "Contraseña incorrecta"});

        const token = jwt.sign(
            { id: user._id, role: user.role},
            SECRET,
            { expiresIn: "2h"}
        );

        //SI TODO ESTA BIEN 
        res.json({ 
            message: "Inicio de sesion exitoso", 
            role: user.role,
            token
        });
    }catch(error){
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;