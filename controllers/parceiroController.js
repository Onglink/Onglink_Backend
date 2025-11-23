// parceiroController.js - CÓDIGO FINAL COM PROJEÇÃO COMPLETA PARA O MODAL

const Ong = require('../models/ongModel');

const listarParceiros = async (req, res) => {
    try {
        const lista = await Ong.find({
            // 1. FILTRO: Apenas aprovados
            situacaoCadastral: { $regex: /aprovad/i }
        },
        {
            // 2. PROJEÇÃO COMPLETA: TODOS OS CAMPOS PARA O MODAL
            nomeFantasia: 1,
            telefone: 1,
            causaSocial: 1,
            logo: 1,
            email: 1,           // Adicionado
            descricao: 1,       // Adicionado
            razaoSocial: 1,     // Adicionado
            endereco: 1,        // CRUCIAL: Sub-documento
            redeSocial: 1,      // CRUCIAL: Sub-documento
            _id: 1              
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