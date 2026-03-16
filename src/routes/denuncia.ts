import express from 'express';
const router_denuncia = express.Router();
import {
    cadastrarDenuncia,
    listarDenuncia,
    buscarDenuncia,
    deletarDenuncia,
} from '../controllers/denunciaController';

router_denuncia.get("/", listarDenuncia);
router_denuncia.get("/:id", buscarDenuncia);
router_denuncia.post("/", cadastrarDenuncia);
router_denuncia.delete("/:id", deletarDenuncia);

export const denunciaRoutes = router_denuncia;