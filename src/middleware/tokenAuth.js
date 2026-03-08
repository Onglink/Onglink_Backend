// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

// A mesma chave secreta usada no usuarioController.js
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; 

/**
 * Middleware de Autorização baseado no status (role) do usuário.
 * @param {Array<string>} rolesPermitidas - Array de status que têm permissão para a rota (ex: ['admin', 'ong']).
 * @returns {Function} O middleware do Express.
 */
const checkRole = (rolesPermitidas) => (req, res, next) => {
    // 1. Obter o Token do cabeçalho de Autorização (padrão 'Bearer token')
    const authHeader = req.headers.authorization;
    
    // Verifica se o cabeçalho existe e começa com 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou formato inválido.' });
    }

    // Extrai o token
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verificar a validade e a assinatura do Token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // O payload decodificado agora está em 'decoded' e contém { id, status }
        req.user = decoded; // Adiciona o usuário decodificado ao objeto de requisição

        // 3. Verificar a Autorização (Role/Status)
        // Checa se o status do usuário está no array de roles permitidas
        if (!rolesPermitidas.includes(req.user.role)) {
            // Se o status não for permitido (ex: é 'user'), retorna Forbidden
            return res.status(403).json({ 
                message: 'Acesso negado. Seu nível de cadastro (status) não permite esta ação.' 
            });
        }

        // 4. Se tudo estiver OK, passa para o próximo middleware/controlador
        next();

    } catch (error) {
        // Erro na verificação (token expirado, inválido, etc.)
        res.status(401).json({ message: 'Token inválido ou expirado. Faça o login novamente.' });
    }
};

module.exports = { 
    checkRole 
};