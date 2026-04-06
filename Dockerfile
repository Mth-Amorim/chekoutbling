# Estágio 1: Construção da aplicação (Build)
FROM oven/bun:latest AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json bun.lockb ./

# Instala as dependências com bun
RUN bun install

# Copia o restante do código do projeto para o contêiner
COPY . .

# Faz o build da aplicação para produção
RUN bun run build

# Estágio 2: Configuração do Nginx para servir a aplicação
FROM nginx:alpine

# Copia os arquivos estáticos gerados no estágio anterior para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração personalizada do Nginx para suportar as rotas do React (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 do contêiner
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
