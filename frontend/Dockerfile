# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração do monorepo e manifests de workspaces
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/iam/package.json ./services/iam/
COPY services/content/package.json ./services/content/
COPY services/nlp/package.json ./services/nlp/
COPY services/search/package.json ./services/search/
COPY frontend/package.json ./frontend/

ENV NODE_ENV=development
ENV PATH="/app/node_modules/.bin:${PATH}"

# Instalar dependências completas
RUN npm ci --include=dev

# Copiar código-fonte de contratos compartilhados e do frontend
COPY packages/shared ./packages/shared
COPY frontend ./frontend

# Compilar contratos compartilhados e gerar o bundle de produção do Vite
RUN npm run build --workspace=@shared/contracts
RUN npm run build --workspace=frontend

# ==========================================
# STAGE 2: RUNNER (NGINX ESTÁTICO)
# ==========================================
FROM nginx:alpine AS runner

# Copiar configuração customizada do NGINX para SPA
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos gerados no build do Vite
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
