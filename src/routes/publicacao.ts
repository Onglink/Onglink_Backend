const express = require('express');
const router_publicacao = express.Router();
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

router_publicacao.post('/', checkRole(ROLES_PUBLICADORES), upload.single('image'), criarPublicacao);
router_publicacao.get('/',  buscarPublicacao);
router_publicacao.get('/:id', buscarPublicacaoPorId);
router_publicacao.put('/:id', checkRole(ROLES_PUBLICADORES), editarPublicacao);
router_publicacao.delete('/:id', checkRole(ROLES_PUBLICADORES), excluirPublicacao);

export const publicacaoRoutes = router_publicacao;