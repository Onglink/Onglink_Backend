const express_parceiro = require('express');
const router_parceiro = express_parceiro.Router();
const { listarParceiros } = require('../controllers/parceiroController');

//const { listarOngs} = require('../controllers/ongController');

router_parceiro.get('/', listarParceiros);
export const parceiroRoutes = router_parceiro;
