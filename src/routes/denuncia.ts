//const express = require('express');
//const router = express.Router();
const {
    cadastrarDenuncia,
    listarDenuncia,
    buscarDenuncia,
    deletarDenuncia,
} = require('../controllers/denunciaController');

router.get("/", listarDenuncia);
router.get("/:id", buscarDenuncia);
router.post("/", cadastrarDenuncia);
router.delete("/:id", deletarDenuncia);

module.exports = router;