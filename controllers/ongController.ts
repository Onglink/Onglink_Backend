import { Request, Response } from 'express';
const Ong = require('../models/ongModel');
const Usuario = require('../models/usuarioModel');


const cadastrarOng = async (req: Request, res: Response) => {
    try {

        const novaOng = new Ong(req.body);
        const ongSalva = await novaOng.save();

       const idUsuarioDono = req.body.assignedTo && req.body.assignedTo[0];

        if (idUsuarioDono) {
            // Atualiza o documento do USUÁRIO para ele saber que agora possui esta ONG
            await Usuario.findByIdAndUpdate(idUsuarioDono, {
                assignedTo: ongSalva._id, 
                // status: 'em_analise' // (Opcional) Atualiza o status do usuário também se quiser.
            });
        }

        res.status(201).json({
            message: 'ONG cadastrada com sucesso! Aguardando aprovação.',
            id: ongSalva._id
        });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message :"Erro desconhecido";
        console.error("Erro ao cadastrar ONG:", err);
        res.status(400).json({
            error: 'Erro ao cadastrar ONG.',
            details: errorMessage || err
        });
    }
};



const listarOngs = async (req: Request, res: Response) => {
    try {

        const lista = await Ong.find({});

        res.status(200).json(lista);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao listar ONGs";
        res.status(500).json({
            error: 'Erro ao listar ONGs.',
            details: errorMessage || err
        });
    }
};


const buscarOngPorId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const ong = await Ong.findById(id)
            .populate('assignedTo', 'nome email') // Exibe nome e email dos usuários
            

        if (!ong) {
            return res.status(404).json({ error: 'ONG não encontrada.' });
        }

        res.status(200).json(ong);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message :"Erro ao buscar ONG pelo ID.";
        res.status(500).json({
            error: 'Erro ao buscar ONG. Verifique se o ID é válido.',
            details: errorMessage || err
        });
    }
};


// --- UPDATE (Dados Gerais) ---
const atualizarOng = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Segurança: Remove situacaoCadastral do body para evitar auto-aprovação via rota comum
        if (req.body.situacaoCadastral) {
            delete req.body.situacaoCadastral;
        }

        const resultado = await Ong.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!resultado) return res.status(404).json({ error: 'ONG não encontrada.' });

        res.status(200).json({ message: 'ONG atualizada!', ong: resultado });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar ONG.";
        res.status(400).json({ error: 'Erro ao atualizar ONG.', details: errorMessage || err });
    }
};
// --- UPDATE (Apenas Status - Uso Administrativo) ---
const atualizarStatusOng = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { situacaoCadastral } = req.body;

        const resultado = await Ong.findByIdAndUpdate(
            id,
            { situacaoCadastral },
            { new: true, runValidators: true }
        );

        if (!resultado) return res.status(404).json({ error: 'ONG não encontrada.' });

        res.status(200).json({ message: 'Status atualizado!', ong: resultado });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar status da ONG.";
        res.status(400).json({ error: 'Erro ao atualizar status.', details: errorMessage || err });
    }
};

const deletarOng = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;


        const resultado = await Ong.findByIdAndDelete(id);

        if (!resultado) {
            // Se o resultado for null, significa que não havia ONG com esse ID.
            return res.status(404).json({ error: 'ONG não encontrada para deletar.' });
        }

        res.status(200).json({
            message: 'ONG deletada com sucesso!',
            deleted: true
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao deletar ONG.";
        res.status(500).json({
            error: 'Erro ao deletar ONG.',
            details: errorMessage || err
        });
    }
};

module.exports = {
    cadastrarOng,
    listarOngs,
    atualizarOng,
    deletarOng,
    buscarOngPorId,
    atualizarStatusOng
};