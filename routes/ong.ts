const express = require('express');
const router = express.Router();
const {
  cadastrarOng: cadastrarOng,
  listarOngs,
  atualizarOng,
  deletarOng,
  buscarOngPorId,
  atualizarStatusOng
} = require('../controllers/ongController');

router.post('/', cadastrarOng);
router.get('/', listarOngs);
router.get('/:id', buscarOngPorId);
router.put('/:id', atualizarOng);
router.delete('/:id', deletarOng);
router.patch('/:id/status', atualizarStatusOng);
module.exports = router;