const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/solicitudes", authMiddleware, roleMiddleware(["Administrador", "Gerente General", "Jefe de Activos"]), (req,res) => {
    res.json({ message: "Bienvenido al modulo"});
});

//SOLO ADMINISTRADOR O JEFE DE ACTIVOS
router.get("/modulo-avanzado", authMiddleware,roleMiddleware(["Administrador", "Jefe de Activos"]), (req,res) => {
    res.json({ message: "Bienvenido al modulo avanzado"});
});

module.exports = router;