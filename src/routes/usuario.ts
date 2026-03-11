// novo router:
import express from "express";
const router_usuario = express.Router();

import {
    cadastrarUsuario,
    listarUsuarios,
    buscarUsuarioPorId,
    atualizarUsuario,
    deletarUsuario,
    loginUsuario, 
} from '../controllers/usuarioController.ts'; 

router_usuario.post('/login', loginUsuario);
router_usuario.post('/cadastro', cadastrarUsuario);
router_usuario.get('/', listarUsuarios);
router_usuario.get('/:id', buscarUsuarioPorId);
router_usuario.put('/:id', atualizarUsuario);
router_usuario.delete('/:id', deletarUsuario);



export const usuarioRoutes = router_usuario;