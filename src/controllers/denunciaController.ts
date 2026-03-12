import type { Request, Response } from "express";
import Publicacao from "../models/publicacaoModel.ts";
import Denuncia from "../models/denunciaModel.ts";

const cadastrarDenuncia = async (req: Request, res: Response) => {
    try {
        const novaDenuncia = new Denuncia(req.body);
        await novaDenuncia.save();
        res.status(201).json({
            message: "Denuncia efetuada com sucesso!",
            id: novaDenuncia._id,
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        res.status(400).json({
            error: "Erro ao efetuar denúncia, dados inválidos ou faltando",
            details: errorMessage || err,
        });
    }
};

const listarDenuncia = async (req: Request, res: Response) => {
    try {
        const lista = await Denuncia.find({});
        res.status(200).json(lista);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao listar Denúncias.";
        res.status(500).json({
            error: "Erro ao listar Denúncias.",
            details: errorMessage || err,
        });
    }
};
const buscarDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const denuncia = await Denuncia.findById(id).populate("assignedTo").exec();
        if (!denuncia) {
            return res.status(404).json({ error: "Denuncia não encontrada" });
        }

        res.status(200).json(denuncia);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message :"Erro ao buscar a Denúncia solicitada.";
        res.status(500).json({
            error:
                "Erro ao buscar a Denúncia solicitada, verifique se o Id é válido.",
            details: errorMessage || err,
        });
    }
};

const deletarDenuncia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const resultado = await Denuncia.findByIdAndDelete(id);
        if (!resultado) {
            return res
                .status(404)
                .json({ error: "Denuncia não encontrada, nada foi deletado." });
        }
        res.status(200).json({
            message: "Denuncia excluida com sucesso.",
            deleted: true,
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao deletar a denúncia.";
        res.status(500).json({
            error: "Erro ao deletar a denúncia.",
            details: errorMessage || err,
        });
    }
};

export {
    cadastrarDenuncia,
    listarDenuncia,
    buscarDenuncia,
    deletarDenuncia,
};


