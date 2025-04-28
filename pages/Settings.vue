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
          <SidebarItem icon="settings" label="Settings" active />
          <SidebarItem icon="box" label="AI Items" to="/AIModel" />
          <SidebarItem icon="database" label="Datasets" to="/Datasets"/>
        </nav>
      </div>
      <div>
        <SidebarItem icon="log-out" label="Logout" />
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h2 class="text-lg font-semibold">Settings</h2>
      </header>

      <div class="p-8 space-y-6 overflow-y-auto">
        <div class="bg-[#181818] p-6 rounded-xl border border-gray-700 shadow space-y-4">
          <h3 class="text-xl font-semibold mb-2">Preferences</h3>

          <div class="space-y-2">
            <label class="block text-sm text-gray-400">Theme</label>
            <select class="bg-black border border-gray-700 rounded px-3 py-2 text-white w-full">
              <option>Dark</option>
              <option>Light</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm text-gray-400">Notifications</label>
            <select class="bg-black border border-gray-700 rounded px-3 py-2 text-white w-full">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm text-gray-400">Language</label>
            <select class="bg-black border border-gray-700 rounded px-3 py-2 text-white w-full">
              <option>English</option>
              <option>Français</option>
              <option>Deutsch</option>
            </select>
          </div>
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
