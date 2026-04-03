# ETAPA 1: Construcción (Build)
# Usamos una versión ligera de Node para compilar el código
FROM node:20-alpine as build-stage

# Nos movemos a la carpeta /app
WORKDIR /app

# Copiamos los archivos de dependencias y las instalamos
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y compilamos para producción
COPY . .
RUN npm run build


# ETAPA 2: Producción (Servidor web Nginx)
# Usamos Nginx para servir los archivos estáticos resultantes
FROM nginx:alpine as production-stage

# Copiamos la carpeta 'dist' que generó la etapa 1 a la carpeta pública de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración para arreglar el Vue Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (el estándar web)
EXPOSE 80

# Comando para encender Nginx
CMD ["nginx", "-g", "daemon off;"]