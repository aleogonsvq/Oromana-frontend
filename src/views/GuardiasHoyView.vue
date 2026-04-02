<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-xl shadow-sm">
      <h1 class="text-2xl font-bold text-gray-800">Maestros de Guardia</h1>
      <p class="text-gray-600">
        Disponibilidad para hoy: <span class="font-bold text-blue-600 capitalize">{{ diaTextoLocal }}</span>
      </p>
    </div>

    <div v-if="esFinDeSemana" class="bg-white p-10 rounded-xl shadow-sm text-center">
      <span class="text-4xl">🌴</span>
      <h3 class="text-lg font-medium text-gray-900 mt-4">Es fin de semana</h3>
      <p class="text-gray-500 mt-1">No hay turnos de guardia programados para sábados o domingos.</p>
    </div>

    <div v-else-if="cargando" class="text-center py-10 text-gray-500">
      Consultando disponibilidades...
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <div 
        v-for="tramo in horarioGuardias" 
        :key="tramo.id"
        class="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
      >
        <div class="bg-gray-800 text-white p-4">
          <h2 class="text-lg font-bold text-center">{{ tramo.nombre }}</h2>
        </div>

        <div class="p-4 flex-grow bg-gray-50">
          <ul v-if="tramo.guardiasDisponibles.length > 0" class="space-y-3">
            <li 
              v-for="guardia in tramo.guardiasDisponibles" 
              :key="guardia.id"
              class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div>
                <p class="font-bold text-gray-800">{{ guardia.usuario.email.split('@')[0] }}</p>
                <p class="text-xs text-gray-500">{{ formatearRol(guardia.rol_guardia) }}</p>
              </div>
              <span class="flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </li>
          </ul>

          <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 py-4">
            <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
            <p class="text-sm">Sin guardias asignados</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

// Estado de la vista
const cargando = ref(true);
const horarioGuardias = ref([]);

// Lógica de fechas
const diasBackend = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const fechaActual = new Date();
const indexDiaSemana = fechaActual.getDay();

// Saber si es sábado (6) o domingo (0)
const esFinDeSemana = indexDiaSemana === 0 || indexDiaSemana === 6;

// El día exacto como lo espera Django (ej: "JUEVES")
const diaStringBackend = diasBackend[indexDiaSemana];

// Día formateado para la cabecera
const diaTextoLocal = fechaActual.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

onMounted(async () => {
  // Si es fin de semana, no hacemos peticiones a la API
  if (esFinDeSemana) return;

  try {
    // Pedimos los Tramos y los Guardias AL MISMO TIEMPO para ser más rápidos
    const [resTramos, resGuardias] = await Promise.all([
      api.get('tramos/'),
      api.get('guardias/')
    ]);

    const tramosData = resTramos.data;
    const guardiasData = resGuardias.data;

    // Magia de JavaScript: Mapeamos cada tramo y buscamos qué guardias tienen disponibilidad hoy en esa hora
    horarioGuardias.value = tramosData.map(tramo => {
      
      const disponibles = guardiasData.filter(guardia => {
        // .some() comprueba si al menos una disponibilidad coincide con hoy y con este tramo
        return guardia.disponibilidades.some(disp => 
          disp.dia === diaStringBackend && disp.tramo.id === tramo.id
        );
      });

      // Devolvemos el tramo con un nuevo array dentro llamado 'guardiasDisponibles'
      return {
        ...tramo,
        guardiasDisponibles: disponibles
      };
    });

  } catch (error) {
    console.error("Error al cargar la planificación de guardias:", error);
  } finally {
    cargando.value = false;
  }
});

// Utilidad para poner bonito el rol de la base de datos
const formatearRol = (rol) => {
  const roles = {
    'APOYO': 'Maestro de Apoyo',
    'COORDINACION': 'Horas de Coordinación',
    'MAYOR55': 'Reducción mayores 55'
  };
  return roles[rol] || rol;
};
</script>