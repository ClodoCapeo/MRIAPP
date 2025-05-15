<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">NeuralNet Segmentation</h3>
      <input type="checkbox" v-model="enableSegmentation" class="toggle toggle-sm" />
    </div>

    <!-- Model Training Progress -->
    <div v-if="isTraining">
      <label class="block text-sm font-medium mb-1">Training Progress</label>
      <div class="w-full bg-gray-800 rounded-full h-2 mb-1">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          :style="{ width: `${trainingProgress}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-gray-400">
        <span>Epoch: {{ currentEpoch }}/{{ totalEpochs }}</span>
        <span>{{ trainingProgress.toFixed(1) }}%</span>
      </div>
    </div>

    <!-- Slider controls -->
    <div>
      <label class="block text-sm font-medium mb-1">Training Epochs</label>
      <input
        type="range"
        v-model="totalEpochs"
        min="10"
        max="200"
        step="10"
        class="w-full accent-cyan-500"
        :disabled="isTraining"
      />
      <div class="flex justify-between text-xs text-gray-400">
        <span>10</span>
        <span>{{ totalEpochs }}</span>
        <span>200</span>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Early Stopping Patience</label>
      <input
        type="range"
        v-model="patience"
        min="5"
        max="30"
        step="1"
        class="w-full accent-cyan-500"
        :disabled="isTraining"
      />
      <div class="flex justify-between text-xs text-gray-400">
        <span>5</span>
        <span>{{ patience }}</span>
        <span>30</span>
      </div>
    </div>

    <!-- Dropdown for Networks -->
    <div>
      <label class="block text-sm font-medium mb-1">Network Architecture</label>
      <select
        v-model="networkArchitecture"
        class="w-full bg-gray-900 px-3 py-2 rounded"
        :disabled="isTraining"
      >
        <option value="unet">U-Net</option>
        <option value="unet-enhanced">Enhanced U-Net (Cascaded)</option>
        <option value="ai-mixer">AI Mixer feed x8 Transformation</option>
      </select>
    </div>

    <!-- Method Selection -->
    <div>
      <label class="block text-sm font-medium mb-1">Training Step</label>
      <select
        v-model="currentStep"
        class="w-full bg-gray-900 px-3 py-2 rounded"
        :disabled="isTraining || networkArchitecture !== 'unet-enhanced'"
      >
        <option :value="1">Step 1: Brain Segmentation</option>
        <option :value="2">Step 2: White Matter Segmentation</option>
        <option :value="3">Step 3: Multi-class Segmentation</option>
      </select>
    </div>

    <!-- Dataset Selection -->
    <div>
      <label class="block text-sm font-medium mb-1">Dataset</label>
      <select
        v-model="selectedDataset"
        class="w-full bg-gray-900 px-3 py-2 rounded"
        :disabled="isTraining"
      >
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
          <input
            type="radio"
            v-model="mode"
            value="training"
            class="text-cyan-500"
            :disabled="isTraining"
          />
          Training
        </label>
        <label class="flex items-center gap-2">
          <input
            type="radio"
            v-model="mode"
            value="test"
            class="text-cyan-500"
            :disabled="isTraining"
          />
          Test
        </label>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button
        @click="startTraining"
        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        :disabled="isTraining || !canTrain"
      >
        {{ isTraining ? 'Training...' : 'Train Model' }}
      </button>

      <button
        @click="runSegmentation"
        class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        :disabled="isTraining || !canSegment"
      >
        Run Segmentation
      </button>
    </div>

    <!-- Training Logs -->
    <div v-if="trainingLogs.length > 0">
      <label class="block text-sm font-medium mb-1">Training Logs</label>
      <div class="bg-gray-900 p-2 rounded h-40 overflow-y-auto text-xs font-mono">
        <div v-for="(log, index) in trainingLogs" :key="index" class="mb-1">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as tf from '@tensorflow/tfjs';

// Props
const props = defineProps({
  t1Volume: Object,
  t2Volume: Object,
  groundTruthVolume: Object
});

// Emits
const emit = defineEmits(['segmentationComplete']);

// State variables
const enableSegmentation = ref(true);
const isTraining = ref(false);
const trainingProgress = ref(0);
const currentEpoch = ref(0);
const totalEpochs = ref(100);
const patience = ref(10);
const networkArchitecture = ref('unet-enhanced');
const currentStep = ref(1);
const selectedDataset = ref('iSeg-2017');
const mode = ref('training');
const trainingLogs = ref([]);
const modelTrained = ref(false);

// Dummy datasets for demo
const datasets = ref([
  'iSeg-2017',
  'BraTS-2021',
  'ADNI',
  'Custom Dataset'
]);

// Computed properties
const canTrain = computed(() => {
  return props.t1Volume && props.t2Volume && props.groundTruthVolume;
});

const canSegment = computed(() => {
  return props.t1Volume && props.t2Volume && (modelTrained.value || props.groundTruthVolume);
});

// Methods
const startTraining = async () => {
  if (!canTrain.value) {
    trainingLogs.value.push('Error: Missing required volumes for training');
    return;
  }

  isTraining.value = true;
  trainingProgress.value = 0;
  currentEpoch.value = 0;
  trainingLogs.value.push(`Starting training for ${networkArchitecture.value} - Step ${currentStep.value}...`);

  try {
    // Initialize TensorFlow.js
    await tf.ready();
    trainingLogs.value.push('TensorFlow.js initialized');

    // Simulate training process
    for (let epoch = 0; epoch < totalEpochs.value; epoch++) {
      // Check if we should stop early (random for demo)
      if (Math.random() < 0.01 && epoch > totalEpochs.value / 2) {
        trainingLogs.value.push(`Early stopping triggered at epoch ${epoch + 1}`);
        break;
      }

      // Update progress
      currentEpoch.value = epoch + 1;
      trainingProgress.value = ((epoch + 1) / totalEpochs.value) * 100;

      // Simulate epoch training
      await new Promise(resolve => setTimeout(resolve, 100));

      // Log progress
      if ((epoch + 1) % 10 === 0 || epoch === 0 || epoch === totalEpochs.value - 1) {
        const loss = (0.5 - 0.4 * (epoch / totalEpochs.value)).toFixed(4);
        const accuracy = (0.5 + 0.4 * (epoch / totalEpochs.value)).toFixed(4);
        trainingLogs.value.push(`Epoch ${epoch + 1}/${totalEpochs.value} - loss: ${loss} - accuracy: ${accuracy}`);
      }
    }

    trainingLogs.value.push(`Training complete for Step ${currentStep.value}!`);
    modelTrained.value = true;

    // If we're using the enhanced U-Net and not at step 3 yet, suggest moving to next step
    if (networkArchitecture.value === 'unet-enhanced' && currentStep.value < 3) {
      trainingLogs.value.push(`Ready for Step ${currentStep.value + 1}`);
    }
  } catch (error) {
    console.error('Training error:', error);
    trainingLogs.value.push(`Error during training: ${error.message}`);
  } finally {
    isTraining.value = false;
    trainingProgress.value = 100;
  }
};

const runSegmentation = async () => {
  if (!canSegment.value) {
    trainingLogs.value.push('Error: Missing required volumes for segmentation');
    return;
  }

  trainingLogs.value.push('Running segmentation...');

  try {
    // Simulate segmentation process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, we'll just use the ground truth as the segmentation result
    // In a real implementation, you would use the trained model to generate a segmentation
    emit('segmentationComplete', props.groundTruthVolume);

    trainingLogs.value.push('Segmentation complete!');
  } catch (error) {
    console.error('Segmentation error:', error);
    trainingLogs.value.push(`Error during segmentation: ${error.message}`);
  }
};
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