// parceiroController.js - CÓDIGO FINAL COM FILTRO DE APROVAÇÃO E PROJEÇÃO

const Ong = require('../models/ongModel');

const listarParceiros = async (req, res) => {
    try {

        // 1. [Backend] Filtro Ativo: Usa $regex /aprovad/i
        // Isso captura 'APROVADO', 'aprovada', 'Aprovado', etc., ignorando problemas de case.
        const lista = await Ong.find({
            situacaoCadastral: { $regex: /aprovad/i }
        },
        {
            // 2. Projection (Projeção): Quais campos mostrar.
            // Inclui o 'logo' e o '_id' (essenciais para o Frontend/React).
            nomeFantasia: 1,
            telefone: 1,
            causaSocial: 1,
            logo: 1,      // Campo da Imagem
            _id: 1        // Chave do React
        });

        res.status(200).json(lista);
    } catch (err) {
        console.error('Erro ao processar a listagem de parceiros:', err);
        res.status(500).json({
            error: 'Erro ao listar ONGs.',
            details: err.message || err
        });
    }
};

module.exports = {
    listarParceiros,
};