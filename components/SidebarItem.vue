<template>
  <NuxtLink
      :to="to"
      class="block"
  >
    <div
        :class="[
        'flex items-center gap-3 px-4 py-2 rounded cursor-pointer hover:bg-gray-800',
        active ? 'bg-gray-800 text-white font-semibold' : 'text-gray-400'
      ]"
    >
      <i :class="`lucide-${icon}`"></i>
      <span>{{ label }}</span>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  active: Boolean,
  to: String
})
</script>