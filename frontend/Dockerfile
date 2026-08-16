# ==========================================
# RUNNER: NGINX ESTÁTICO (SPA)
# ==========================================
FROM nginx:alpine

# Copiar configuração customizada do NGINX para SPA
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos gerados no build do Vite compilados pelo host
COPY frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
