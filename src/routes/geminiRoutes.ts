import { geminiController } from "../controllers/geminiController";
import express, { Router } from 'express';

const router_gemini: Router = express.Router();

// Alterado para POST para receber o prompt no body
router_gemini.post('/analisar', geminiController);

export const geminiRoutes = router_gemini;