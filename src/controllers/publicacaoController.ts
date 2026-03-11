import type {Request, Response} from 'express';
import Publicacao from '../models/publicacaoModel.ts'; 
import Usuario from '../models/usuarioModel.ts';
import Ong from '../models/ongModel.ts';// <--- ESSENCIAL: Importar para o populate funcionar


const criarPublicacao = async (req: Request, res: Response) => {
    const imagem = req.file;
    try {
        const { titulo, descricao, criadoPor } = req.body;
        let imagensArray = [];
        
        if (imagem) {
            const b64 = Buffer.from(imagem.buffer).toString('base64');
            const dataURI = `data:${imagem.mimetype};base64,${b64}`;
            imagensArray.push(dataURI);
        }

        const novaPublicacao = new Publicacao({
            titulo,       
            descricao,    
            criadoPor, // ID do Usuário
            imagem: imagensArray 
        });

        const publicacaoSalva = await novaPublicacao.save();

        // RECARREGA A PUBLICACAO COM OS DADOS DA ONG
        const publicacaoPopulada = await Publicacao.findById(publicacaoSalva._id)
            .populate({
                path: 'criadoPor',
                model: 'Usuario',
                select: 'nome email assignedTo', 
                populate: {
                    path: 'assignedTo',
                    model: 'Ong', // Garante que busque na coleção de ONGs
                    select: 'nome logo' // Traz Nome e Logo da ONG
                }
            });

        res.status(201).json(publicacaoPopulada);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao criar publicação";
        console.error("Erro ao criar post:", error);
        res.status(400).json({ message: 'Erro ao criar a publicação.', error: errorMessage });
    }
};

const buscarPublicacao = async (req: Request, res: Response) => {
    try {
        const publicacoes = await Publicacao
            .find({})
            .populate({
                path: 'criadoPor',
                model: 'Usuario',
                select: 'nome email assignedTo',
                populate: {
                    path: 'assignedTo',
                    model: 'Ong',
                    select: 'nome logo'
                }
            })
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json(publicacoes);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao buscar publicações";
        res.status(500).json({ message: 'Erro ao buscar publicações.', error: errorMessage });
    }
};

const buscarPublicacaoPorId = async (req: Request, res: Response) => {
    try {
        const publicacao = await Publicacao.findById(req.params.id)
            .populate({
                path: 'criadoPor',
                populate: { path: 'assignedTo', select: 'nome logo' }
            });
        if (!publicacao) return res.status(404).json({ message: 'Publicação não encontrada.' });
        res.status(200).json(publicacao);
    } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao buscar publicação por ID";
        res.status(500).json({ error: errorMessage });
    }
};

const editarPublicacao = async (req: Request, res: Response) => {
    try {
        const publicacaoAtualizada = await Publicacao.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        ).populate('criadoPor'); // Simplificado, pode ajustar se precisar do logo ao editar
        res.status(200).json(publicacaoAtualizada);
    } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao editar publicação";
        res.status(400).json({ error: errorMessage });
    }
};

const excluirPublicacao = async (req: Request, res: Response) => {
    try {
        const publicacaoExcluida = await Publicacao.findByIdAndDelete(req.params.id);
        if (!publicacaoExcluida) return res.status(404).json({ message: 'Não encontrada.' });
        res.status(204).send();
    } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao excluir publicação";
        res.status(500).json({ error: errorMessage });
    }
};

export {
    criarPublicacao,
    buscarPublicacao,
    buscarPublicacaoPorId,
    editarPublicacao,
    excluirPublicacao,
};