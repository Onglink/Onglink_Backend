// parceiroController.js - CÓDIGO FINAL COM MAIS CAMPOS NO MODAL

const Ong = require('../models/ongModel');

const listarParceiros = async (req, res) => {
    try {
        // [Backend] Projeção de dados completa para o Modal
        const lista = await Ong.find({
            situacaoCadastral: { $regex: /aprovad/i }
        },
        {
            // CAMPOS BÁSICOS
            _id: 1,
            nomeFantasia: 1,
            telefone: 1,
            email: 1,
            descricao: 1,
            logo: 1,
            causaSocial: 1,
            
            // NOVOS CAMPOS ADICIONADOS PARA O MODAL
            razaoSocial: 1,
            endereco: 1,     // Inclui todo o sub-documento de Endereço
            redeSocial: 1,   // Inclui todo o sub-documento de Redes Sociais
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