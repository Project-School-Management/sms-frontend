# ================================
# Stage 1 — Build Angular (Nx)
# ================================
FROM node:22-alpine AS builder

WORKDIR /app

# Désactive le daemon Nx (incompatible avec les containers Docker)
ENV NX_DAEMON=false

# Copie les fichiers de dépendances
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Installation des dépendances
RUN npm install --legacy-peer-deps

# Copie le reste du code source
COPY . .

# Retire les plugins non nécessaires au build (eslint/jest/playwright)
# @nx/eslint/plugin crashe car typescript-eslint v8 est absent (projet sur v7)
RUN node -e "\
  const fs=require('fs');\
  const nx=JSON.parse(fs.readFileSync('nx.json','utf8'));\
  nx.plugins=nx.plugins.filter(p=>{const n=typeof p==='string'?p:p.plugin;return !n.includes('eslint')&&!n.includes('jest')&&!n.includes('playwright');});\
  fs.writeFileSync('nx.json',JSON.stringify(nx,null,2));\
"

# Build de production
RUN npx nx build sms-web --configuration=production --skip-nx-cache

# ================================
# Stage 2 — Serveur Nginx
# ================================
FROM nginx:1.27-alpine

# Copie le build Angular vers nginx
COPY --from=builder /app/dist/apps/sms-web/browser /usr/share/nginx/html

# Copie la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
