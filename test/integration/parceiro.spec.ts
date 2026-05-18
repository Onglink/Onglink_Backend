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
            { _id: '1', nomeFantasia: 'Parceiro 1', situacaoCadastral: 'aprovado' },
            { _id: '2', nomeFantasia: 'Parceiro 2', situacaoCadastral: 'aprovado' }
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
    });
});