import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
    // State: Las variables que queremos guardar
    state: () => ({
        user: null,
        token: localStorage.getItem('access_token') || null,
        refreshToken: localStorage.getItem('refresh_token') || null,
    }),

    // Getters: Datos calculados a partir del state
    getters: {
        isAuthenticated: (state) => !!state.token,
        userRole: (state) => state.user?.rol || null,
    },

    // Actions: Funciones que modifican el state (como el Login)
    actions: {
        async login(email, password) {
            try {
                // 1. Pedimos los tokens a Django
                const response = await api.post('auth/token/', { email, password });
                this.token = response.data.access;
                this.refreshToken = response.data.refresh;
                
                // 2. Los guardamos en el navegador para no perderlos al recargar
                localStorage.setItem('access_token', this.token);
                localStorage.setItem('refresh_token', this.refreshToken);
                
                // 3. Obtenemos los datos del usuario logueado
                await this.fetchCurrentUser();
            } catch (error) {
                console.error('Error al hacer login:', error);
                throw error;
            }
        },

        async fetchCurrentUser() {
            if (!this.token) return;
            try {
                // Llamamos a nuestro endpoint /auth/me/
                const response = await api.get('auth/me/');
                this.user = response.data;
            } catch (error) {
                console.error('Error obteniendo el usuario:', error);
                this.logout(); // Si el token caducó o es inválido, cerramos sesión
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            this.refreshToken = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }
});