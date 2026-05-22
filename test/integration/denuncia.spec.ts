import request from 'supertest';
import app from '../../src/app';
import Denuncia from '../../src/models/denunciaModel';

process.env.API_KEY = 'test-api-key';
process.env.GOOGLE_API_KEY = 'fake-google-api-key';

describe('Integration Test: Denuncia Controller & Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET/api/denuncias', () => {
    it('should return a list of denuncias with status 200', async () => {
      // Arrange
      const mockDenunciaList = [
        {
          _id: 'fakeid1',
          tipoDenuncia: 'Conteúdo sexual',
          motivo: 'Inapropriado',
          assignedTo: [],
        },
        
      ];
      jest
        .spyOn(Denuncia, 'find')
        .mockResolvedValueOnce(mockDenunciaList as never);

      //Act
      const response = await request(app)
        .get('/api/denuncia')
        .set('x-api-key', 'test-api-key')
        .send();

      //assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDenunciaList);
      expect(Denuncia.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST/api/denuncias', () => {
    it('should create a new denuncia and return status 201', async () => {
      // Arrange
      const novaDenunciaPayload = {
        tipoDenuncia: 'Conteúdo sexual',
        motivo: 'Inapropriado',
        assignedTo: [],
      };
      const mockDenunciaSalva = { _id: 'fake-denuncia-id', ...novaDenunciaPayload };
      jest.spyOn(Denuncia.prototype, 'save').mockResolvedValueOnce(mockDenunciaSalva as never);

      // Act
      const response = await request(app)
        .post('/api/denuncia')
        .set('x-api-key', 'test-api-key')
        .send(novaDenunciaPayload);
        // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Denuncia efetuada com sucesso!',
        id: response.body.id
      });
      expect(Denuncia.prototype.save).toHaveBeenCalledTimes(1);
    });
    });


describe('GET/api/denuncias/:id', () => {
    it('should return a denuncia by ID', async () => {
      // Arrange
      const mockDenuncia = {nome:'Denuncia1'}
      jest
        .spyOn(Denuncia, 'findById')
        .mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockDenuncia),
        }),
      } as never);

      // Act
      const response = await request(app)
        .get('/api/denuncia/fakeid1')
        .set('x-api-key', 'test-api-key')
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDenuncia);
      expect(Denuncia.findById).toHaveBeenCalledTimes(1);
    });
  });
});

 