<template>
  <div id="app" class="bg-gray-100 min-h-screen text-gray-800 font-sans flex flex-col">
    
    <NavBar />

    <main class="grow p-6">
      <div class="max-w-7xl mx-auto">
        <router-view></router-view>
      </div>
    </main>

  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
</script>