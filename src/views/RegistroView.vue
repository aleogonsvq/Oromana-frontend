<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 px-4">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-800">Crear Cuenta</h2>
        <p class="mt-2 text-gray-600">Acceso exclusivo para claustro</p>
      </div>

      <form @submit.prevent="handleRegistro" class="space-y-5">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Correo Corporativo</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="usuario@ceiporomana.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="Mínimo 6 caracteres"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div v-if="errorMsg" class="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ errorMsg }}
        </div>
        
        <div v-if="successMsg" class="p-3 text-sm text-green-700 bg-green-100 rounded-lg">
          {{ successMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="isLoading" 
          class="w-full px-4 py-2 font-bold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {{ isLoading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <router-link :to="{ name: 'login' }" class="text-sm text-blue-600 hover:underline">
          ¿Ya tienes cuenta? Inicia sesión aquí
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleRegistro = async () => {
  errorMsg.value = '';
  successMsg.value = '';

  // Validación rápida en frontend del dominio
  if (!email.value.endsWith('@ceiporomana.com')) {
    errorMsg.value = 'Debes usar un correo del dominio @ceiporomana.com';
    return;
  }

  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  isLoading.value = true;

  try {
    // Llamamos al nuevo endpoint de registro en Django
    await api.post('auth/registro/', {
      email: email.value,
      password: password.value
    });

    successMsg.value = 'Cuenta creada con éxito. Redirigiendo al login...';
    
    // Si va bien, esperamos 2 segundos y lo mandamos al login para que entre
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);

  } catch (error) {
    if (error.response && error.response.data && error.response.data.email) {
      errorMsg.value = 'Este correo ya está registrado en el sistema.';
    } else {
      errorMsg.value = 'Error al registrar la cuenta. Inténtalo de nuevo.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>