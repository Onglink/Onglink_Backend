import { geminiController } from "../controllers/geminiController";
import express, { Router } from 'express';

const router_gemini: Router = express.Router();

router_gemini.get('/', geminiController)
export const geminiRoutes = router_gemini;