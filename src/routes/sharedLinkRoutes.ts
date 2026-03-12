// routes/shareLink.js
import express from 'express';
export const router = express.Router();
const { generateShareLink } = require('../controllers/shareLinkController');

// Define a rota POST /share-link
router.post('/share-link', generateShareLink);