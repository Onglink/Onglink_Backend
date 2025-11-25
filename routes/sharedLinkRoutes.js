// routes/shareLink.js
const express = require('express');
const router = express.Router();
const { generateShareLink } = require('../controllers/shareLinkController');

// Define a rota POST /share-link
router.post('/share-link', generateShareLink);

module.exports = router;