import { Request, Response } from 'express';
const Usuario = require("../models/usuarioModel");
// const bcrypt = require('bcrypt'); // REMOVIDO PARA TESTE
const jwt = require("jsonwebtoken");

// --- CADASTRO (SALVA SENHA EM TEXTO PURO - APENAS TESTE) ---
const cadastrarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, cpf, email, senha, status } = req.body;

    if (!senha) {
      return res.status(400).json({ error: "A senha é obrigatória." });
    }

    // CRIAÇÃO SEM HASH (Texto Puro)
    const novoUsuario = new Usuario({
      nome,
      cpf,
      email,
      status,
      senha: senha, // Salva exatamente o que foi digitado
    });

    await novoUsuario.save();

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      id: novoUsuario._id,
    });
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao cadastrar usuário";
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Email ou CPF já cadastrado.",
        details: errorMessage,
      });
    }
    res.status(400).json({
      error: "Erro ao cadastrar usuário.",
      details: errorMessage,
    });
  }
};

// --- LOGIN (COMPARA EM TEXTO PURO - APENAS TESTE) ---
const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    // Busca usuário e pede a senha (que está oculta por padrão)
    const usuario = await Usuario.findOne({ email }).select("+senha");

    if (!usuario) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    // COMPARAÇÃO SIMPLES (Texto Puro)
    // Se a senha digitada for igual a senha do banco
    const senhaValida = senha === usuario.senha;

    if (!senhaValida) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    // Gera Token JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, role: usuario.status },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Remove a senha antes de enviar a resposta
    usuario.senha = undefined;

    res.status(200).json({
      message: "Login realizado com sucesso!",
      token: token,
      usuario: usuario,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

// --- LISTAR TODOS ---
const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const lista = await Usuario.find({}).select("-senha");
    res.status(200).json(lista);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao listar usuários";
    res
      .status(500)
      .json({ error: "Erro ao listar usuários.", details: errorMessage });
  }
};

// --- BUSCAR POR ID ---
const buscarUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id)
      .populate('assignedTo')
      .select("-senha");

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.status(200).json({ usuario });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao buscar usuário por ID";
    res
      .status(500)
      .json({ error: "Erro ao buscar o usuário.", details: errorMessage });
  }
};

// --- ATUALIZAR ---
const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dadosAtualizados = req.body;

    // Segurança: impede a atualização de senha por esta rota
    if (dadosAtualizados.senha) {
      delete dadosAtualizados.senha;
    }

    const resultado = await Usuario.findByIdAndUpdate(
      id,
      { $set: dadosAtualizados },
      { new: true, runValidators: true }
    ).select("-senha");

    if (!resultado) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res
      .status(200)
      .json({ message: "Usuário atualizado!", usuario: resultado });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar usuário";
    res
      .status(400)
      .json({ error: "Erro ao atualizar usuário.", details: errorMessage });
  }
};

// --- DELETAR ---
const deletarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resultado = await Usuario.findByIdAndDelete(id);

    if (!resultado) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json({ message: "Usuário deletado!", deleted: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao deletar usuário";
    res
      .status(500)
      .json({ error: "Erro ao deletar usuário.", details: errorMessage });
  }
};

module.exports = {
  cadastrarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
  loginUsuario,
};