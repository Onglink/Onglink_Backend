import request from 'supertest';
import app from '../../src/app'; // Ajuste o caminho conforme sua estrutura
import Usuario from '../../src/models/usuarioModel';
import jwt from 'jsonwebtoken';

// Configuramos variáveis de ambiente fakes para os testes
process.env.API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret';

describe('Integration Test: Usuario Controller & Routes', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/usuarios/cadastro', () => {
        it('should create a new user and return status 201', async () => {
            // Arrange
            const payload = { nome: 'João', cpf: '12345678900', email: 'joao@teste.com', senha: '123' };
            const mockUsuarioSalvo = { _id: 'fake-user-id', ...payload };
            jest.spyOn(Usuario.prototype, 'save').mockResolvedValueOnce(mockUsuarioSalvo as never);

            // Act
            const response = await request(app)
                .post('/api/usuarios/cadastro')
                .set('x-api-key', 'test-api-key')
                .send(payload);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Usuário cadastrado com sucesso!');
            expect(response.body.id).toEqual(expect.any(String));
        });

        it('should return 400 if password is not provided', async () => {
            // Act
            const response = await request(app)
                .post('/api/usuarios/cadastro')
                .set('x-api-key', 'test-api-key')
                .send({ nome: 'Sem Senha', email: 'teste@teste.com' });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('A senha é obrigatória.');
        });

        it('should return 400 for duplicate email/cpf (Mongo Error 11000)', async () => {
            // Arrange
            jest.spyOn(Usuario.prototype, 'save').mockRejectedValueOnce(11000 as never);

            // Act
            const response = await request(app)
                .post('/api/usuarios/cadastro')
                .set('x-api-key', 'test-api-key')
                .send({ nome: 'Cópia', email: 'joao@teste.com', senha: '123' });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email ou CPF já cadastrado.');
        });
    });

    describe('POST /api/usuarios/login', () => {
        it('should login successfully and return a JWT token', async () => {
            // Arrange
            const mockUser = { _id: 'fake-id', email: 'joao@teste.com', senha: '123', status: 'user' };
            
            // Mock do encadeamento: findOne().select()
            jest.spyOn(Usuario, 'findOne').mockReturnValueOnce({
                select: jest.fn().mockResolvedValueOnce(mockUser)
            } as never);

            // Act
            const response = await request(app)
                .post('/api/usuarios/login')
                .set('x-api-key', 'test-api-key')
                .send({ email: 'joao@teste.com', senha: '123' });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login realizado com sucesso!');
            expect(response.body).toHaveProperty('token'); // Verifica se o token foi gerado
        });

        it('should return 401 if password is wrong', async () => {
            // Arrange
            const mockUser = { _id: 'fake-id', email: 'joao@teste.com', senha: '123' }; // Senha real é 123
            
            jest.spyOn(Usuario, 'findOne').mockReturnValueOnce({
                select: jest.fn().mockResolvedValueOnce(mockUser)
            } as never);

            // Act
            const response = await request(app)
                .post('/api/usuarios/login')
                .set('x-api-key', 'test-api-key')
                .send({ email: 'joao@teste.com', senha: 'senha-errada' });

            // Assert
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Email ou senha inválidos.');
        });
    });

    describe('GET /api/usuarios', () => {
        it('should list users ignoring passwords', async () => {
            // Arrange
            const mockList = [{ nome: 'João' }];
            jest.spyOn(Usuario, 'find').mockReturnValueOnce({
                select: jest.fn().mockResolvedValueOnce(mockList)
            } as never);

            // Act
            const response = await request(app).get('/api/usuarios').set('x-api-key', 'test-api-key').send();

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockList);
        });
    });

    describe('GET /api/usuarios/:id', () => {
        it('should return user by id', async () => {
            // Arrange
            const mockUser = { nome: 'João' };
            // Encadeamento triplo: findById().populate().select()
            jest.spyOn(Usuario, 'findById').mockReturnValueOnce({
                populate: jest.fn().mockReturnValueOnce({
                    select: jest.fn().mockResolvedValueOnce(mockUser)
                })
            } as never);

            // Act
            const response = await request(app).get('/api/usuarios/fake-id').set('x-api-key', 'test-api-key').send();

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.usuario).toEqual(mockUser);
        });
    });

    describe('PUT /api/usuarios/:id', () => {
        it('should update user and ignore password changes', async () => {
            // Arrange
            const mockUpdatedUser = { nome: 'João Atualizado' };
            jest.spyOn(Usuario, 'findByIdAndUpdate').mockReturnValueOnce({
                select: jest.fn().mockResolvedValueOnce(mockUpdatedUser)
            } as never);

            // Act
            const response = await request(app)
                .put('/api/usuarios/fake-id')
                .set('x-api-key', 'test-api-key')
                .send({ nome: 'João Atualizado', senha: 'senha-nova-hackeada' }); // Senha deve ser ignorada

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.usuario).toEqual(mockUpdatedUser);
            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                'fake-id',
                { $set: { nome: 'João Atualizado' } }, // Verifica que "senha" sumiu
                { new: true, runValidators: true }
            );
        });
    });

    describe('DELETE /api/usuarios/:id', () => {
        it('should delete a user and return 200', async () => {
            // Arrange
            jest.spyOn(Usuario, 'findByIdAndDelete').mockResolvedValueOnce({ _id: 'fake-id' } as never);

            // Act
            const response = await request(app).delete('/api/usuarios/fake-id').set('x-api-key', 'test-api-key').send();

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Usuário deletado!');
        });
    });
});