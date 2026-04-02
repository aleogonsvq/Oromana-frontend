<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 px-4">
    
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-800">Bienvenido</h2>
        <p class="mt-2 text-gray-600">Gestión de Sustituciones CEIP</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Correo Corporativo</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="usuario@ceiporomana.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>

        <div v-if="errorMsg" class="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="isLoading" 
          class="w-full px-4 py-2 font-bold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Comprobando...' : 'Iniciar Sesión' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// Variables reactivas (estado del componente)
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

// Instancias de nuestras herramientas
const router = useRouter();
const authStore = useAuthStore();

// Función que se ejecuta al darle al botón
const handleLogin = async () => {
  // Limpiamos errores previos y activamos estado de carga
  errorMsg.value = '';
  isLoading.value = true;

  try {
    // 1. Llamamos a la acción de login en nuestra Store de Pinia
    await authStore.login(email.value, password.value);
    
    // 2. Si todo va bien, redirigimos a la vista de "Faltas de Hoy"
    router.push({ name: 'faltas_hoy' });
    
  } catch (error) {
    // 3. Si falla, mostramos el error
    if (error.response && error.response.status === 401) {
      errorMsg.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    } else {
      errorMsg.value = 'Error al conectar con el servidor. ¿Está encendido Django?';
    }
  } finally {
    isLoading.value = false; // Desactivamos el estado de carga siempre, pase lo que pase
  }
};
</script>