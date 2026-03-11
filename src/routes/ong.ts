const express = require('express');
const router_ong = express.Router();
const {
  cadastrarOng: cadastrarOng,
  listarOngs,
  atualizarOng,
  deletarOng,
  buscarOngPorId,
  atualizarStatusOng
} = require('../controllers/ongController');

router_ong.post('/', cadastrarOng);
router_ong.get('/', listarOngs);
router_ong.get('/:id', buscarOngPorId);
router_ong.put('/:id', atualizarOng);
router_ong.delete('/:id', deletarOng);
router_ong.patch('/:id/status', atualizarStatusOng);
export const ongRoutes = router_ong;