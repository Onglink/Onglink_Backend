const express = require('express');
const router = express.Router();
const { listarParceiros } = require('../controllers/parceiroController');

//const { listarOngs} = require('../controllers/ongController');

router.get('/', listarParceiros);
module.exports = router;
