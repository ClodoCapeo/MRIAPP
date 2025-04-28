<template>
  <div class="flex h-screen bg-black text-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-[#0F0F0F] p-4 flex flex-col justify-between">
      <div>
        <h1 class="text-xl font-bold mb-8">NeuroAI</h1>
        <nav class="space-y-4">
          <SidebarItem icon="cpu" label="Segmentation" to="/" />
          <SidebarItem icon="activity" label="Activity" to="/activity" />
          <SidebarItem icon="user" label="Account" active />
          <SidebarItem icon="settings" label="Settings" to="/Settings"/>
          <SidebarItem icon="box" label="AI Items" to="/AIModel"/>
          <SidebarItem icon="database" label="Datasets" to="/datasets" />
        </nav>
      </div>
      <div>
        <SidebarItem icon="log-out" label="Logout" />
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h2 class="text-lg font-semibold">Account</h2>
      </header>

      <div class="p-8 space-y-6 overflow-y-auto">
        <div class="bg-[#181818] p-6 rounded-xl border border-gray-700 shadow space-y-3">
          <h3 class="text-xl font-semibold">User Profile</h3>
          <p><span class="text-gray-400">Name:</span> Alex Neuro</p>
          <p><span class="text-gray-400">Email:</span> alex@neuroai.org</p>
          <p><span class="text-gray-400">Role:</span> AI Researcher</p>
          <p><span class="text-gray-400">Member since:</span> March 2024</p>
        </div>

        <div class="bg-[#181818] p-6 rounded-xl border border-gray-700 shadow space-y-3">
          <h3 class="text-xl font-semibold">Recent Activity</h3>
          <ul class="list-disc list-inside text-gray-400">
            <li>Launched segmentation with UNet-V3</li>
            <li>Modified settings on DeepSeg Alpha</li>
            <li>Viewed dataset FLAIR2025</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import SidebarItem from '@/components/SidebarItem.vue'
</script>

<style scoped>
</style>
