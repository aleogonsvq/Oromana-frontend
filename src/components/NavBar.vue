<template>
  <nav v-if="authStore.isAuthenticated" class="bg-blue-700 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        
        <div class="shrink-0 font-bold text-xl">
          Sustituciones CEIP
        </div>

        <div class="flex space-x-4">
          <router-link :to="{ name: 'faltas_hoy' }" class="px-3 py-2 rounded-md hover:bg-blue-600 transition">
            Faltas de Hoy
          </router-link>

          <router-link v-if="authStore.userRole === 'MAESTRO'" :to="{ name: 'maestro' }" class="px-3 py-2 rounded-md hover:bg-blue-600 transition">
            Mis Faltas
          </router-link>
          <router-link v-if="authStore.userRole === 'MAESTRO'" :to="{ name: 'incluir_falta' }" class="px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-400 transition font-medium">
            + Notificar Ausencia
          </router-link>

          <router-link v-if="['DIRECTIVO', 'SUPERADMIN'].includes(authStore.userRole)" :to="{ name: 'directivo' }" class="px-3 py-2 rounded-md hover:bg-blue-600 transition">
            Panel Directivo
          </router-link>
          <router-link v-if="['DIRECTIVO', 'SUPERADMIN'].includes(authStore.userRole)" :to="{ name: 'guardias_hoy' }" class="px-3 py-2 rounded-md hover:bg-blue-600 transition">
            Guardias de Hoy
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <span class="text-sm text-blue-200">
            {{ authStore.user?.email }}
          </span>
          <button @click="handleLogout" class="px-3 py-2 text-sm text-red-100 bg-red-600 rounded-md hover:bg-red-500 transition">
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout(); // Borra los tokens y el estado en Pinia
  router.push({ name: 'login' }); // Redirige a la pantalla de login
};
</script>

<style scoped>
/* Estilo para que el enlace activo se vea diferente automáticamente */
.router-link-active {
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
}
</style>