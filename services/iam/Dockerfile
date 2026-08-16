# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar TypeScript globalmente para garantir tsc no sistema
RUN npm install -g typescript

# Copiar arquivos de configuração do monorepo e manifests de workspaces
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/iam/package.json ./services/iam/
COPY services/content/package.json ./services/content/
COPY services/nlp/package.json ./services/nlp/
COPY services/search/package.json ./services/search/
COPY frontend/package.json ./frontend/

# Instalar dependências completas
RUN npm ci

# Copiar código-fonte de contratos compartilhados e do serviço IAM
COPY packages/shared ./packages/shared
COPY services/iam ./services/iam

# Compilar TypeScript diretamente com tsc
RUN tsc -p packages/shared/tsconfig.json
RUN tsc -p services/iam/tsconfig.json

# ==========================================
# STAGE 2: RUNNER (PRODUÇÃO)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Criação de usuário e grupo não-root para segurança
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs

# Copiar manifests e instalar apenas dependências de produção
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/iam/package.json ./services/iam/
COPY services/content/package.json ./services/content/
COPY services/nlp/package.json ./services/nlp/
COPY services/search/package.json ./services/search/
COPY frontend/package.json ./frontend/

RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefatos compilados
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/services/iam/dist ./services/iam/dist

USER nodejs

EXPOSE 3001

CMD ["node", "services/iam/dist/server.js"]
