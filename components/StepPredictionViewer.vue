<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-medium mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
      </svg>
      Step {{ step }} Prediction Visualization
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 class="text-md font-medium mb-2">Prediction</h4>
        <volume-viewer
            :volume="predictionVolume"
            :is-segmentation="true"
            class="rounded-lg overflow-hidden"
        />
      </div>

      <div>
        <h4 class="text-md font-medium mb-2">Ground Truth</h4>
        <volume-viewer
            :volume="groundTruthVolume"
            :is-segmentation="true"
            :threshold="getThresholdForStep(step)"
            class="rounded-lg overflow-hidden"
        />
      </div>
    </div>

    <div class="mt-6">
      <h4 class="text-md font-medium mb-2">Overlay on T1</h4>
      <volume-viewer
          :volume="t1Volume"
          :overlay-volume="predictionVolume"
          class="rounded-lg overflow-hidden"
      />
    </div>

    <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h4 class="text-md font-medium mb-2">Step Information</h4>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Step Description:</p>
          <p class="font-medium">{{ getStepDescription(step) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400">Threshold Used:</p>
          <p class="font-medium">{{ getThresholdForStep(step) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import * as tf from '@tensorflow/tfjs';
import VolumeViewer from './VolumeViewer.vue';

const props = defineProps({
  step: {
    type: Number,
    required: true
  },
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
  },
  unetModel: {
    type: Object,
    default: null
  }
});

// State
const predictionVolume = ref(null);

// Computed properties
const getStepDescription = (step) => {
  switch (step) {
    case 1:
      return 'Binary segmentation of brain tissue (T1+T2 → Binary mask)';
    case 2:
      return 'Binary segmentation of white matter (T1+T2+Step1 → Binary mask)';
    case 3:
      return 'Multi-class segmentation (T1+T2+Step1+Step2 → 4 classes)';
    default:
      return 'Unknown step';
  }
};

const getThresholdForStep = (step) => {
  switch (step) {
    case 1:
      return 10; // As used in the Python code
    case 2:
      return 150; // As used in the Python code
    default:
      return 10;
  }
};

// Generate prediction based on step
const generatePrediction = async () => {
  if (!props.t1Volume || !props.t2Volume || !props.unetModel) {
    return;
  }

  try {
    // Generate prediction based on step
    if (props.step === 1) {
      // Step 1: Binary segmentation of brain
      predictionVolume.value = await props.unetModel.predictStep([props.t1Volume, props.t2Volume], 1);
    } else if (props.step === 2) {
      // Step 2: White matter segmentation
      predictionVolume.value = await props.unetModel.predictStep([props.t1Volume, props.t2Volume], 2);
    } else if (props.step === 3) {
      // Step 3: Multi-class segmentation
      predictionVolume.value = await props.unetModel.predictStep([props.t1Volume, props.t2Volume], 3);
    }
  } catch (error) {
    console.error(`Error generating prediction for step ${props.step}:`, error);
  }
};

// Watch for changes in props
watch(() => props.step, () => {
  generatePrediction();
});

watch(() => props.t1Volume, () => {
  if (props.t1Volume) {
    generatePrediction();
  }
});

// Lifecycle hooks
onMounted(() => {
  generatePrediction();
});
</script>
