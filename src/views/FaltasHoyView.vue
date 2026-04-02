<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Ausencias de Hoy</h1>
        <p class="text-gray-600 capitalize">{{ fechaTexto }}</p>
      </div>
      <div class="flex space-x-3 text-sm">
        <span class="flex items-center">
          <span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Cubiertas
        </span>
        <span class="flex items-center">
          <span class="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span> Pendientes
        </span>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-10 text-gray-500">
      Cargando información...
    </div>

    <div v-else-if="faltasHoy.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="falta in faltasHoy" 
        :key="falta.id" 
        class="bg-white rounded-xl shadow-sm border-l-4 overflow-hidden transition-all hover:shadow-md"
        :class="falta.estado === 'CUBIERTA' ? 'border-green-500' : 'border-yellow-400'"
      >
        <div class="p-5 space-y-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-gray-800 text-lg">{{ falta.maestro_detalle?.email.split('@')[0] }}</h3>
              <p class="text-sm text-gray-500">Clase: <span class="font-bold text-gray-700">{{ falta.clase }}</span></p>
            </div>
            <span 
              class="px-2 py-1 rounded-md text-xs font-bold"
              :class="falta.estado === 'CUBIERTA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
            >
              {{ falta.estado }}
            </span>
          </div>

          <div class="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
            <p class="font-medium mb-1">Horas afectadas:</p>
            <ul class="list-disc list-inside space-y-1">
              <li v-for="tramo in falta.tramos_detalle" :key="tramo.id">
                {{ tramo.nombre }}
              </li>
            </ul>
          </div>

          <div v-if="falta.estado === 'CUBIERTA'" class="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
            <strong>Cubierta por:</strong> {{ falta.maestro_asignado_detalle?.usuario?.email.split('@')[0] }}
          </div>
          <div v-else class="text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-100">
            Pendiente de asignación por Jefatura.
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white p-10 rounded-xl shadow-sm text-center">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h3 class="text-lg font-medium text-gray-900">Todo en orden</h3>
      <p class="text-gray-500 mt-1">No se han registrado ausencias para el día de hoy.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';

const faltasHoy = ref([]);
const cargando = ref(true);

// Fecha actual en formato YYYY-MM-DD para filtrar
const hoyStr = new Date().toISOString().split('T')[0];

// Fecha en texto bonito para la cabecera (ej: "jueves, 2 de abril de 2026")
const fechaTexto = computed(() => {
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('es-ES', opciones);
});

onMounted(async () => {
  try {
    const response = await api.get('faltas/');
    // Filtramos en el frontend para asegurarnos de mostrar SOLO las de hoy
    faltasHoy.value = response.data.filter(falta => falta.fecha === hoyStr);
  } catch (error) {
    console.error("Error al cargar las ausencias de hoy:", error);
  } finally {
    cargando.value = false;
  }
});
</script>