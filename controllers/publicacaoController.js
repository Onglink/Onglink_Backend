// const Ong = require('../models/ongModel');
// const Usuario = require('../models/usuarioModel');
// const Publicacao = require('../models/publicacaoModel');

// const criarPublicacao = async (req, res) => {
//     try {
//         const novaPublicacao = new Publicacao(req.body);
//         const publicacaoSalva = await novaPublicacao.save();

//         res.status(201).json({message:"Publicação efetuada com sucesso",
//             id:publicacaoSalva._id});
//     } catch (error) {
//         res.status(400).json({
//             message: 'Erro ao criar a publicação.',
//             error: error.message
//         });
//     }
// };


// const buscarPublicacao = async (req, res) => {
//     try {
//         const publicacoes = await Publicacao
//             .find({})
//             .populate('criadoPor', 'nome email')
//             .sort({ createdAt: -1 })// ordenar das mais novas para as mais antigas
//             .exec();

//         res.status(200).json(publicacoes);
//     } catch (error) {
//         res.status(500).json({
//             message: 'Erro ao buscar publicações.',
//             error: error.message
//         });
//     }
// };


// const buscarPublicacaoPorId = async (req, res) => {
//     try {
//         const publicacao = await Publicacao
//             .findById(req.params.id)
//             .populate('criadoPor', 'nome email');

//         if (!publicacao) {
//             return res.status(404).json({ message: 'Publicação não encontrada.' });
//         }

//         res.status(200).json(publicacao);
//     } catch (error) {
//         res.status(500).json({
//             message: 'Erro ao buscar a publicação.',
//             error: error.message
//         });
//     }
// };


// const editarPublicacao = async (req, res) => {
//     try {
//         const publicacaoAtualizada = await Publicacao.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, runValidators: true }
//         ).populate('criadoPor', 'nome email');

//         if (!publicacaoAtualizada) {
//             return res.status(404).json({ message: 'Publicação não encontrada para edição.' });
//         }

//         res.status(200).json(publicacaoAtualizada);
//     } catch (error) {

//         res.status(400).json({
//             message: 'Erro ao editar a publicação.',
//             error: error.message
//         });
//     }
// };


// const excluirPublicacao = async (req, res) => {
//     try {
//         const publicacaoExcluida = await Publicacao.findByIdAndDelete(req.params.id);

//         if (!publicacaoExcluida) {
//             return res.status(404).json({ message: 'Publicação não encontrada para exclusão.' });
//         }


//         res.status(204).send();

//     } catch (error) {
//         res.status(500).json({
//             message: 'Erro ao excluir a publicação.',
//             error: error.message
//         });
//     }
// };



// module.exports = {
//     criarPublicacao,
//     buscarPublicacao,
//     buscarPublicacaoPorId,
//     editarPublicacao,
//     excluirPublicacao,

// };

const Publicacao = require('../models/publicacaoModel');
const Usuario = require('../models/usuarioModel');
const Ong = require('../models/ongModel'); // <--- ESSENCIAL: Importar para o populate funcionar

const criarPublicacao = async (req, res) => {
    try {
        const { titulo, descricao, criadoPor } = req.body;
        let imagensArray = [];
        
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
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
        console.error("Erro ao criar post:", error);
        res.status(400).json({ message: 'Erro ao criar a publicação.', error: error.message });
    }
};

const buscarPublicacao = async (req, res) => {
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
        res.status(500).json({ message: 'Erro ao buscar publicações.', error: error.message });
    }
};

const buscarPublicacaoPorId = async (req, res) => {
    try {
        const publicacao = await Publicacao.findById(req.params.id)
            .populate({
                path: 'criadoPor',
                populate: { path: 'assignedTo', select: 'nome logo' }
            });
        if (!publicacao) return res.status(404).json({ message: 'Publicação não encontrada.' });
        res.status(200).json(publicacao);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editarPublicacao = async (req, res) => {
    try {
        const publicacaoAtualizada = await Publicacao.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        ).populate('criadoPor'); // Simplificado, pode ajustar se precisar do logo ao editar
        res.status(200).json(publicacaoAtualizada);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const excluirPublicacao = async (req, res) => {
    try {
        const publicacaoExcluida = await Publicacao.findByIdAndDelete(req.params.id);
        if (!publicacaoExcluida) return res.status(404).json({ message: 'Não encontrada.' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    criarPublicacao,
    buscarPublicacao,
    buscarPublicacaoPorId,
    editarPublicacao,
    excluirPublicacao,
};