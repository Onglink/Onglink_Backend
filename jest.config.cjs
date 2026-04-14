module.exports = {
  preset:'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Quando o jest vir um arquivo terminando em .js dentro da sua pasta src, ele deve tentar resolver como .ts.
    '^(\\.{1,2}/.*)\\.js$': '$1', 
  },

  // A lista de caminhos onde o Jest deve procurar por arquivos de teste:
  testMatch: [
    // Padrão 1: Busca arquivos .test ou .spec em qualquer lugar
    "**/?(*.)+(spec|test).[jt]s?(x)",
    // Padrão 2: Busca na pasta indicada
    "<rootDir>/controllers/test/**/*.spec.[jt]s?(x)", 
    "<rootDir>/controllers/test/**/*.test.[jt]s?(x)", 
  ],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ['src/**/*.ts'],
  collectCoverage: true,
};