

//const Parceiro = require('../models/parceiroModel');

const Ong = require('../models/ongModel');

const listarParceiros = async (req, res) => {
    try {

        // 1. [Backend] FILTRO ATUALIZADO
        const lista = await Ong.find({
            // NOVIDADE: Usa $regex com a flag 'i' para buscar 'aprovada' em qualquer caixa (Aprovada, APROVADO, aprovada)
            situacaoCadastral: { $regex: /aprovada/i } 
        },
        {
            // 2. Projection (Projeção): Quais campos mostrar
            nomeFantasia: 1,
            telefone: 1,
            causaSocial: 1,
            _id: 1 
        });

        res.status(200).json(lista);
    } catch (err) {
        res.status(500).json({
            error: 'Erro ao listar ONGs.',
            details: err.message || err
        });
    }
};

module.exports = {
    listarParceiros,
};