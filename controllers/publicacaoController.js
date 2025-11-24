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

const Ong = require('../models/ongModel');
const Usuario = require('../models/usuarioModel');
const Publicacao = require('../models/publicacaoModel');

const criarPublicacao = async (req, res) => {
    try {
        // O Multer popula o req.body com os campos de texto
        const { titulo, descricao, criadoPor } = req.body;
        console.log("Recebendo publicação:", { titulo, criadoPor });

        let imagensArray = [];
        
        // Verifica se o arquivo veio na requisição
        if (req.file) {
            console.log("Arquivo recebido:", req.file.originalname);
            // --- CONVERSÃO PARA BASE64 ---
            // Como a Vercel não salva arquivos, convertemos a imagem em uma String gigante
            // e salvamos diretamente no banco de dados MongoDB.
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            
            imagensArray.push(dataURI);
            console.log("Imagem convertida e salva no array.");
        }else {
            console.log("Nenhum arquivo de imagem recebido.");
        }

        const novaPublicacao = new Publicacao({
            titulo,       
            descricao,    
            criadoPor,
            imagem: imagensArray 
        });

        const publicacaoSalva = await novaPublicacao.save();

         const publicacaoPopulada = await Publicacao.findById(publicacaoSalva._id)
            .populate('criadoPor', 'nome email logo');

        res.status(201).json(publicacaoPopulada);

    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: 'Erro ao criar a publicação.',
            error: error.message
        });
    }
};

// --- BUSCAR TODAS (GET) ---
const buscarPublicacao = async (req, res) => {
    try {
        const publicacoes = await Publicacao
            .find({})
            .populate('criadoPor', 'nome email logo')
            .sort({ createdAt: -1 }) // Mais recentes primeiro
            .exec();

        res.status(200).json(publicacoes);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar publicações.',
            error: error.message
        });
    }
};

// --- BUSCAR POR ID (GET) ---
const buscarPublicacaoPorId = async (req, res) => {
    try {
        const publicacao = await Publicacao
            .findById(req.params.id)
            .populate('criadoPor', 'nome email logo');

        if (!publicacao) {
            return res.status(404).json({ message: 'Publicação não encontrada.' });
        }

        res.status(200).json(publicacao);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar a publicação.',
            error: error.message
        });
    }
};

// --- EDITAR (PUT) ---
const editarPublicacao = async (req, res) => {
    try {
        const publicacaoAtualizada = await Publicacao.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('criadoPor', 'nome email');

        if (!publicacaoAtualizada) {
            return res.status(404).json({ message: 'Publicação não encontrada para edição.' });
        }

        res.status(200).json(publicacaoAtualizada);
    } catch (error) {
        res.status(400).json({
            message: 'Erro ao editar a publicação.',
            error: error.message
        });
    }
};

// --- EXCLUIR (DELETE) ---
const excluirPublicacao = async (req, res) => {
    try {
        const publicacaoExcluida = await Publicacao.findByIdAndDelete(req.params.id);

        if (!publicacaoExcluida) {
            return res.status(404).json({ message: 'Publicação não encontrada para exclusão.' });
        }

        res.status(204).send();

    } catch (error) {
        res.status(500).json({
            message: 'Erro ao excluir a publicação.',
            error: error.message
        });
    }
};

module.exports = {
    criarPublicacao,
    buscarPublicacao,
    buscarPublicacaoPorId,
    editarPublicacao,
    excluirPublicacao,
};