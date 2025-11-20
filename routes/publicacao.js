const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {checkRole} = require('../middleware/tokenAuth')

const {
  criarPublicacao,
  buscarPublicacao,
  buscarPublicacaoPorId,
  editarPublicacao,
  excluirPublicacao
} = require('../controllers/publicacaoController');

const ROLES_PUBLICADORES = ['admin', 'ong'];

router.post('/', checkRole(ROLES_PUBLICADORES), upload.single('image'),criarPublicacao);
router.get('/',  buscarPublicacao);
router.get('/:id', buscarPublicacaoPorId);
router.put('/:id', checkRole(ROLES_PUBLICADORES), editarPublicacao);
router.delete('/:id', checkRole(ROLES_PUBLICADORES), excluirPublicacao);

module.exports = router;