import express from "express";
const router_publicacao = express.Router();
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import {checkRole} from '../middleware/tokenAuth.ts';

import  {
  criarPublicacao,
  buscarPublicacao,
  buscarPublicacaoPorId,
  editarPublicacao,
  excluirPublicacao
} from '../controllers/publicacaoController.ts';

const ROLES_PUBLICADORES = ['admin', 'ong'];

router_publicacao.post('/', checkRole(ROLES_PUBLICADORES), upload.single('image'), criarPublicacao);
router_publicacao.get('/',  buscarPublicacao);
router_publicacao.get('/:id', buscarPublicacaoPorId);
router_publicacao.put('/:id', checkRole(ROLES_PUBLICADORES), editarPublicacao);
router_publicacao.delete('/:id', checkRole(ROLES_PUBLICADORES), excluirPublicacao);

export const publicacaoRoutes = router_publicacao;