# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copia solo i file di dipendenze prima, per sfruttare la cache Docker
COPY package.json package-lock.json ./
RUN npm ci

# Copia il resto del codice sorgente e compila (usa la configurazione "production" di default)
COPY . .
RUN npm run build

# ---- Stage 2: Serve con nginx ----
FROM nginx:alpine

# Copia i file statici compilati nella cartella servita da nginx
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Configurazione nginx per Angular routing (SPA: tutte le route non trovate vanno a index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
