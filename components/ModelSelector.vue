<template>
  <div class="bg-[#181818] p-4 rounded-md w-full">
    <h2 class="text-xl font-bold mb-4">Model Selection</h2>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Active Model</label>
        <div class="flex flex-col space-y-2">
          <div
              v-for="(label, type) in modelLabels"
              :key="type"
              class="flex items-center"
          >
            <input
                type="radio"
                :id="`model-${type}`"
                :value="type"
                v-model="selectedModel"
                class="mr-2"
            />
            <label :for="`model-${type}`" class="flex-1">
              <div class="font-medium">{{ label.name }}</div>
              <div class="text-xs text-gray-400">{{ label.description }}</div>
            </label>
          </div>
        </div>
      </div>

      <div v-if="selectedModel === MODEL_TYPES.ISEG_WINNER" class="bg-gray-800 p-3 rounded-md text-sm">
        <p class="font-medium text-cyan-400">iSeg-2017 Challenge Winner Model</p>
        <p class="mt-1 text-gray-300">This pre-trained model was the winner of the iSeg-2017 Challenge for infant brain MRI segmentation.</p>
        <ul class="mt-2 list-disc list-inside text-gray-400">
          <li>Optimized for T1 and T2 infant brain MRI</li>
          <li>Achieves state-of-the-art performance</li>
          <li>Dice coefficient: ~0.95 for WM, ~0.92 for GM, ~0.93 for CSF</li>
        </ul>
      </div>

      <div v-if="selectedModel === MODEL_TYPES.CUSTOM" class="bg-gray-800 p-3 rounded-md text-sm">
        <p class="font-medium" :class="modelTrained ? 'text-green-400' : 'text-yellow-400'">
          {{ modelTrained ? 'Custom Trained Model' : 'Custom Model (Not Trained)' }}
        </p>
        <p class="mt-1 text-gray-300">
          {{ modelTrained
            ? 'This model has been trained on your custom data.'
            : 'This model needs to be trained before it can be used effectively.' }}
        </p>
        <div v-if="!modelTrained" class="mt-2">
          <button
              @click="goToTraining"
              class="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-xs"
          >
            Go to Training
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import modelService, { MODEL_TYPES } from '@/services/model-service';

const emit = defineEmits(['model-changed', 'go-to-training']);

const props = defineProps({
  modelTrained: {
    type: Boolean,
    default: false
  }
});

const selectedModel = ref(MODEL_TYPES.ISEG_WINNER);
const modelLabels = {
  [MODEL_TYPES.ISEG_WINNER]: {
    name: 'iSeg-2017 Challenge Winner',
    description: 'Pre-trained model optimized for infant brain segmentation'
  },
  [MODEL_TYPES.CUSTOM]: {
    name: 'Custom Trained Model',
    description: 'Model trained on your own data'
  }
};

// Initialize with the current active model
onMounted(() => {
  selectedModel.value = modelService.getActiveModelType();
});

// Watch for changes in the selected model
watch(selectedModel, async (newModel) => {
  try {
    modelService.setActiveModel(newModel);
    emit('model-changed', newModel);
  } catch (error) {
    console.error('Error changing model:', error);
    // Revert to previous selection if there was an error
    selectedModel.value = modelService.getActiveModelType();
  }
});

// Function to navigate to training section
const goToTraining = () => {
  emit('go-to-training');
};
</script>
