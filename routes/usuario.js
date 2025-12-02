// novo router:
const express = require('express');
const router = express.Router();

const {
    cadastrarUsuario,
    listarUsuarios,
    buscarUsuarioPorId,
    atualizarUsuario,
    deletarUsuario,
    loginUsuario, 
} = require('../controllers/usuarioController'); 

router.post('/login', loginUsuario);
router.post('/cadastro', cadastrarUsuario);
router.get('/', listarUsuarios);
router.get('/:id', buscarUsuarioPorId);
router.put('/:id', atualizarUsuario);
router.delete('/:id', deletarUsuario);



module.exports = router;