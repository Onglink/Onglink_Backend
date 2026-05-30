import request from 'supertest';
import app from '../../src/app';
import Ong from '../../src/models/ongModel';
import Usuario from '../../src/models/usuarioModel';

// Configuramos uma API KEY falsa para conseguir passar pelo middleware apiKeyAuth
process.env.API_KEY = 'test-api-key';
process.env.GOOGLE_API_KEY = 'fake-google-api-key';

describe('Integration Test: ONG Controller & Routes', () => {
    
    // Limpa os mocks após cada teste para evitar interferências
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/ongs', () => {
        it('should return a list of ONGs with status 200', async () => {
            const mockOngList = [
                { _id: '1', razaoSocial: 'ONG Esperança', nomeFantasia: 'Esperança' },
                { _id: '2', razaoSocial: 'ONG Ajuda', nomeFantasia: 'Ajuda' }
            ];
            jest.spyOn(Ong, 'find').mockResolvedValueOnce(mockOngList as never);

            const response = await request(app)
                .get('/api/ongs')
                .set('x-api-key', 'test-api-key')
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockOngList);
            expect(Ong.find).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if database fails', async () => {
            jest.spyOn(Ong, 'find').mockRejectedValueOnce('Erro bizarro do banco de dados' as never);;

            const response = await request(app)
                .get('/api/ongs')
                .set('x-api-key', 'test-api-key')
                .send();

            expect(response.status).toBe(500);
            expect(response.body.details).toBe('Erro ao listar ONGs');
        });
    });

    describe('POST /api/ongs', () => {
        it('should create a new ONG and link to user, returning status 201', async () => {
            const novaOngPayload = {
                razaoSocial: "ONG Teste",
                nomeFantasia: "Teste",
                cnpj: "12345678000199",
                cpf: "12345678900",
                repLegal: "Rafael",
                telefone: "11999999999",
                email: "contato@ongteste.com",
                assignedTo: ["fake-user-id-123"]
            };

            const mockOngSalva = { _id: "fake-ong-id-456", ...novaOngPayload };

            jest.spyOn(Ong.prototype, 'save').mockResolvedValueOnce(mockOngSalva as never);
            jest.spyOn(Usuario, 'findByIdAndUpdate').mockResolvedValueOnce(true as never);

            const response = await request(app)
                .post('/api/ongs')
                .set('x-api-key', 'test-api-key')
                .send(novaOngPayload);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('ONG cadastrada com sucesso! Aguardando aprovação.');
            expect(response.body.id).toBe(mockOngSalva._id);
        });

        it('should return 400 if database save fails', async () => {
            jest.spyOn(Ong.prototype, 'save').mockRejectedValueOnce(new Error('Erro de Validação do Mongoose'));

            const response = await request(app)
                .post('/api/ongs')
                .set('x-api-key', 'test-api-key')
                .send({ nomeFantasia: 'ONG Faltando Dados' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Erro ao cadastrar ONG.');
        });

        it('should create an ONG without linking to user if assignedTo is missing', async () => {
            const payloadSemUser = { nomeFantasia: "ONG Sem Dono" };
            jest.spyOn(Ong.prototype, 'save').mockResolvedValueOnce({ _id: 'fake-id', ...payloadSemUser } as never);
            const usuarioSpy = jest.spyOn(Usuario, 'findByIdAndUpdate').mockResolvedValueOnce(true as never);
            const response = await request(app)
                .post('/api/ongs')
                .set('x-api-key', 'test-api-key')
                .send(payloadSemUser);

            expect(response.status).toBe(201);
            expect(Usuario.findByIdAndUpdate).not.toHaveBeenCalled(); 
        });
    });

    describe('GET /api/ongs/:id', () => {
        it('should return an ONG by ID with populated assignedTo field', async () => {
            const mockOng = {
                _id: 'fake-ong-id-456',
                nomeFantasia: 'ONG Teste',
                assignedTo: [{ nome: 'Rafael', email: 'rafael@teste.com' }]
            };

            jest.spyOn(Ong, 'findById').mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(mockOng)
            } as never);

            const response = await request(app)
                .get('/api/ongs/fake-ong-id-456')
                .set('x-api-key', 'test-api-key')
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockOng);
        });

        it('should return 404 if ONG is not found', async () => {
            jest.spyOn(Ong, 'findById').mockReturnValueOnce({
                populate: jest.fn().mockResolvedValueOnce(null) 
            } as never);

            const response = await request(app)
                .get('/api/ongs/id-inexistente')
                .set('x-api-key', 'test-api-key')
                .send();

            expect(response.status).toBe(404);
        });

        it('should return 500 on database error', async () => {
            jest.spyOn(Ong, 'findById').mockReturnValueOnce({
                populate: jest.fn().mockRejectedValueOnce(new Error('DB Error'))
            } as never);

            const response = await request(app)
                .get('/api/ongs/fake-id')
                .set('x-api-key', 'test-api-key')
                .send();

            expect(response.status).toBe(500);
        });
    }); 

    describe('PUT /api/ongs/:id', () => {
        it('should update an ONG and return status 200', async () => {
            const mockOngAtualizada = { _id: 'fake-id', nomeFantasia: 'ONG Nova' };
            jest.spyOn(Ong, 'findByIdAndUpdate').mockResolvedValueOnce(mockOngAtualizada as never);

            const response = await request(app)
                .put('/api/ongs/fake-id')
                .set('x-api-key', 'test-api-key')
                .send({ nomeFantasia: 'ONG Nova', situacaoCadastral: 'aprovada' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('ONG atualizada!');
        });

        it('should return 404 if ONG to update is not found', async () => {
            jest.spyOn(Ong, 'findByIdAndUpdate').mockResolvedValueOnce(null as never);

            const response = await request(app)
                .put('/api/ongs/id-inexistente')
                .set('x-api-key', 'test-api-key')
                .send({ nomeFantasia: 'ONG Atualizada' });

            expect(response.status).toBe(404);
        });

        it('should return 400 on database error', async () => {
            jest.spyOn(Ong, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('DB Error'));

            const response = await request(app)
                .put('/api/ongs/fake-id')
                .set('x-api-key', 'test-api-key')
                .send({ nomeFantasia: 'Erro' });

            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /api/ongs/:id/status', () => {
        it('should update ONLY the status of an ONG and return status 200', async () => {
             const mockOngStatus = { _id: 'fake-id', situacaoCadastral: 'aprovada' };
             jest.spyOn(Ong, 'findByIdAndUpdate').mockResolvedValueOnce(mockOngStatus as never);
 
             const response = await request(app)
                 .patch('/api/ongs/fake-id/status')
                 .set('x-api-key', 'test-api-key')
                 .send({ situacaoCadastral: 'aprovada' });
 
             expect(response.status).toBe(200);
        });

        it('should return 404 if ONG not found for status update', async () => {
             jest.spyOn(Ong, 'findByIdAndUpdate').mockResolvedValueOnce(null as never);
 
             const response = await request(app)
                 .patch('/api/ongs/fake-id/status')
                 .set('x-api-key', 'test-api-key')
                 .send({ situacaoCadastral: 'aprovada' });
 
             expect(response.status).toBe(404);
        });

        it('should return 400 on database error during status update', async () => {
             jest.spyOn(Ong, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('DB Error'));
 
             const response = await request(app)
                 .patch('/api/ongs/fake-id/status')
                 .set('x-api-key', 'test-api-key')
                 .send({ situacaoCadastral: 'reprovada' });
 
             expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/ongs/:id', () => {
        it('should delete an ONG and return status 200', async () => {
            jest.spyOn(Ong, 'findByIdAndDelete').mockResolvedValueOnce({ _id: 'fake-id' } as never);

            const response = await request(app)
                .delete('/api/ongs/fake-id')
                .set('x-api-key', 'test-api-key')
                .send();

            expect(response.status).toBe(200);
        });

        it('should return 404 if ONG to delete is not found', async () => {
            jest.spyOn(Ong, 'findByIdAndDelete').mockResolvedValueOnce(null as never);

            const response = await request(app)
                .delete('/api/ongs/id-inexistente')
                .set('x-api-key', 'test-api-key')
                .send();

            expect(response.status).toBe(404);
        });

        it('should return 500 on database error', async () => {
            jest.spyOn(Ong, 'findByIdAndDelete').mockRejectedValueOnce('Outro erro genérico' as never);

            const response = await request(app)
                .delete('/api/ongs/fake-id')
                .set('x-api-key', 'test-api-key')
                .send();

            expect(response.status).toBe(500);
            expect(response.body.details).toBe('Erro ao deletar ONG.');
        });
    });
});