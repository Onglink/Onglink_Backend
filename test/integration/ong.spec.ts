import request from 'supertest';
import app from '../../src/app'; // Ajuste o caminho conforme a sua estrutura de pastas
import Ong from '../../src/models/ongModel';
import Usuario from '../../src/models/usuarioModel';

// Configuramos uma API KEY falsa para conseguir passar pelo middleware apiKeyAuth
process.env.API_KEY = 'test-api-key';

describe('Integration Test: ONG Controller & Routes', () => {
    
    // Limpa os mocks após cada teste para evitar interferências
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/ongs', () => {
        it('should return a list of ONGs with status 200', async () => {
            // AAA: Arrange
            const mockOngList = [
                { _id: '1', razaoSocial: 'ONG Esperança', nomeFantasia: 'Esperança' },
                { _id: '2', razaoSocial: 'ONG Ajuda', nomeFantasia: 'Ajuda' }
            ];
            // Intercepta o Ong.find() do Mongoose e força a retornar a lista mockada
            jest.spyOn(Ong, 'find').mockResolvedValueOnce(mockOngList as never);

            // AAA: Act
            const response = await request(app)
                .get('/api/ongs')
                .set('x-api-key', 'test-api-key') // Passando a chave da API!
                .send();

            // AAA: Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockOngList);
            expect(Ong.find).toHaveBeenCalledTimes(1); // Garante que o banco foi chamado
        });
    });

    describe('POST /api/ongs', () => {
        it('should create a new ONG and link to user, returning status 201', async () => {
            // AAA: Arrange
            const novaOngPayload = {
                razaoSocial: "ONG Teste",
                nomeFantasia: "Teste",
                cnpj: "12345678000199",
                cpf: "12345678900",
                repLegal: "Rafael",
                telefone: "11999999999",
                email: "contato@ongteste.com",
                assignedTo: ["fake-user-id-123"] // Array com ID do usuário dono
            };

            const mockOngSalva = { _id: "fake-ong-id-456", ...novaOngPayload };

            // Como o save() é um método da INSTÂNCIA do Mongoose, mockamos o prototype
            jest.spyOn(Ong.prototype, 'save').mockResolvedValueOnce(mockOngSalva as never);
            // Mockamos o findByIdAndUpdate do Usuario (que vincula a ONG ao usuário)
            jest.spyOn(Usuario, 'findByIdAndUpdate').mockResolvedValueOnce(true as never);

            // AAA: Act
            const response = await request(app)
                .post('/api/ongs')
                .set('x-api-key', 'test-api-key')
                .send(novaOngPayload);

            // AAA: Assert
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('ONG cadastrada com sucesso! Aguardando aprovação.');
            expect(response.body.id).toBe(mockOngSalva._id);
            expect(Ong.prototype.save).toHaveBeenCalledTimes(1);
            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                "fake-user-id-123", 
                { assignedTo: "fake-ong-id-456" }
            );
        });

        it('should return 400 if database save fails', async () => {
            // AAA: Arrange
            jest.spyOn(Ong.prototype, 'save').mockRejectedValueOnce(new Error('Erro de Validação do Mongoose'));

            // AAA: Act
            const response = await request(app)
                .post('/api/ongs')
                .set('x-api-key', 'test-api-key')
                .send({ nomeFantasia: 'ONG Faltando Dados' });

            // AAA: Assert
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Erro ao cadastrar ONG.');
            expect(response.body.details).toBe('Erro de Validação do Mongoose');
        });
    });

    describe('GET /api/ongs/:id', () => {
        it('should return an ONG by ID with populated assignedTo field', async () => {
            // AAA: Arrange
            const mockOng = {
                _id: 'fake-ong-id-456',
                nomeFantasia: 'ONG Teste',
                assignedTo: [{ nome: 'Rafael', email: 'rafael@teste.com' }]
            };

            // O controller usa findById().populate(). Precisamos mockar o encadeamento!
            jest.spyOn(Ong, 'findById').mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(mockOng)
            } as never);

            // AAA: Act
            const response = await request(app)
                .get('/api/ongs/fake-ong-id-456')
                .set('x-api-key', 'test-api-key')
                .send();

            // AAA: Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockOng);
        });

        it('should return 404 if ONG is not found', async () => {
            // AAA: Arrange
            jest.spyOn(Ong, 'findById').mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(null) // Simula que não encontrou nada
            } as never);

            // AAA: Act
            const response = await request(app)
                .get('/api/ongs/id-inexistente')
                .set('x-api-key', 'test-api-key')
                .send();

            // AAA: Assert
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('ONG não encontrada.');
        });
        describe('PUT /api/ongs/:id', () => {
        it('should update an ONG and return status 200 (stripping situacaoCadastral)', async () => {
            // AAA: Arrange
            const mockOngAtualizada = { _id: 'fake-id', nomeFantasia: 'ONG Nova' };
            jest.spyOn(Ong, 'findByIdAndUpdate').mockResolvedValueOnce(mockOngAtualizada as never);

            // AAA: Act
            const response = await request(app)
                .put('/api/ongs/fake-id')
                .set('x-api-key', 'test-api-key')
                // Enviamos dados permitidos E uma tentativa de mudar o status (não permitida aqui)
                .send({ nomeFantasia: 'ONG Nova', situacaoCadastral: 'aprovada' });

            // AAA: Assert
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('ONG atualizada!');
            expect(response.body.ong).toEqual(mockOngAtualizada);
            
            // Garantimos que o Mongoose foi chamado SEM o campo 'situacaoCadastral'
            expect(Ong.findByIdAndUpdate).toHaveBeenCalledWith(
                'fake-id',
                { $set: { nomeFantasia: 'ONG Nova' } }, 
                { new: true, runValidators: true }
            );
        });

        it('should return 404 if ONG to update is not found', async () => {
            // Arrange
            jest.spyOn(Ong, 'findByIdAndUpdate').mockResolvedValueOnce(null as never);

            // Act
            const response = await request(app)
                .put('/api/ongs/id-inexistente')
                .set('x-api-key', 'test-api-key')
                .send({ nomeFantasia: 'ONG Atualizada' });

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('ONG não encontrada.');
        });
    });

    describe('PATCH /api/ongs/:id/status', () => {
        it('should update ONLY the status of an ONG and return status 200', async () => {
             // Arrange
             const mockOngStatus = { _id: 'fake-id', situacaoCadastral: 'aprovada' };
             jest.spyOn(Ong, 'findByIdAndUpdate').mockResolvedValueOnce(mockOngStatus as never);
 
             // Act
             const response = await request(app)
                 .patch('/api/ongs/fake-id/status')
                 .set('x-api-key', 'test-api-key')
                 .send({ situacaoCadastral: 'aprovada' });
 
             // Assert
             expect(response.status).toBe(200);
             expect(response.body.message).toBe('Status atualizado!');
             expect(response.body.ong).toEqual(mockOngStatus);
        });
    });

    describe('DELETE /api/ongs/:id', () => {
        it('should delete an ONG and return status 200', async () => {
            // Arrange
            // Simulamos que ele encontrou a ONG e deletou (retornando o documento deletado)
            jest.spyOn(Ong, 'findByIdAndDelete').mockResolvedValueOnce({ _id: 'fake-id' } as never);

            // Act
            const response = await request(app)
                .delete('/api/ongs/fake-id')
                .set('x-api-key', 'test-api-key')
                .send();

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('ONG deletada com sucesso!');
        });

        it('should return 404 if ONG to delete is not found', async () => {
            // Arrange
            // Simulamos que o banco não encontrou nada com aquele ID (retorna null)
            jest.spyOn(Ong, 'findByIdAndDelete').mockResolvedValueOnce(null as never);

            // Act
            const response = await request(app)
                .delete('/api/ongs/id-inexistente')
                .set('x-api-key', 'test-api-key')
                .send();

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('ONG não encontrada para deletar.');
        });
    });
    });
});