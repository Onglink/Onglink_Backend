const express = require('express');
const router_denuncia = express.Router();
const {
    cadastrarDenuncia,
    listarDenuncia,
    buscarDenuncia,
    deletarDenuncia,
} = require('../controllers/denunciaController');

router_denuncia.get("/", listarDenuncia);
router_denuncia.get("/:id", buscarDenuncia);
router_denuncia.post("/", cadastrarDenuncia);
router_denuncia.delete("/:id", deletarDenuncia);

export const denunciaRoutes = router_denuncia;