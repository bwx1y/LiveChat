FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Tahap 2: Serve dengan Nginx
FROM nginx:alpine

# Hapus default config
RUN rm /etc/nginx/conf.d/default.conf

# Salin konfigurasi nginx kustom
COPY nginx.conf /etc/nginx/conf.d

# Salin hasil build Vite ke folder html
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
