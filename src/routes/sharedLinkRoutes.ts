// routes/shareLink.js
import express from 'express';
export const router = express.Router();
import generateShareLink from '../controllers/sharedLinkControllers';

// Define a rota POST /share-link
router.post('/share-link', generateShareLink);