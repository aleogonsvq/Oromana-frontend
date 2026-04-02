import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const routes = [
    // --- VISTAS DE ACCESO ---
    { 
        path: '/login', 
        name: 'login', 
        component: () => import('../views/LoginView.vue'),
        meta: { isPublic: true }
    },
    { 
        path: '/registro', 
        name: 'registro', 
        component: () => import('../views/RegistroView.vue'),
        meta: { isPublic: true }
    },

    // --- VISTAS DE TRANSPARENCIA (Logueados) ---
    { 
        path: '/faltas_hoy', 
        name: 'faltas_hoy', 
        component: () => import('../views/FaltasHoyView.vue'),
        meta: { requiresAuth: true }
    },

    // --- VISTAS DE GESTIÓN PERSONAL (Logueados) ---
    { 
        path: '/maestro', 
        name: 'maestro', 
        component: () => import('../views/MaestroPanelView.vue'),
        meta: { requiresAuth: true }
    },
    { 
        path: '/incluir_falta', 
        name: 'incluir_falta', 
        component: () => import('../views/IncluirFaltaView.vue'),
        meta: { requiresAuth: true }
    },

    // --- VISTAS DE ADMINISTRACIÓN (Solo Directivos y Superadmins) ---
    { 
        path: '/directivo', 
        name: 'directivo', 
        component: () => import('../views/DirectivoPanelView.vue'),
        meta: { requiresAuth: true, allowedRoles: ['DIRECTIVO', 'SUPERADMIN'] }
    },
    { 
        path: '/guardias_hoy', 
        name: 'guardias_hoy', 
        component: () => import('../views/GuardiasHoyView.vue'),
        meta: { requiresAuth: true, allowedRoles: ['DIRECTIVO', 'SUPERADMIN'] }
    },

    // Redirección por defecto si la URL no existe
    { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// GUARDIA DE NAVEGACIÓN: Se ejecuta ANTES de cada cambio de página
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Si el usuario tiene token en localStorage pero recargó la página (el state de Pinia se borra), recuperamos sus datos
    if (authStore.token && !authStore.user) {
        await authStore.fetchCurrentUser();
    }

    const isAuthenticated = authStore.isAuthenticated;
    const userRole = authStore.userRole;

    // 1. Si la ruta requiere autenticación y no está logueado -> Al Login
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' });
    } 
    // 2. Si está logueado e intenta ir al login/registro -> A las faltas de hoy
    else if (to.meta.isPublic && isAuthenticated) {
        next({ name: 'faltas_hoy' });
    }
    // 3. Si la ruta requiere roles específicos y el usuario no lo tiene -> Bloqueado
    else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
        alert('No tienes permisos para ver esta página.');
        next({ name: 'faltas_hoy' });
    } 
    // 4. Todo correcto, adelante
    else {
        next();
    }
});

export default router;