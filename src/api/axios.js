import axios from 'axios';

// Creamos una instancia con la URL base de nuestro backend en Django
const api = axios.create({
  // Si existe la variable de entorno la usa (producción), si no, usa localhost (desarrollo)
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de enviar cualquier petición, comprueba si hay un token
// y si lo hay, lo mete en la cabecera (Headers) como 'Bearer <token>'
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;