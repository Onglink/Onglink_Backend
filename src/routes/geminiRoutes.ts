import { geminiController } from "../controllers/geminiController.js";
import express, { Router } from 'express';

const router_gemini: Router = express.Router();

router_gemini.post('/', geminiController)
export const geminiRoutes = router_gemini;