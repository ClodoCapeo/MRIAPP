<template>
  <div class="flex h-screen bg-black text-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-[#0F0F0F] p-4 flex flex-col justify-between">
      <div>
        <h1 class="text-xl font-bold mb-8">NeuroAI</h1>
        <nav class="space-y-4">
          <SidebarItem icon="cpu" label="Segmentation" to="/" />
          <SidebarItem icon="activity" label="Activity" to="/Activity" active />
          <SidebarItem icon="settings" label="Account" to="/Account" />
          <SidebarItem icon="account" label="Settings" to="/Settings" />
          <SidebarItem icon="box" label="AI Items" to="/AIModel" />
          <SidebarItem icon="database" label="Datasets" to="/datasets" />
        </nav>
      </div>
      <div>
        <SidebarItem icon="log-out" label="Logout" />
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h2 class="text-lg font-semibold">Activity - Historique des Segmentations</h2>
      </header>

      <!-- Scrollable Content Box -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div
            v-for="(item, index) in paginatedItems"
            :key="index"
            class="bg-[#181818] p-4 rounded shadow border border-gray-700"
        >
          <h3 class="font-semibold text-base mb-1">Segmentation #{{ index + 1 + (currentPage - 1) * itemsPerPage }}</h3>
          <p class="text-sm text-gray-400">Date: {{ item.date }}</p>
          <p class="text-sm text-gray-400">Méthode: {{ item.method }}</p>
          <p class="text-sm text-gray-400">Dataset: {{ item.dataset }}</p>
          <p class="text-sm text-gray-400">Mode: {{ item.mode }}</p>
        </div>
      </div>

      <!-- Pagination Controls -->
      <footer class="border-t border-gray-800 px-6 py-4 flex justify-center gap-3">
        <button
            class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
            @click="previousPage"
            :disabled="currentPage === 1"
        >
          Prev
        </button>
        <span class="px-2">Page {{ currentPage }} / {{ totalPages }}</span>
        <button
            class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
            @click="nextPage"
            :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SidebarItem from '@/components/SidebarItem.vue'

const allHistory = [
  { date: '2025-04-01', method: 'UNet-V2', dataset: 'BrainSet_A', mode: 'training' },
  { date: '2025-04-02', method: 'DeepSeg-Alpha', dataset: 'NeuroScan_03', mode: 'test' },
  { date: '2025-04-03', method: 'VisionMixer', dataset: 'ScanLab', mode: 'training' },
  { date: '2025-04-04', method: 'HoloNet', dataset: 'T1Data', mode: 'training' },
  { date: '2025-04-05', method: 'UNet-V2', dataset: 'BrainSet_B', mode: 'test' },
  { date: '2025-04-06', method: 'DeepSeg-Alpha', dataset: 'NeuroScan_03', mode: 'training' },
  { date: '2025-04-07', method: 'VisionMixer', dataset: 'ScanLab', mode: 'test' },
  { date: '2025-04-08', method: 'HoloNet', dataset: 'T2Data', mode: 'test' },
  { date: '2025-04-09', method: 'UNet-V2', dataset: 'FLAIR2025', mode: 'training' },
  { date: '2025-04-10', method: 'DeepSeg-Alpha', dataset: 'MixedNeuroSet', mode: 'test' },
  { date: '2025-04-11', method: 'DeepSeg-X', dataset: 'NeuroStack', mode: 'training' },
  { date: '2025-04-12', method: 'UNet-V3', dataset: 'AxialSet', mode: 'test' },
]

const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(allHistory.length / itemsPerPage))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return allHistory.slice(start, start + itemsPerPage)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
</script>

<style scoped>
</style>