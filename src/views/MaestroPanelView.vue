<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Mi Historial de Ausencias</h1>
        <p class="text-gray-600">Consulta el estado de tus notificaciones pasadas y actuales.</p>
      </div>
      <router-link 
        :to="{ name: 'incluir_falta' }" 
        class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
      >
        + Notificar Ausencia
      </router-link>
    </div>

    <div v-if="cargando" class="text-center py-10 text-gray-500">
      Cargando tu historial...
    </div>

    <div v-else-if="misFaltas.length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th class="p-4 border-b">Fecha</th>
              <th class="p-4 border-b">Clase</th>
              <th class="p-4 border-b">Tramos</th>
              <th class="p-4 border-b">Material</th>
              <th class="p-4 border-b">Estado</th>
            </tr>
          </thead>
          <tbody class="text-sm text-gray-700">
            <tr v-for="falta in misFaltas" :key="falta.id" class="border-b hover:bg-gray-50 transition">
              <td class="p-4 font-medium">{{ formatearFecha(falta.fecha) }}</td>
              <td class="p-4">{{ falta.clase }}</td>
              <td class="p-4">
                <span v-for="(tramo, index) in falta.tramos_detalle" :key="tramo.id">
                  {{ tramo.nombre }}<span v-if="index !== falta.tramos_detalle.length - 1">, </span>
                </span>
              </td>
              <td class="p-4">
                <a 
                  v-if="falta.archivo" 
                  :href="falta.archivo" 
                  target="_blank"
                  class="text-blue-600 hover:text-blue-800 flex items-center hover:underline"
                  title="Ver material adjunto"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  Ver adjunto
                </a>
                <span v-else class="text-gray-400 italic">Sin material</span>
              </td>
              <td class="p-4">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-bold"
                  :class="falta.estado === 'CUBIERTA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ falta.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="bg-white p-10 rounded-xl shadow-sm text-center">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h3 class="text-lg font-medium text-gray-900">Historial limpio</h3>
      <p class="text-gray-500 mt-1">Aún no has registrado ninguna ausencia.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const misFaltas = ref([]);
const cargando = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('faltas/');
    // Filtramos para mostrar SOLO las faltas donde el maestro coincide con el usuario logueado
    // Esto es muy útil porque el backend nos manda las nuestras + las de hoy de otros
    misFaltas.value = response.data.filter(falta => falta.maestro === authStore.user.id);
    
    // Opcional: Ordenamos para que las más recientes salgan arriba
    misFaltas.value.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  } catch (error) {
    console.error("Error al cargar el historial:", error);
  } finally {
    cargando.value = false;
  }
});

// Utilidad para formatear la fecha
const formatearFecha = (fechaString) => {
  const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(fechaString).toLocaleDateString('es-ES', opciones);
};
</script>