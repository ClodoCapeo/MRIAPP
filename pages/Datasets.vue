<template>
  <div class="flex h-screen bg-black text-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-[#0F0F0F] p-4 flex flex-col justify-between">
      <div>
        <h1 class="text-xl font-bold mb-8">NeuroAI</h1>
        <nav class="space-y-4">
          <SidebarItem icon="cpu" label="Segmentation" to="/" />
          <SidebarItem icon="activity" label="Activity" to="/activity" />
          <SidebarItem icon="settings" label="Account" to="/Account" />
          <SidebarItem icon="settings" label="Settings" to="/settings" />
          <SidebarItem icon="box" label="AI Items" to="/AIModel" />
          <SidebarItem icon="database" label="Datasets" to="/datasets" active />
        </nav>
      </div>
      <div>
        <SidebarItem icon="log-out" label="Logout" />
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h2 class="text-lg font-semibold">Datasets</h2>
        <button
            @click="addNewDataset"
            class="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600 text-sm">
          Add New Dataset
        </button>
      </header>

      <!-- Dataset List -->
      <div class="p-6 space-y-4 overflow-y-auto">
        <div
            v-for="(dataset, index) in datasets"
            :key="index"
            class="bg-[#181818] p-5 rounded-xl border border-gray-700 shadow space-y-2"
        >
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold">{{ dataset.name }}</h3>
              <p class="text-sm text-gray-400">{{ dataset.description }}</p>
              <p class="text-xs text-gray-500 mt-1">Samples: {{ dataset.samples }}</p>
            </div>
            <div class="flex gap-2">
              <button class="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600 text-sm">View</button>
              <button class="bg-red-700 px-3 py-1 rounded hover:bg-red-600 text-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import SidebarItem from '@/components/SidebarItem.vue'

const datasets = [
  { name: 'BrainSet_A', description: 'Standard MRI dataset for training.', samples: 240 },
  { name: 'NeuroScan_03', description: 'Advanced multi-slice set.', samples: 180 },
  { name: 'ScanLab', description: 'Preprocessed MRI scans with annotations.', samples: 320 },
  { name: 'T1Data', description: 'T1-weighted MRI dataset.', samples: 140 },
  { name: 'FLAIR2025', description: 'FLAIR MRI scans with lesion annotations.', samples: 200 },
  { name: 'MixedNeuroSet', description: 'Combined dataset of multiple sources.', samples: 400 },
  { name: 'NeuroStack', description: 'Stacked volume sequences.', samples: 190 },
  { name: 'AxialSet', description: 'Axial slices from multiple institutions.', samples: 150 },
]

const addNewModel = () => {
  const newModel = {
    name: prompt('Enter dataset name:'),
    description: prompt('Enter dataset description:'),
    status: 'Idle',
  }
}
</script>

<style scoped>
</style>
