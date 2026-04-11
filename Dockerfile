# ------------------ ESTÁGIO 1: Build ------------------
FROM node:20-slim AS builder

# Instala dependências necessárias para compilar o 'bcrypt'
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia arquivos de configuração de pacotes
COPY package*.json ./
COPY tsconfig.json ./

# Instala todas as dependências (incluindo as de desenvolvimento para o build)
RUN npm install

# Copia o restante do código fonte
COPY . .

# Gera o código JavaScript na pasta /dist (conforme seu script "build")
RUN npm run build





# ------------------ ESTÁGIO 2: Produção ------------------
FROM node:20-slim AS runner

# Instala dependências de runtime para o 'bcrypt'
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app.js

# Define ambiente como produção
ENV NODE_ENV=production

# Copia apenas os arquivos necessários para rodar as dependências
COPY package*.json ./

# Instala apenas dependências de produção (ignora devDependencies)
RUN npm install --omit=dev

# Copia o código compilado do estágio anterior
COPY --from=builder /app/dist ./dist

# Expõe a porta
EXPOSE 4000

# Garante que o arquivo do swagger esteja disponível onde o código o procura
COPY swagger-output.json ./

# Comando para iniciar a aplicação usando o código compilado
# (a flag experimental serve para evitar erro de importações sem extensão ao criar o container)
CMD ["node", "--experimental-specifier-resolution=node", "dist/server.js"]