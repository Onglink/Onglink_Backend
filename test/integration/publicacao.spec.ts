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

      jest
        .spyOn(jwt, 'verify')
        .mockReturnValue({id, role: 'admin', tipo: 'ONG'} as never);

      jest
        .spyOn(Usuario, 'findById')
        .mockResolvedValue({_id: id, ativo: true} as never);

      jest
        .spyOn(Publicacao.prototype, 'save')
        .mockResolvedValueOnce(objFinal as never);

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
  });
});
