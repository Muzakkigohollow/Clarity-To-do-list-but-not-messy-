# Stage 1: Build Vite React App
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Mengatur variabel agar Axios memutar balik request Frontend (Root)
# ke server Nginx melalui path /api
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Memasukkan hasil kompilasi statis dari Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html
# Memasukkan konfigurasi custom proxy Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
