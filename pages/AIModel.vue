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
          <SidebarItem icon="settings" label="Settings" to="/Settings" />
          <SidebarItem icon="box" label="AI Items" active />
          <SidebarItem icon="database" label="Datasets" to="/Datasets" />
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
        <h2 class="text-lg font-semibold">AI Models Management</h2>
        <button
            @click="addNewModel"
            class="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600 text-sm">
          Add New Model
        </button>
      </header>

      <!-- Model List -->
      <div class="p-6 space-y-6 overflow-y-auto">
        <div
            v-for="(model, index) in models"
            :key="index"
            class="bg-[#181818] p-6 rounded-xl border border-gray-700 shadow space-y-4"
        >
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xl font-semibold">{{ model.name }}</h3>
              <p class="text-sm text-gray-400">Status: {{ model.status }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="train(model)" class="px-3 py-1 bg-blue-700 rounded hover:bg-blue-600 text-sm">Train</button>
              <button @click="load(model)" class="px-3 py-1 bg-green-700 rounded hover:bg-green-600 text-sm">Load</button>
              <button @click="save(model)" class="px-3 py-1 bg-yellow-700 rounded hover:bg-yellow-600 text-sm">Save</button>
              <button @click="reset(model)" class="px-3 py-1 bg-red-700 rounded hover:bg-red-600 text-sm">Reset</button>
            </div>
          </div>
          <p class="text-sm text-gray-400">{{ model.description }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SidebarItem from '@/components/SidebarItem.vue'

const models = ref([
  {
    name: 'DeepMedic',
    description: 'The DeepMedic algorithm is a deep learning-based model designed for semantic segmentation, specifically used in medical image analysis, such as brain tumor detection, by leveraging 3D convolutional neural networks to process and classify volumetric data.',
    status: 'Ready',
  },
  {
    name: 'SegNet',
    description: 'SegNet is a deep learning model for semantic image segmentation using an encoder-decoder architecture.',
    status: 'Trained',
  },
  {
    name: 'Slant',
    description: 'SLANT is a deep learning model designed for real-time semantic segmentation with a focus on improving accuracy and efficiency in edge devices..',
    status: 'Idle',
  },
  {
    name: 'Unet',
    description: 'U-Net is a convolutional neural network architecture designed for semantic segmentation, particularly in medical image analysis, using an encoder-decoder structure with skip connections for precise pixel-level predictions.',
    status: 'Ready',
  },
  {
    name: 'Vnet',
    description: 'ChatGPT a dit :\n' +
        'V-Net is a deep learning architecture for 3D image segmentation, using volumetric convolutions and an encoder-decoder structure with skip connections, primarily applied in medical imaging tasks.',
    status: 'Ready',
  },
])

const train = (model) => {
  model.status = 'Training...'
  setTimeout(() => (model.status = 'Trained'), 1500)
}

const load = (model) => {
  model.status = 'Loaded'
}

const save = (model) => {
  model.status = 'Saved'
}

const reset = (model) => {
  model.status = 'Reset'
}

const addNewModel = () => {
  const newModel = {
    name: prompt('Enter model name:'),
    description: prompt('Enter model description:'),
    status: 'Idle',
  }
  if (newModel.name && newModel.description) {
    models.value.push(newModel)
  }
}
</script>

<style scoped>
</style>
