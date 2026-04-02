<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Panel Directivo</h1>
        <p class="text-gray-600">Gestión de ausencias y asignación de guardias.</p>
      </div>
      <a 
        href="http://127.0.0.1:8000/admin/" 
        target="_blank" 
        class="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        Gestión de Usuarios (Django Admin)
      </a>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-800">Listado de Faltas</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th class="p-4 border-b">Fecha</th>
              <th class="p-4 border-b">Maestro Ausente</th>
              <th class="p-4 border-b">Clase</th>
              <th class="p-4 border-b">Estado</th>
              <th class="p-4 border-b">Asignar Sustituto</th>
            </tr>
          </thead>
          <tbody class="text-sm text-gray-700">
            <tr v-for="falta in faltas" :key="falta.id" class="border-b hover:bg-gray-50">
              <td class="p-4">{{ formatearFecha(falta.fecha) }}</td>
              <td class="p-4 font-medium">{{ falta.maestro_detalle?.email }}</td>
              <td class="p-4">{{ falta.clase }}</td>
              <td class="p-4">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-bold"
                  :class="falta.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
                >
                  {{ falta.estado }}
                </span>
              </td>
              <td class="p-4">
                <div v-if="falta.estado === 'PENDIENTE'" class="flex items-center space-x-2">
                  <select 
                    v-model="falta.guardiaSeleccionado" 
                    class="border border-gray-300 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option disabled value="">Selecciona guardia...</option>
                    <option v-for="guardia in guardias" :key="guardia.id" :value="guardia.id">
                      {{ guardia.usuario.email }} ({{ guardia.rol_guardia }})
                    </option>
                  </select>
                  <button 
                    @click="asignarSustituto(falta)"
                    :disabled="!falta.guardiaSeleccionado"
                    class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Asignar
                  </button>
                </div>
                <div v-else class="text-green-700 font-medium">
                  Cubierta por: {{ falta.maestro_asignado_detalle?.usuario?.email }}
                </div>
              </td>
            </tr>
            <tr v-if="faltas.length === 0">
              <td colspan="5" class="p-6 text-center text-gray-500">No hay faltas registradas en el sistema.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const faltas = ref([]);
const guardias = ref([]);

// Cargar datos al entrar a la página
onMounted(async () => {
  await cargarFaltas();
  await cargarGuardias();
});

const cargarFaltas = async () => {
  try {
    const response = await api.get('faltas/');
    // Añadimos una propiedad temporal 'guardiaSeleccionado' a cada falta para manejar el <select>
    faltas.value = response.data.map(f => ({ ...f, guardiaSeleccionado: '' }));
  } catch (error) {
    console.error("Error cargando faltas:", error);
  }
};

const cargarGuardias = async () => {
  try {
    const response = await api.get('guardias/');
    guardias.value = response.data;
  } catch (error) {
    console.error("Error cargando guardias:", error);
  }
};

const asignarSustituto = async (falta) => {
  try {
    // Hacemos una petición PATCH para actualizar solo estos dos campos
    await api.patch(`faltas/${falta.id}/`, {
      estado: 'CUBIERTA',
      maestro_asignado: falta.guardiaSeleccionado
    });
    
    alert("¡Sustituto asignado y correo enviado!");
    // Recargamos la lista para ver los cambios actualizados
    await cargarFaltas();
    
  } catch (error) {
    console.error("Error al asignar sustituto:", error);
    alert("Ocurrió un error al asignar el sustituto.");
  }
};

// Función de utilidad para poner la fecha en formato ES
const formatearFecha = (fechaString) => {
  const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(fechaString).toLocaleDateString('es-ES', opciones);
};
</script>