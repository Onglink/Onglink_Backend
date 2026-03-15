import express, {Router} from "express";
import {listarParceiros} from "../controllers/parceiroController.ts";
const router_parceiro: Router = express.Router();

//const { listarOngs} = require('../controllers/ongController');

router_parceiro.get('/', listarParceiros);
export const parceiroRoutes = router_parceiro;
