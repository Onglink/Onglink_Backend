import request from 'supertest';
import app from '../../src/app';
import Ong from '../../src/models/ongModel';
import Usuario from '../../src/models/usuarioModel';

// Configuramos uma API KEY falsa para conseguir passar pelo middleware apiKeyAuth
process.env.API_KEY = 'test-api-key';
process.env.GOOGLE_API_KEY = 'fake-google-api-key';

describe('Integration Test: Parceiro Controller & Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET/api/parceiros', () => {
    it('should return a list of approved partners with status 200', async () => {
      // Arrange
      const mockParceiroList = [
        {_id: '1', nomeFantasia: 'Parceiro 1', situacaoCadastral: 'aprovado'},
        {_id: '2', nomeFantasia: 'Parceiro 2', situacaoCadastral: 'aprovado'},
      ];
      jest.spyOn(Ong, 'find').mockResolvedValueOnce(mockParceiroList as never);
      // Act
      const response = await request(app)
        .get('/api/parceiros')
        .set('x-api-key', 'test-api-key')
        .send();
      //assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockParceiroList);
      expect(Ong.find).toHaveBeenCalledTimes(1);
    });
    it('should return 500 on database error', async () => {

        //arrange
      jest
        .spyOn(Ong, 'find')
        .mockRejectedValueOnce(new Error('Erro interno de conexão'));

      const response = await request(app)
        .get('/api/parceiros')
        .set('x-api-key', 'test-api-key')
        .send();

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erro ao listar ONGs.');
      expect(response.body.details).toBe('Erro interno de conexão');
    });
      it('should return 500 on database error (String fallback)', async () => {
        // Arrange
        jest.spyOn(Ong, 'find').mockRejectedValueOnce('Timeout bizarro no banco' as never);

        // Act
        const response = await request(app)
            .get('/api/parceiros')
            .set('x-api-key', 'test-api-key')
            .send();

        // Assert: Valida se ele caiu no "Erro ao listar parceiros" do ternário
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Erro ao listar ONGs.');
        expect(response.body.details).toBe('Erro ao listar parceiros');
    });
    });
  });

