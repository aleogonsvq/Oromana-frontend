import axios from 'axios';

// Creamos una instancia con la URL base de nuestro backend en Django
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    timeout: 5000,
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