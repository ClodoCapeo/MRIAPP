<template>
  <div v-if="t1Volume || t2Volume || groundTruthVolume" class="bg-[#181818] p-4 rounded-md mt-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">Debug Information</h3>
      <button 
        @click="isExpanded = !isExpanded"
        class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
      >
        {{ isExpanded ? "Hide Details" : "Show Details" }}
      </button>
    </div>

    <div v-if="isExpanded" class="space-y-4">
      <div v-if="t1Volume">
        <h4 class="font-medium mb-1">T1 Volume</h4>
        <pre class="bg-gray-800 p-2 rounded-md text-xs overflow-x-auto">
          {{ JSON.stringify({
            dimensions: t1Volume.header.dimensions,
            dataType: t1Volume.header.dataTypeString,
            pixelDimensions: t1Volume.header.pixelDimensions,
            min: t1Volume.min,
            max: t1Volume.max,
          }, null, 2) }}
        </pre>
      </div>

      <div v-if="t2Volume">
        <h4 class="font-medium mb-1">T2 Volume</h4>
        <pre class="bg-gray-800 p-2 rounded-md text-xs overflow-x-auto">
          {{ JSON.stringify({
            dimensions: t2Volume.header.dimensions,
            dataType: t2Volume.header.dataTypeString,
            pixelDimensions: t2Volume.header.pixelDimensions,
            min: t2Volume.min,
            max: t2Volume.max,
          }, null, 2) }}
        </pre>
      </div>

      <div v-if="groundTruthVolume">
        <h4 class="font-medium mb-1">Ground Truth Volume</h4>
        <pre class="bg-gray-800 p-2 rounded-md text-xs overflow-x-auto">
          {{ JSON.stringify({
            dimensions: groundTruthVolume.header.dimensions,
            dataType: groundTruthVolume.header.dataTypeString,
            pixelDimensions: groundTruthVolume.header.pixelDimensions,
            min: groundTruthVolume.min,
            max: groundTruthVolume.max,
          }, null, 2) }}
        </pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  t1Volume: {
    type: Object,
    default: null
  },
  t2Volume: {
    type: Object,
    default: null
  },
  groundTruthVolume: {
    type: Object,
    default: null
  }
});

const isExpanded = ref(false);
</script>
