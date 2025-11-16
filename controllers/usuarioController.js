// const Usuario = require('../models/usuarioModel');

// const cadastrarUsuario = async (req, res) => {
//     try {

//         const novoUsuario = new Usuario(req.body);

//         await novoUsuario.save();

//         res.status(201).json({
//             message: 'Usuário cadastrado com sucesso!',
//             id: novoUsuario._id
//         });
//     } catch (err) {
//         if (err.code === 11000) {
//             return res.status(400).json({
//                 error: 'Email ou CPF já cadastrado.',
//                 details: err.message
//             });
//         }
//         res.status(400).json({
//             error: 'Erro ao cadastrar usuário, dados inválidos ou faltando.',
//             details: err.message || err
//         });
//     }
// };

// const listarUsuarios = async (req, res) => {
//     try {
//         // Usa find(). Como a senha tem 'select: false' no Model, ela será omitida.
//         const lista = await Usuario.find({}).select('-senha');

//         res.status(200).json(lista);
//     } catch (err) {
//         res.status(500).json({
//             error: 'Erro ao listar usuários.',
//             details: err.message || err
//         });
//     }
// };

// const buscarUsuarioPorId = async (req, res) => {
//     try{
//         const {id} = req.params;
//         const usuario = await Usuario.findById(id).select('-senha');

//         if (!usuario) {
//             return res.status(404).json({ error: 'Usuário não encontrado.' });
//         }
//         res.status(200).json({usuario});
//     } catch (err) {
//         res.status(500).json({
//             error:'Erro ao bucar o usuário, verifique o Id.',
//             details: err.message || err
//         });

//     }
// }

// const atualizarUsuario = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const dadosAtualizados = req.body;

//         const resultado = await Usuario.findByIdAndUpdate(
//             id,
//             { $set: dadosAtualizados },
//             { new: true, runValidators: true }
//         ).select('-senha');

//         if (!resultado) {
//             return res.status(404).json({ error: 'Usuário não encontrado para atualizar.' });
//         }

//         res.status(200).json({
//             message: 'Usuário atualizado com sucesso!',
//             usuario: resultado
//         });
//     } catch (err) {
//         res.status(400).json({
//             error: 'Erro ao atualizar usuário. Verifique os dados.',
//             details: err.message || err
//         });
//     }
// };

// const deletarUsuario = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const resultado = await Usuario.findByIdAndDelete(id);

//         if (!resultado) {
//             return res.status(404).json({ error: 'Usuário não encontrado para deletar.' });
//         }

//         res.status(200).json({
//             message: 'Usuário deletado com sucesso!',
//             deleted: true
//         });
//     } catch (err) {
//         res.status(500).json({
//             error: 'Erro ao deletar usuário. Verifique se o ID é válido.',
//             details: err.message || err
//         });
//     }
// };

// const loginUsuario = async (req, res) => {
//     try {
//         const { email, senha } = req.body;

//         if (!email || !senha) {
//             return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
//         }

//         // 2. Busca o usuário pelo email e INCLUI a senha na busca (+senha)
//         // Precisamos do '+senha' porque no Schema ela está como 'select: false'
//         const usuario = await Usuario.findOne({ email }).select('+senha');

//         if (!usuario) {
//             return res.status(401).json({ error: 'Email ou senha inválidos.' });
//         }

//         // 3. Comparação de senha (ATENÇÃO: Isso é comparação de texto simples!)
//         // Se você estiver usando bcrypt, troque por: await bcrypt.compare(senha, usuario.senha)
//         if (senha !== usuario.senha) {
//             return res.status(401).json({ error: 'Email ou senha inválidos.' });
//         }

//         // 4. Login bem-sucedido! Retorna os dados (sem a senha)
//         usuario.senha = undefined; // Remove a senha do objeto final por segurança

//         res.status(200).json({
//             message: 'Login realizado com sucesso!',
//             usuario: {
//                 _id: usuario._id,
//                 nome: usuario.nome,
//                 email: usuario.email,
//                 status: usuario.status
//             }

//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Erro interno no servidor ao realizar login.' });
//     }
// };

// module.exports = {
//     cadastrarUsuario,
//     listarUsuarios,
//     buscarUsuarioPorId,
//     atualizarUsuario,
//     deletarUsuario,
//     loginUsuario,

// };

//novo usuarioController
const Usuario = require("../models/usuarioModel");
// const bcrypt = require('bcrypt'); // REMOVIDO PARA TESTE
const jwt = require("jsonwebtoken");

// --- CADASTRO (SALVA SENHA EM TEXTO PURO - APENAS TESTE) ---
const cadastrarUsuario = async (req, res) => {
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
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Email ou CPF já cadastrado.",
        details: err.message,
      });
    }
    res.status(400).json({
      error: "Erro ao cadastrar usuário.",
      details: err.message || err,
    });
  }
};

// --- LOGIN (COMPARA EM TEXTO PURO - APENAS TESTE) ---
const loginUsuario = async (req, res) => {
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
const listarUsuarios = async (req, res) => {
  try {
    const lista = await Usuario.find({}).select("-senha");
    res.status(200).json(lista);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao listar usuários.", details: err.message });
  }
};

// --- BUSCAR POR ID ---
const buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id)
    .populate('assignedTo')
    .select("-senha");

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.status(200).json( usuario );
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar o usuário.", details: err.message });
  }
};

// --- ATUALIZAR ---
const atualizarUsuario = async (req, res) => {
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
    res
      .status(400)
      .json({ error: "Erro ao atualizar usuário.", details: err.message });
  }
};

// --- DELETAR ---
const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await Usuario.findByIdAndDelete(id);

    if (!resultado) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json({ message: "Usuário deletado!", deleted: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao deletar usuário.", details: err.message });
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
