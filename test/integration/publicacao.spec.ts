import request from 'supertest';
import app from '../../src/app';
import Publicacao from '../../src/models/publicacaoModel';
import jwt from 'jsonwebtoken';
import Usuario from '../../src/models/usuarioModel';

process.env.API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GOOGLE_API_KEY = 'fake-google-api-key';

describe('Publicacao Controller & Routes Integration Test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/publicacoes', () => {
    it('should list publicacoes', async () => {
      // Arrange
      const mockList = [
        {
          titulo: 'Publicacao 1',
          descricao: 'Descricao 1',
          criadoPor: {
            nome: 'Usuario 1',
            email: 'usuario1@example.com',
          },
          _id: 'fakeid1',
        },
      ];
      jest.spyOn(Publicacao, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          sort: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(mockList),
          }),
        }),
      } as never);

      // Act
      const response = await request(app)
        .get('/api/publicacoes')
        .set('x-api-key', 'test-api-key')
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockList);
    });

    it('should return 500 if database fails (fallback string)', async () => {
      jest.spyOn(Publicacao, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          sort: jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockRejectedValueOnce('Falha bizarra no DB' as never),
          }),
        }),
      } as never);

      const response = await request(app)
        .get('/api/publicacoes')
        .set('x-api-key', 'test-api-key')
        .send();

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/publicacoes/:id', () => {
    it('should list publicacao by ID', async () => {
      // Arrange
      const mockPublicacao = {
        titulo: 'Publicacao 1',
        descricao: 'Descricao 1',
        criadoPor: {
          nome: 'Usuario 1',
          email: 'usuario1@example.com',
        },
        _id: '123456789012345678901234',
      };
      jest.spyOn(Publicacao, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(mockPublicacao),
      } as never);
      // Act
      const response = await request(app)
        .get('/api/publicacoes/123456789012345678901234')
        .set('x-api-key', 'test-api-key')
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toEqual({
        _id: '123456789012345678901234',
        titulo: 'Publicacao 1',
        descricao: 'Descricao 1',
        criadoPor: {
          nome: 'Usuario 1',
          email: 'usuario1@example.com',
        },
      });
    });

    it('should return 404 if publicacao is not found', async () => {
      jest.spyOn(Publicacao, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(null),
      } as never);

      const response = await request(app)
        .get('/api/publicacoes/123456789012345678901234')
        .set('x-api-key', 'test-api-key')
        .send();

      expect(response.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      jest.spyOn(Publicacao, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockRejectedValueOnce(new Error('DB Error')),
      } as never);

      const response = await request(app)
        .get('/api/publicacoes/123456789012345678901234')
        .set('x-api-key', 'test-api-key')
        .send();

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/publicacoes', () => {
    it('should create a new publicacao and link to user, returning status 201', async () => {
      // Arrange
      const id = '123456789012345678901234';
      const novaPublicacaoPayload = {
        titulo: 'Publicacao Teste',
        descricao: 'Descricao Teste',
        criadoPor: id,
      };
      const objFinal = {_id: id, ...novaPublicacaoPayload};

      jest.spyOn(jwt, 'verify').mockReturnValue({id, role: 'admin', tipo: 'ONG'} as never);
      jest.spyOn(Usuario, 'findById').mockResolvedValue({_id: id, ativo: true} as never);
      jest.spyOn(Publicacao.prototype, 'save').mockResolvedValueOnce(objFinal as never);
      jest.spyOn(Publicacao, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(objFinal),
      } as never);

      // Act
      const response = await request(app)
        .post('/api/publicacoes')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send(novaPublicacaoPayload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(objFinal);
    });

    
    it('should create a new publicacao with an image upload', async () => {
      const id = '123456789012345678901234';
      const objFinal = { _id: id, titulo: 'Teste com Imagem' };

      jest.spyOn(jwt, 'verify').mockReturnValue({id, role: 'admin'} as never);
      jest.spyOn(Usuario, 'findById').mockResolvedValue({_id: id, ativo: true} as never);
      jest.spyOn(Publicacao.prototype, 'save').mockResolvedValueOnce(objFinal as never);
      jest.spyOn(Publicacao, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(objFinal),
      } as never);

      
      const response = await request(app)
        .post('/api/publicacoes')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer fake-jwt-token')
        .field('titulo', 'Teste com Imagem') // Campo de texto
        .field('criadoPor', id)
        .attach('imagem', Buffer.from('fake-image-data'), 'test.png'); // Upload do arquivo

      expect(response.status).toBe(201);
    });

    it('should return 400 on database save error', async () => {
      const id = '123456789012345678901234';
      
      jest.spyOn(jwt, 'verify').mockReturnValue({id, role: 'admin'} as never);
      jest.spyOn(Usuario, 'findById').mockResolvedValue({_id: id, ativo: true} as never);

      jest.spyOn(Publicacao.prototype, 'save').mockRejectedValueOnce(new Error('Erro de Validação'));

      const response = await request(app)
        .post('/api/publicacoes')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer fake-jwt-token')
        .send({ titulo: 'Publicação Falha' });

      expect(response.status).toBe(400); 
      
      expect(response.body.message).toBe('Erro ao criar a publicação.');
      expect(response.body.error).toBe('Erro de Validação');
    });
  });

  
  describe('PUT /api/publicacoes/:id', () => {
    it('should update a publicacao and return 200', async () => {
      const mockAtualizada = { _id: 'fake-id', titulo: 'Novo Título' };
      
      jest.spyOn(jwt, 'verify').mockReturnValue({id: '123', role: 'admin'} as never);
      jest.spyOn(Publicacao, 'findByIdAndUpdate').mockReturnValueOnce({
        populate: jest.fn().mockResolvedValueOnce(mockAtualizada),
      } as never);

      const response = await request(app)
        .put('/api/publicacoes/fake-id')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer fake-token')
        .send({ titulo: 'Novo Título' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAtualizada);
    });

    it('should return 400 on database error during update', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({id: '123', role: 'admin'} as never);
      jest.spyOn(Publicacao, 'findByIdAndUpdate').mockReturnValueOnce({
        populate: jest.fn().mockRejectedValueOnce(new Error('DB Error')),
      } as never);

      const response = await request(app)
        .put('/api/publicacoes/fake-id')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer fake-token')
        .send({ titulo: 'Novo Título' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('DB Error');
    });
  });

  describe('DELETE /api/publicacoes/:id', () => {
    it('should delete a publicacao and return 204 (No Content)', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({id: '123', role: 'admin'} as never);
      jest.spyOn(Publicacao, 'findByIdAndDelete').mockResolvedValueOnce({ _id: 'fake-id' } as never);

      const response = await request(app)
        .delete('/api/publicacoes/fake-id')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer fake-token')
        .send();

      
      expect(response.status).toBe(204);
    });

    it('should return 404 if publicacao to delete is not found', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({id: '123', role: 'admin'} as never);
      jest.spyOn(Publicacao, 'findByIdAndDelete').mockResolvedValueOnce(null as never);

      const response = await request(app)
        .delete('/api/publicacoes/fake-id')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer fake-token')
        .send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Não encontrada.');
    });

    it('should return 500 on database error (fallback string)', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({id: '123', role: 'admin'} as never);
      // Usando a string fallback para cobrir o lado falso do ternário
      jest.spyOn(Publicacao, 'findByIdAndDelete').mockRejectedValueOnce('Falha no delete' as never);

      const response = await request(app)
        .delete('/api/publicacoes/fake-id')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer fake-token')
        .send();

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erro ao excluir publicação');
    });
  });
});