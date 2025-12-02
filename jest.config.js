module.exports = {
  testEnvironment: 'node',

  // A lista de caminhos onde o Jest deve procurar por arquivos de teste:
  testMatch: [
    // Padrão 1: Busca arquivos .test ou .spec em qualquer lugar
    "**/?(*.)+(spec|test).[jt]s?(x)",
    // Padrão 2: Busca na pasta indicada
    "<rootDir>/controllers/tests/**/*.spec.[jt]s?(x)", 
    "<rootDir>/controllers/tests/**/*.test.[jt]s?(x)", 
  ],
};