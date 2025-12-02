const usuarioController = require('../usuarioController'); 
const usuarioModel = require('../../models/usuarioModel'); 

jest.mock('../../models/usuarioModel'); 

let req, res; 

beforeEach(() => {
    req = {
        body: {
            nome: 'Teste Jest',
            cpf: '123.456.789-00',
            email: 'teste@jest.com',
            senha: 'Senha123'
        }
    };

    res = {
        status: jest.fn().mockReturnThis(), 
        json: jest.fn(),
        send: jest.fn(), 
    };

    
    jest.clearAllMocks();
});

describe('Testes de Cadastro de Usuário', () => {

    test('1. Deve retornar status 201 e JSON de sucesso ao criar um usuário', async () => {
        
        const mockSave = jest.fn().mockResolvedValue({ _id: 'novoId123', ...req.body });
        usuarioModel.mockImplementation(() => ({ save: mockSave })); 
        await usuarioController.cadastrarUsuario(req, res);

        expect(mockSave).toHaveBeenCalledTimes(1); 
        expect(res.status).toHaveBeenCalledWith(201); 
        expect(res.json).toHaveBeenCalled(); 
    });

    test('2. Deve retornar status 400 se faltar a senha (Checagem inicial)', async () => {
       
        delete req.body.senha; 
        await usuarioController.cadastrarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400); 
        expect(res.json).toHaveBeenCalledWith({ error: "A senha é obrigatória." });
        
       expect(usuarioModel.mock.instances[0]?.save).toBeUndefined(); 
    });
    
    test('3. Deve retornar status 400 se o email for duplicado (Erro 11000)', async () => {
        const duplicateError = new Error('E11000 duplicate key error');
        duplicateError.code = 11000;
        
        const mockSave = jest.fn().mockRejectedValue(duplicateError);
        usuarioModel.mockImplementation(() => ({ save: mockSave }));

        await usuarioController.cadastrarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400); 
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "Email ou CPF já cadastrado." })
        );
    });

    test('4. Deve retornar status 400 para erro genérico de cadastro', async () => {
        const genericError = new Error('Validation failed');
        
        const mockSave = jest.fn().mockRejectedValue(genericError);
        usuarioModel.mockImplementation(() => ({ save: mockSave }));

        await usuarioController.cadastrarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400); 
        expect(res.json).toHaveBeenCalledWith(
             expect.objectContaining({ error: "Erro ao cadastrar usuário." })
        );
    });

});