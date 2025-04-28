<template>
  <div class="flex h-screen bg-black text-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-[#0F0F0F] p-4 flex flex-col justify-between">
      <div>
        <h1 class="text-xl font-bold mb-8">NeuroAI</h1>
        <nav class="space-y-4">
          <SidebarItem icon="user" label="Segmentation" active />
          <SidebarItem icon="activity" label="Activity" to="/Activity"/>
          <SidebarItem icon="account" label="Account" to="/Account" />
          <SidebarItem icon="accountd" label="Settings" to="/Settings" />
          <SidebarItem icon="box" label="AI Items" to="/AIModel" />
          <SidebarItem icon="database" label="Datasets" to="/Datasets"/>
        </nav>
      </div>
      <div>
        <SidebarItem icon="log-out" label="Logout" />
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col">
      <!-- Topbar -->
      <header class="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h2 class="text-lg font-semibold">DICOM Segmentation</h2>
        <div class="flex items-center gap-4">
          <input type="text" placeholder="Search" class="bg-gray-900 rounded px-3 py-1.5 text-sm" />
          <div class="bg-gray-800 px-3 py-1.5 rounded">NeuroAl</div>
        </div>
      </header>

      <!-- Body -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Image View -->
        <section class="flex w-full flex-col justify-between p-0 overflow-auto bg-black">
          <div class="flex justify-center align-middle h-full items-center">
            <img src="/assets/brain-scan.jpg" alt="Brain Scan" class="max-h-[400px] rounded-lg shadow-xl border border-gray-700" />
          </div>

          <!-- Brain Controls Panel Below Image -->
          <div class="mt-10 bg-[#181818] p-6 shadow-md">
            <h3 class="text-xl font-semibold mb-6">Analyse & Contrôle du Scanner</h3>

            <div class="grid grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium mb-2">🔍 Zoom</label>
                <input type="range" min="1" max="10" class="w-full accent-cyan-500" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">🧭 Coupe</label>
                <select class="w-full bg-gray-900 px-3 py-2 rounded">
                  <option>Axiale</option>
                  <option>Coronale</option>
                  <option>Sagittale</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">📐 Plan</label>
                <select class="w-full bg-gray-900 px-3 py-2 rounded">
                  <option>Standard</option>
                  <option>FLAIR</option>
                  <option>T1</option>
                  <option>T2</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">🧬 Mode 3D</label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" class="toggle toggle-sm" />
                  Activer
                </label>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium mb-2">Explication IA</label>
                <textarea class="w-full bg-gray-900 px-3 py-2 rounded h-24 text-sm" placeholder="Résumé généré par le modèle d’IA, incluant détection de lésions, segmentation, etc..." />
              </div>
            </div>
          </div>
        </section>

        <!-- Settings Panel -->
        <aside class="w-[380px] border-l border-gray-800 p-6 space-y-6 bg-[#0F0F0F]">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">NeuralNet Segmentation</h3>
            <input type="checkbox" class="toggle toggle-sm" checked />
          </div>

          <!-- Slider controls -->
          <div>
            <label class="block text-sm font-medium mb-1">Time Model</label>
            <input type="range" class="w-full" />
            <input type="range" class="w-full" />
          </div>

          <!-- Dropdown for Networks -->
          <div>
            <label class="block text-sm font-medium mb-1">Networks</label>
            <select class="w-full bg-gray-900 px-3 py-2 rounded">
              <option>AI Mixer feed x8 Transformation</option>
            </select>
          </div>

          <!-- Radio + Toggle -->
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium">User AI Protocol</label>
              <select class="w-full bg-gray-900 px-3 py-2 rounded">
                <option>Pre. AI Fusion Hologrammode</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium">Cerebral Origin</label>
              <label class="flex items-center gap-2 mt-1">
                <input type="checkbox" class="toggle toggle-sm" checked />
                Lobe confirmed
              </label>
            </div>
          </div>

          <!-- Method Selection (from /AI_method folder) -->
          <div>
            <label class="block text-sm font-medium mb-1">Method</label>
            <select class="w-full bg-gray-900 px-3 py-2 rounded">
              <option v-for="method in methods" :key="method" :value="method">
                {{ method }}
              </option>
            </select>
          </div>

          <!-- Dataset Selection (from /Data folder) -->
          <div>
            <label class="block text-sm font-medium mb-1">Dataset</label>
            <select class="w-full bg-gray-900 px-3 py-2 rounded">
              <option v-for="dataset in datasets" :key="dataset" :value="dataset">
                {{ dataset }}
              </option>
            </select>
          </div>

          <!-- Training or Test Selection -->
          <div>
            <label class="block text-sm font-medium mb-1">Mode</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2">
                <input type="radio" name="mode" class="text-cyan-500" value="training" checked />
                Training
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="mode" class="text-cyan-500" value="test" />
                Test
              </label>
            </div>
          </div>

        </aside>

      </div>
    </main>
  </div>
</template>

<script setup>
import SidebarItem from '@/components/SidebarItem.vue'

import { ref, onMounted } from 'vue';

// Variables pour stocker les options de méthode et de dataset
const methods = ref([]);
const datasets = ref([]);

// Fonction pour récupérer les méthodes et datasets depuis l'API
async function fetchData() {
  try {
    // Récupérer les méthodes depuis l'API
    const methodResponse = await fetch('api/ai-methods');
    methods.value = await methodResponse.json();

    // Récupérer les datasets depuis l'API
    const datasetResponse = await fetch('/api/datasets');
    datasets.value = await datasetResponse.json();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Charger les données au montage du composant
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.toggle {
  appearance: none;
  width: 32px;
  height: 16px;
  background: #333;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
}
.toggle:checked {
  background: #3b82f6;
}
.toggle::before {
  content: "";
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 9999px;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}
.toggle:checked::before {
  transform: translateX(16px);
}
</style>