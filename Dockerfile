# Etapa 1 - Build do projeto com Vite
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Etapa 2 - Servir com Nginx + aplicação de atualizações de segurança
FROM nginx:alpine
RUN sed -i 's|http://dl-cdn.alpinelinux.org|https://dl-cdn.alpinelinux.org|g' /etc/apk/repositories \
  && apk update \
  && apk upgrade --no-cache

# Copia os arquivos compilados da etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
