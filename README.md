## Comandos Docker Utilizados:

### 1. Construir imagem

```bash
  docker build -t onglink-backend .
```

### 2. Rodar container

```bash
  docker run -d -p 4000:4000 --name container-onglink-backend --env-file .env onglink-backend
```

### 3. Log para verificar funcionamento do container

```bash
  docker logs container-onglink-backend
```

### 4. Parar e remover container

```bash
  docker stop container-onglink-backend
  docker rm container-onglink-backend
```
