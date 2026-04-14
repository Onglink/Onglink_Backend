import express from "express";
const router_ong = express.Router();
import {
  cadastrarOng,
  listarOngs,
  atualizarOng,
  deletarOng,
  buscarOngPorId,
  atualizarStatusOng
} from '../controllers/ongController.js';

router_ong.post('/', cadastrarOng);
router_ong.get('/', listarOngs);
router_ong.get('/:id', buscarOngPorId);
router_ong.put('/:id', atualizarOng);
router_ong.delete('/:id', deletarOng);
router_ong.patch('/:id/status', atualizarStatusOng);
export const ongRoutes = router_ong;