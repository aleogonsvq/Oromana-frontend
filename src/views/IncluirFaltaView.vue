<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="bg-white p-6 rounded-xl shadow-sm">
      <h1 class="text-2xl font-bold text-gray-800">Notificar Ausencia</h1>
      <p class="text-gray-600">Rellena los datos y sube el material didáctico para los alumnos.</p>
    </div>

    <form @submit.prevent="enviarFalta" class="bg-white p-6 rounded-xl shadow-sm space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Fecha de Ausencia *</label>
          <input 
            v-model="formulario.fecha" 
            type="date" 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Clase Afectada *</label>
          <input 
            v-model="formulario.clase" 
            type="text" 
            placeholder="Ej: 3ºA, 5ºB" 
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block mb-3 text-sm font-medium text-gray-700">Tramos Horarios Afectados *</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label 
            v-for="tramo in tramosDisponibles" 
            :key="tramo.id"
            class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition"
          >
            <input 
              type="checkbox" 
              :value="tramo.id" 
              v-model="formulario.tramos_ausencia"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">{{ tramo.nombre }}</span>
          </label>
        </div>
        <p v-if="errorTramos" class="text-red-500 text-sm mt-2">Debes seleccionar al menos un tramo horario.</p>
      </div>

      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">Material Didáctico (Opcional)</label>
        <input 
          type="file" 
          @change="manejarArchivo"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p class="text-xs text-gray-500 mt-1">Límite máximo: 5MB.</p>
        <p v-if="errorArchivo" class="text-red-500 text-sm mt-2">{{ errorArchivo }}</p>
      </div>

      <div v-if="mensajeExito" class="p-4 bg-green-100 text-green-800 rounded-lg font-medium">
        {{ mensajeExito }}
      </div>
      <div v-if="mensajeError" class="p-4 bg-red-100 text-red-800 rounded-lg font-medium">
        {{ mensajeError }}
      </div>

      <div class="pt-4 border-t border-gray-100">
        <button 
          type="submit" 
          :disabled="cargando"
          class="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ cargando ? 'Enviando...' : 'Registrar Ausencia' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const router = useRouter();

// Para tener la fecha de hoy por defecto (formato YYYY-MM-DD)
const hoy = new Date().toISOString().split('T')[0];

// Estado del formulario
const formulario = ref({
  fecha: hoy,
  clase: '',
  tramos_ausencia: [], // Guardará los IDs de los tramos seleccionados
  archivo: null
});

// Estado auxiliar
const tramosDisponibles = ref([]);
const cargando = ref(false);
const errorTramos = ref(false);
const errorArchivo = ref('');
const mensajeExito = ref('');
const mensajeError = ref('');

// Al montar el componente, pedimos los tramos a Django
onMounted(async () => {
  try {
    const respuesta = await api.get('tramos/');
    tramosDisponibles.value = respuesta.data;
  } catch (error) {
    console.error("Error al cargar los tramos horarios", error);
  }
});

// Validador y capturador del archivo
const manejarArchivo = (evento) => {
  errorArchivo.value = '';
  const archivoSeleccionado = evento.target.files[0];
  
  if (!archivoSeleccionado) {
    formulario.value.archivo = null;
    return;
  }

  // Validamos los 5MB en el frontend (5 * 1024 * 1024 bytes)
  if (archivoSeleccionado.size > 5242880) {
    errorArchivo.value = 'El archivo supera los 5MB permitidos.';
    formulario.value.archivo = null;
    evento.target.value = ''; // Reseteamos el input
    return;
  }

  formulario.value.archivo = archivoSeleccionado;
};

// Función de envío
const enviarFalta = async () => {
  // 1. Limpieza de mensajes
  errorTramos.value = false;
  mensajeError.value = '';
  mensajeExito.value = '';

  // 2. Validación manual: debe haber tramos seleccionados [cite: 7]
  if (formulario.value.tramos_ausencia.length === 0) {
    errorTramos.value = true;
    return;
  }

  cargando.value = true;

  try {
    // 3. Como hay archivo, usamos FormData en lugar de un objeto JSON normal
    const formData = new FormData();
    formData.append('fecha', formulario.value.fecha);
    formData.append('clase', formulario.value.clase);
    
    // Los arrays en FormData se añaden haciendo append múltiples veces
    formulario.value.tramos_ausencia.forEach(tramoId => {
      formData.append('tramos_ausencia', tramoId);
    });

    if (formulario.value.archivo) {
      formData.append('archivo', formulario.value.archivo);
    }

    // 4. Enviamos a la API
    // Axios detecta el FormData y configura automáticamente el Content-Type a multipart/form-data
    await api.post('faltas/', formData);

    mensajeExito.value = 'Ausencia registrada correctamente. Avisando al equipo directivo...';
    
    // 5. Redirigimos al panel del maestro después de 2 segundos para que vea el éxito
    setTimeout(() => {
      router.push({ name: 'maestro' });
    }, 2000);

  } catch (error) {
    console.error("Error enviando falta", error);
    mensajeError.value = 'Ha ocurrido un error al guardar la ausencia. Por favor, revisa los datos.';
  } finally {
    cargando.value = false;
  }
};
</script>