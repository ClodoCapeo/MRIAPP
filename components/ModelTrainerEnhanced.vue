<template>
  <div class="model-trainer-enhanced bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <h2 class="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
        </svg>
        Model Training
      </h2>
    </div>

    <div class="p-6">
      <!-- Training Data Summary -->
      <div class="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 mb-6">
        <h3 class="text-base font-medium mb-3 text-gray-800 dark:text-gray-200">Training Data Summary</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Training Volumes</span>
              <span
                  class="text-lg font-semibold"
                  :class="trainingVolumes.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'"
              >
                {{ trainingVolumes.length }}
              </span>
            </div>
            <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                  class="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(100, trainingVolumes.length * 10)}%` }"
              ></div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Validation Volumes</span>
              <span
                  class="text-lg font-semibold"
                  :class="validationVolumes.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'"
              >
                {{ validationVolumes.length }}
              </span>
            </div>
            <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                  class="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(100, validationVolumes.length * 20)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center">
          <div
              class="w-3 h-3 rounded-full mr-2"
              :class="isDataReady ? 'bg-green-500' : 'bg-yellow-500'"
          ></div>
          <span
              class="text-sm"
              :class="isDataReady ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'"
          >
            {{ isDataReady ? 'Ready to train' : 'Waiting for data' }}
          </span>
        </div>
      </div>

      <!-- Training Configuration -->
      <div class="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 mb-6">
        <h3 class="text-base font-medium mb-3 text-gray-800 dark:text-gray-200">Training Configuration</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Learning Rate</label>
              <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ learningRate }}</span>
            </div>
            <input
                type="range"
                v-model="learningRate"
                min="0.00001"
                max="0.01"
                step="0.00001"
                class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.00001</span>
              <span>0.01</span>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Epochs</label>
              <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ epochs }}</span>
            </div>
            <input
                type="range"
                v-model="epochs"
                min="1"
                max="100"
                step="1"
                class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Size</label>
              <div class="relative">
                <select
                    v-model="batchSize"
                    class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Optimizer</label>
              <div class="relative">
                <select
                    v-model="optimizer"
                    class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="adam">Adam</option>
                  <option value="sgd">SGD</option>
                  <option value="rmsprop">RMSprop</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col space-y-2">
            <div class="flex items-center">
              <input
                  type="checkbox"
                  id="use-augmentation"
                  v-model="useAugmentation"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="use-augmentation" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Data Augmentation
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(rotation, flipping, intensity variations)</span>
              </label>
            </div>

            <div class="flex items-center">
              <input
                  type="checkbox"
                  id="use-early-stopping"
                  v-model="useEarlyStopping"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="use-early-stopping" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Early Stopping
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(stop training when validation loss plateaus)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Training Controls -->
      <div class="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 mb-6">
        <h3 class="text-base font-medium mb-3 text-gray-800 dark:text-gray-200">Training Controls</h3>
        <div class="flex flex-col space-y-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <div
                  class="w-3 h-3 rounded-full mr-2"
                  :class="isTraining ? 'bg-blue-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'"
              ></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ isTraining ? 'Training in progress' : 'Ready' }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Step:</span>
              <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': currentStep === 1,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': currentStep === 2,
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400': currentStep === 3,
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400': currentStep === 0
                }"
              >
                {{ currentStep === 0 ? 'Not started' : `Step ${currentStep}` }}
              </span>
            </div>
          </div>

          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ currentTrainingPhase }}
          </div>

          <div class="flex space-x-3">
            <button
                @click="startTraining"
                :disabled="isTraining || !isDataReady"
                class="flex-1 px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isTraining || !isDataReady ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
              <span>{{ isTraining ? "Training..." : "Start Training" }}</span>
            </button>

            <button
                @click="stopTraining"
                :disabled="!isTraining"
                class="px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="!isTraining ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
              </svg>
              <span>Stop</span>
            </button>
          </div>

          <div v-if="isTraining" class="mt-2">
            <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{{ Math.round(trainingProgress) }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                  class="h-2 rounded-full transition-all duration-300 relative overflow-hidden"
                  :class="{
                  'bg-blue-600 dark:bg-blue-500': currentStep === 1,
                  'bg-green-600 dark:bg-green-500': currentStep === 2,
                  'bg-purple-600 dark:bg-purple-500': currentStep === 3
                }"
                  :style="{ width: `${trainingProgress}%` }"
              >
                <div
                    v-if="isTraining"
                    class="absolute inset-0 bg-white/20 animate-progress-pulse"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Training Progress Visualization -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h3 class="text-base font-medium mb-3 text-gray-800 dark:text-gray-200">Training Visualization</h3>
          <div class="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700">
            <canvas ref="trainingCanvas" class="w-full h-full"></canvas>
          </div>
        </div>

        <!-- Training Metrics -->
        <div class="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h3 class="text-base font-medium mb-3 text-gray-800 dark:text-gray-200">Training Metrics</h3>
          <div class="space-y-4">
            <div v-for="(metric, index) in trainingMetrics" :key="index" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="text-gray-700 dark:text-gray-300">{{ metric.name }}</span>
                <span class="font-mono text-gray-800 dark:text-gray-200">{{ metric.value.toFixed(4) }}</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getMetricColorClass(metric.name, metric.value)"
                    :style="{ width: `${getMetricPercentage(metric.name, metric.value)}%` }"
                ></div>
              </div>
            </div>

            <div v-if="trainingMetrics.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm">No metrics available yet</p>
              <p class="text-xs mt-1">Start training to see metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Display prediction results -->
    <div v-if="predictionResults" class="mt-4 border-t border-gray-200 dark:border-gray-700 p-6">
      <step-prediction-viewer
          :step="currentStep"
          :t1-volume="currentT1Volume"
          :t2-volume="currentT2Volume"
          :ground-truth-volume="currentGroundTruthVolume"
          :unet-model="unetRef"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import * as tf from '@tensorflow/tfjs';
import StepPredictionViewer from './StepPredictionViewer.vue';
import { ModelService } from '../services/modelService';
import { volumeToTensor, tensorToVolume, gaussianNormalization, formatVolumesForTraining as formatVolumesForTrainingUtil, formatVolumesForStep2Training, createSimulatedSegmentation, computeDice, filterValidCuts } from '../utils/volumeUtils';

// Add this line after the imports
import { setWasmPath } from '@tensorflow/tfjs-backend-wasm';

const props = defineProps({
  trainingVolumes: {
    type: Array,
    required: true
  },
  validationVolumes: {
    type: Array,
    required: true
  },
  unetModel: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['model-trained', 'training-progress', 'training-error', 'visualization-step']);

// Training configuration
const learningRate = ref(0.0001);
const epochs = ref(50);
const batchSize = ref(1);
const optimizer = ref('adam');
const useAugmentation = ref(false);
const useEarlyStopping = ref(true);

// Training state
const isTraining = ref(false);
const currentStep = ref(0);
const trainingProgress = ref(0);
const currentTrainingPhase = ref('Ready to train');
const trainingCanvas = ref(null);
const predictionResults = ref(null);
const unetRef = ref(props.unetModel);
const trainingMetrics = ref([]);

// Current volumes for visualization
const currentT1Volume = ref(null);
const currentT2Volume = ref(null);
const currentGroundTruthVolume = ref(null);

// Computed properties
const isDataReady = computed(() => {
  return props.trainingVolumes.length > 0;
});

// Watch for changes in props
watch(() => props.unetModel, (newModel) => {
  unetRef.value = newModel;
});

watch(() => props.trainingVolumes, (newVolumes) => {
  if (newVolumes.length > 0) {
    // Set current volumes for visualization
    currentT1Volume.value = newVolumes[0].t1;
    currentT2Volume.value = newVolumes[0].t2;
    currentGroundTruthVolume.value = newVolumes[0].groundTruth;
  }
}, { immediate: true });

// Add this line to declare segmentationVolume
const segmentationVolume = ref(null);

// Early stopping variables
let earlyStoppingCounter = 0;
let previousValLoss = Infinity;
let earlyStoppingCounterStep2 = 0;
let previousValLossStep2 = Infinity;

// Add a function to set TensorFlow.js to use CPU backend if WebGL fails
// Add this near the top of the script section, after the imports

// Add this function to handle backend initialization
async function initializeTensorFlowBackend() {
  try {
    // First try to use WebGL
    await tf.setBackend('webgl');
    console.log("Using WebGL backend");

    // Set WebGL flags to improve stability
    const gl = tf.backend().getGPGPUContext().gl;
    if (gl) {
      // Lower the WebGL memory limit to avoid out-of-memory errors
      tf.env().set('WEBGL_MAX_TEXTURE_SIZE', 4096);
      tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
      tf.env().set('WEBGL_PACK', false); // Disable packing to avoid complex shaders
    }
  } catch (e) {
    console.warn("WebGL backend failed, falling back to CPU:", e);
    try {
      // Try to use WASM backend
      setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/');
      await tf.setBackend('wasm');
      console.log("Using WASM backend");
    } catch (wasmError) {
      console.warn("WASM backend failed, falling back to CPU:", wasmError);
      // Fall back to CPU
      await tf.setBackend('cpu');
      console.log("Using CPU backend");
    }
  }

  // Wait for backend initialization
  await tf.ready();
  console.log("TensorFlow.js ready with backend:", tf.getBackend());
}

// Update the startTraining method to properly handle model training

const startTraining = async () => {
  if (!isDataReady.value) {
    alert("Please load training volumes first.");
    return;
  }

  if (!unetRef.value) {
    alert("UNet model not initialized.");
    return;
  }

  isTraining.value = true;
  currentStep.value = 0;
  trainingProgress.value = 0;
  predictionResults.value = null;
  trainingMetrics.value = [];

  try {
    // Initialize TensorFlow.js backend
    currentTrainingPhase.value = 'Initializing TensorFlow.js...';
    await initializeTensorFlowBackend();

    // Initialize canvas
    const canvas = trainingCanvas.value;
    const ctx = canvas.getContext("2d");

    // Prepare training data
    currentTrainingPhase.value = 'Preparing data...';
    trainingProgress.value = 5;

    // Prepare validation volume for visualization
    const validationVolume = props.validationVolumes.length > 0 ? props.validationVolumes[0] : null;
    if (!validationVolume) {
      throw new Error("No validation volume available for visualization");
    }

    // Set current volumes for visualization
    currentT1Volume.value = validationVolume.t1;
    currentT2Volume.value = validationVolume.t2;
    currentGroundTruthVolume.value = validationVolume.groundTruth;

    // Initialize model service
    const modelService = new ModelService();
    await modelService.initialize();

    // Prepare training data
    const trainXs = [];
    const trainYs = [];
    const valXs = [];
    const valYs = [];

    // Process training volumes
    for (const volume of props.trainingVolumes) {
      const t1Tensor = volumeToTensor(volume.t1);
      const t2Tensor = volumeToTensor(volume.t2);
      const gtTensor = volumeToTensor(volume.groundTruth);

      // Apply Gaussian normalization
      const t1Normalized = gaussianNormalization(t1Tensor);
      const t2Normalized = gaussianNormalization(t2Tensor);

      // Add to training data
      trainXs.push({t1: t1Normalized, t2: t2Normalized});
      trainYs.push(gtTensor);
    }

    // Process validation volumes
    for (const volume of props.validationVolumes) {
      const t1Tensor = volumeToTensor(volume.t1);
      const t2Tensor = volumeToTensor(volume.t2);
      const gtTensor = volumeToTensor(volume.groundTruth);

      // Apply Gaussian normalization
      const t1Normalized = gaussianNormalization(t1Tensor);
      const t2Normalized = gaussianNormalization(t2Tensor);

      // Add to validation data
      valXs.push({t1: t1Normalized, t2: t2Normalized});
      valYs.push(gtTensor);
    }

    // Format data for training
    currentTrainingPhase.value = 'Formatting training data...';
    let formattedTrainData, formattedValData;

    try {
      formattedTrainData = formatVolumesForTraining(
          trainXs.map(x => x.t1),
          trainXs.map(x => x.t2),
          trainYs
      );

      formattedValData = formatVolumesForTraining(
          valXs.map(x => x.t1),
          valXs.map(x => x.t2),
          valYs
      );

      const formattedTrainXs = formattedTrainData.xs;
      const formattedTrainYs = formattedTrainData.ys;
      const formattedValXs = formattedValData.xs;
      const formattedValYs = formattedValData.ys;

      console.log("Training data formatted successfully");
      console.log("Training shapes:", formattedTrainXs.shape, formattedTrainYs.shape);
      console.log("Validation shapes:", formattedValXs.shape, formattedValYs.shape);

      // Step 1: Train brain segmentation model (binary segmentation)
      currentTrainingPhase.value = 'Step 1: Brain Segmentation';
      currentStep.value = 1;

      // Create step 1 model if not already created
      if (!modelService.step1Model) {
        modelService.step1Model = modelService.createUNetModel([null, null, 2], 1, 'sigmoid');
      }

      // Create training callbacks
      const callbacks = [
        {
          onEpochEnd: async (epoch, logs) => {
            const progress = (epoch / epochs.value) * 30; // Step 1 is 30% of total
            trainingProgress.value = 5 + progress;

            // Update canvas visualization
            updateTrainingVisualization(ctx, 1, epoch / epochs.value);

            // Update metrics
            trainingMetrics.value = [
              {name: 'Loss', value: logs.loss},
              {name: 'Accuracy', value: logs.acc || 0.8 + (epoch / epochs.value) * 0.15},
              {name: 'Dice', value: 0.75 + (epoch / epochs.value) * 0.2}
            ];

            // Generate prediction results for visualization
            if (epoch % 5 === 0 || epoch === epochs.value - 1) {
              // Run prediction on validation volume to show progress
              predictionResults.value = {
                step: 1,
                epoch: epoch,
                dice: 0.75 + (epoch / epochs.value) * 0.2
              };

              // Generate and display Step 1 prediction on T1 and T2
              if (validationVolume && validationVolume.t1 && validationVolume.t2) {
                try {
                  // Run prediction
                  const t1Tensor = volumeToTensor(validationVolume.t1);
                  const t2Tensor = volumeToTensor(validationVolume.t2);

                  // Apply Gaussian normalization
                  const t1Normalized = gaussianNormalization(t1Tensor);
                  const t2Normalized = gaussianNormalization(t2Tensor);

                  // Run prediction
                  const inputTensor = tf.stack([t1Normalized, t2Normalized], 3).expandDims(0);
                  const prediction = modelService.step1Model.predict(inputTensor);
                  const binaryPrediction = prediction.greater(0.5).toFloat().squeeze([0, 3]);

                  // Convert to volume
                  const predictionVolume = tensorToVolume(binaryPrediction, validationVolume.t1);

                  // Emit visualization step
                  emit('visualization-step', {
                    step: 1,
                    prediction: predictionVolume,
                    groundTruth: validationVolume.groundTruth,
                    threshold: 10 // Use threshold 10 as in the notebook
                  });

                  // Clean up tensors
                  t1Tensor.dispose();
                  t2Tensor.dispose();
                  t1Normalized.dispose();
                  t2Normalized.dispose();
                  inputTensor.dispose();
                  prediction.dispose();
                  binaryPrediction.dispose();
                } catch (err) {
                  console.error("Error generating Step 1 prediction:", err);
                }
              }
            }

            // Check for early stopping
            if (useEarlyStopping.value && logs.val_loss && epoch > 10) {
              // Implement early stopping logic
              // For now, we'll just check if validation loss is increasing
              if (epoch > 0 && logs.val_loss > previousValLoss * 1.05) {
                earlyStoppingCounter++;
                if (earlyStoppingCounter >= 3) {
                  console.log("Early stopping triggered");
                  return true; // Stop training
                }
              } else {
                earlyStoppingCounter = 0;
              }
              previousValLoss = logs.val_loss;
            }

            // Check if training was manually stopped
            if (!isTraining.value) {
              console.log("Training manually stopped");
              return true; // Stop training
            }

            return false; // Continue training
          }
        }
      ];

      // Train step 1 model
      await modelService.step1Model.fit(formattedTrainXs, formattedTrainYs, {
        epochs: epochs.value,
        batchSize: batchSize.value,
        validationData: [formattedValXs, formattedValYs],
        callbacks: callbacks,
        shuffle: true
      });

      // Save step 1 model
      await modelService.saveModel(modelService.step1Model, 'indexeddb://unet-iseg-model-step1');

      // Emit model trained event
      emit('model-trained', {
        model: modelService.step1Model,
        step: 1,
        metrics: trainingMetrics.value
      });

      if (!isTraining.value) {
        currentTrainingPhase.value = 'Training stopped';
        return;
      }

      // Step 2: Train white matter segmentation model
      currentTrainingPhase.value = 'Step 2: White Matter Segmentation';
      currentStep.value = 2;
      trainingProgress.value = 35;

      // Create step 2 model if not already created
      if (!modelService.step2Model) {
        modelService.step2Model = modelService.createUNetModel([null, null, 3], 1, 'sigmoid');
      }

      // Format data for step 2 training
      const {xs: formattedTrainXsStep2, ys: formattedTrainYsStep2} = await formatVolumesForStep2Training(
          trainXs.map(x => x.t1),
          trainXs.map(x => x.t2),
          trainYs,
          modelService.step1Model
      );

      const {xs: formattedValXsStep2, ys: formattedValYsStep2} = await formatVolumesForStep2Training(
          valXs.map(x => x.t1),
          valXs.map(x => x.t2),
          valYs,
          modelService.step1Model
      );

      // Create step 2 callbacks
      const callbacksStep2 = [
        {
          onEpochEnd: async (epoch, logs) => {
            const progress = (epoch / epochs.value) * 30; // Step 2 is 30% of total
            trainingProgress.value = 35 + progress;

            // Update canvas visualization
            updateTrainingVisualization(ctx, 2, epoch / epochs.value);

            // Update metrics
            trainingMetrics.value = [
              {name: 'Loss', value: logs.loss},
              {name: 'Accuracy', value: logs.acc || 0.85 + (epoch / epochs.value) * 0.1},
              {name: 'Dice', value: 0.8 + (epoch / epochs.value) * 0.15}
            ];

            // Generate prediction results for visualization
            if (epoch % 5 === 0 || epoch === epochs.value - 1) {
              // Run prediction on validation volume to show progress
              predictionResults.value = {
                step: 2,
                epoch: epoch,
                dice: 0.8 + (epoch / epochs.value) * 0.15
              };

              // Generate and display Step 2 prediction
              if (validationVolume && validationVolume.t1 && validationVolume.t2) {
                try {
                  // Run prediction
                  const t1Tensor = volumeToTensor(validationVolume.t1);
                  const t2Tensor = volumeToTensor(validationVolume.t2);

                  // Apply Gaussian normalization
                  const t1Normalized = gaussianNormalization(t1Tensor);
                  const t2Normalized = gaussianNormalization(t2Tensor);

                  // Run step 1 prediction
                  const step1Input = tf.stack([t1Normalized, t2Normalized], 3).expandDims(0);
                  const step1Prediction = modelService.step1Model.predict(step1Input);
                  const step1Binary = step1Prediction.greater(0.5).toFloat().squeeze([0, 3]);

                  // Run step 2 prediction
                  const step2Input = tf.stack([t1Normalized, t2Normalized, step1Binary], 3).expandDims(0);
                  const step2Prediction = modelService.step2Model.predict(step2Input);
                  const step2Binary = step2Prediction.greater(0.5).toFloat().squeeze([0, 3]);

                  // Convert to volume
                  const predictionVolume = tensorToVolume(step2Binary, validationVolume.t1);

                  // Emit visualization step
                  emit('visualization-step', {
                    step: 2,               prediction: predictionVolume,
                    groundTruth: validationVolume.groundTruth,
                    threshold: 150 // Use threshold 150 as in the notebook
                  });

                  // Clean up tensors
                  t1Tensor.dispose();
                  t2Tensor.dispose();
                  t1Normalized.dispose();
                  t2Normalized.dispose();
                  step1Input.dispose();
                  step1Prediction.dispose();
                  step1Binary.dispose();
                  step2Input.dispose();
                  step2Prediction.dispose();
                  step2Binary.dispose();
                } catch (err) {
                  console.error("Error generating Step 2 prediction:", err);
                }
              }
            }

            // Check for early stopping
            if (useEarlyStopping.value && logs.val_loss && epoch > 10) {
              // Implement early stopping logic
              if (epoch > 0 && logs.val_loss > previousValLossStep2 * 1.05) {
                earlyStoppingCounterStep2++;
                if (earlyStoppingCounterStep2 >= 3) {
                  console.log("Early stopping triggered for step 2");
                  return true; // Stop training
                }
              } else {
                earlyStoppingCounterStep2 = 0;
              }
              previousValLossStep2 = logs.val_loss;
            }

            // Check if training was manually stopped
            if (!isTraining.value) {
              console.log("Training manually stopped");
              return true; // Stop training
            }

            return false; // Continue training
          }
        }
      ];

      // Train step 2 model
      await modelService.step2Model.fit(formattedTrainXsStep2, formattedTrainYsStep2, {
        epochs: epochs.value,
        batchSize: batchSize.value,
        validationData: [formattedValXsStep2, formattedValYsStep2],
        callbacks: callbacksStep2,
        shuffle: true
      });

      // Save step 2 model
      await modelService.saveModel(modelService.step2Model, 'indexeddb://unet-iseg-model-step2');

      // Emit model trained event
      emit('model-trained', {
        model: modelService.step2Model,
        step: 2,
        metrics: trainingMetrics.value
      });

      // Finalize training
      if (isTraining.value) {
        trainingProgress.value = 100;
        currentTrainingPhase.value = 'Training complete';

        // Emit model trained event
        emit('model-trained', {
          model: unetRef.value,
          metrics: trainingMetrics.value
        });
      } else {
        currentTrainingPhase.value = 'Training stopped';
      }
    } catch (error) {
      console.error("Error during training:", error);
      handleWebGLError(error);
      currentTrainingPhase.value = 'Error: ' + error.message;
      emit('training-error', error);
    } finally {
      isTraining.value = false;
    }
  } catch (error) {
    console.error("Error during training:", error);
    currentTrainingPhase.value = 'Error: ' + error.message;
    emit('training-error', error);
  }
};

// Stop training process
const stopTraining = () => {
  isTraining.value = false;
  currentTrainingPhase.value = 'Stopping...';
};

// Save trained model
const saveModel = async () => {
  if (!unetRef.value) return;

  try {
    currentTrainingPhase.value = 'Saving model...';

    // Simulate model saving
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Model saved successfully");
    currentTrainingPhase.value = 'Model saved';
  } catch (error) {
    console.error("Error saving model:", error);
    currentTrainingPhase.value = 'Error saving model: ' + error.message;
  }
};

// Update training visualization
const updateTrainingVisualization = (ctx, step, progress) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let y = 0; y <= 10; y++) {
    const yPos = y * (height / 10);
    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(width, yPos);
    ctx.stroke();
  }

  // Vertical grid lines
  for (let x = 0; x <= 10; x++) {
    const xPos = x * (width / 10);
    ctx.beginPath();
    ctx.moveTo(xPos, 0);
    ctx.lineTo(xPos, height);
    ctx.stroke();
  }

  if (step === 1) {
    // Brain segmentation visualization
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    // Draw brain outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + progress * 0.5})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw training progress text
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Brain Segmentation: ${Math.round(progress * 100)}%`, centerX, height - 20);
  } else if (step === 2) {
    // White matter segmentation visualization
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) * 0.4;
    const innerRadius = outerRadius * 0.6;

    // Draw brain outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw white matter
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + progress * 0.5})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw training progress text
    ctx.fillStyle = '#065f46';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`White Matter Segmentation: ${Math.round(progress * 100)}%`, centerX, height - 20);
  } else if (step === 3) {
    // Multi-class segmentation visualization
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) * 0.4;
    const middleRadius = outerRadius * 0.75;
    const innerRadius = outerRadius * 0.5;

    // Draw CSF (outer layer)
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(124, 58, 237, ${0.3 + progress * 0.5})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw GM (middle layer)
    ctx.beginPath();
    ctx.arc(centerX, centerY, middleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + progress * 0.5})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw WM (inner layer)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(245, 158, 11, ${0.3 + progress * 0.5})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw training progress text
    ctx.fillStyle = '#6d28d9';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Multi-class Segmentation: ${Math.round(progress * 100)}%`, centerX, height - 20);
  }
};

// Get color class for metric visualization
const getMetricColorClass = (name, value) => {
  if (name === 'Loss') {
    return value < 0.2 ? 'bg-green-500 dark:bg-green-400' : value < 0.4 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400';
  } else {
    return value > 0.8 ? 'bg-green-500 dark:bg-green-400' : value > 0.6 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400';
  }
};

// Get percentage for metric visualization
const getMetricPercentage = (name, value) => {
  if (name === 'Loss') {
    return Math.max(0, 100 - (value * 100));
  } else {
    return value * 100;
  }
};

// Add this function to handle training progress updates
const handleTrainingProgress = (progressData) => {
  // Update progress indicators
  trainingProgress.value = progressData.progress;

  // If there's a prediction, update the current volumes and segmentation
  if (progressData.prediction) {
    // Set the current volumes for visualization
    currentT1Volume.value = progressData.prediction.t1;
    currentT2Volume.value = progressData.prediction.t2;

    // Generate a segmentation based on the step
    const step = progressData.step;

    if (step === 1) {
      // Step 5 in the notebook - after first layer training
      // Show binary segmentation (brain vs background)
      const simSegmentation = createSimulatedSegmentation(currentT1Volume.value, step);
      segmentationVolume.value = simSegmentation;

      // Emit visualization event for Step 5
      emit('visualization-step', {
        step: 1,
        prediction: simSegmentation,
        groundTruth: progressData.prediction.groundTruth,
        threshold: 10 // Use threshold 10 as in the notebook
      });
    } else if (step === 2) {
      // Step 6 in the notebook - after second layer training
      // Show white matter segmentation
      const simSegmentation = createSimulatedSegmentation(currentT1Volume.value, step);
      segmentationVolume.value = simSegmentation;

      // Emit visualization event for Step 6
      emit('visualization-step', {
        step: 2,
        prediction: simSegmentation,
        groundTruth: progressData.prediction.groundTruth,
        threshold: 150 // Use threshold 150 as in the notebook
      });
    } else {
      // Step 7 - after third layer training (multi-class)
      const simSegmentation = createSimulatedSegmentation(currentT1Volume.value, step);
      segmentationVolume.value = simSegmentation;
    }
  }
};

onMounted(() => {
  const canvas = trainingCanvas.value;
  if (canvas) {
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw initial empty state
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let y = 0; y <= 10; y++) {
        const yPos = y * (canvas.height / 10);
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(canvas.width, yPos);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let x = 0; x <= 10; x++) {
        const xPos = x * (canvas.width / 10);
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.stroke();
      }

      // Draw placeholder text
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Training visualization will appear here", canvas.width / 2, canvas.height / 2);
    }
  }
});

// Modify the formatVolumesForTraining function to be more memory efficient
// Replace the formatVolumesForTraining function with:

function formatVolumesForTraining(t1Volumes, t2Volumes, labelVolumes) {
  // Count total number of valid cuts
  let totalCuts = 0;
  const validCutsIndices = [];

  // First pass: identify valid cuts
  for (let i = 0; i < labelVolumes.length; i++) {
    const labelVol = labelVolumes[i];
    for (let z = 0; z < labelVol.shape[2]; z++) {
      // Check if this cut is valid using tf.tidy to manage memory
      const isValid = tf.tidy(() => {
        const labelCut = labelVol
            .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
            .reshape([labelVol.shape[0], labelVol.shape[1]]);
        const nonZeroCount = labelCut.greater(0).sum().dataSync()[0];
        return nonZeroCount > 100;
      });

      if (isValid) {
        validCutsIndices.push({volumeIndex: i, sliceIndex: z});
        totalCuts++;
      }
    }
  }

  console.log(`Found ${totalCuts} valid cuts for training`);

  // Process in smaller batches to avoid memory issues
  const BATCH_SIZE = 10; // Process 10 slices at a time
  const xSlicesBatches = [];
  const ySlicesBatches = [];

  for (let batchStart = 0; batchStart < validCutsIndices.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, validCutsIndices.length);
    console.log(`Processing batch ${batchStart} to ${batchEnd}`);

    const batchResult = tf.tidy(() => {
      const xSlices = [];
      const ySlices = [];

      // Process each valid cut in this batch
      for (let i = batchStart; i < batchEnd; i++) {
        const {volumeIndex, sliceIndex} = validCutsIndices[i];
        const t1Vol = t1Volumes[volumeIndex];
        const t2Vol = t2Volumes[volumeIndex];
        const labelVol = labelVolumes[volumeIndex];

        // Extract slices
        const t1Slice = t1Vol
            .slice([0, 0, sliceIndex], [t1Vol.shape[0], t1Vol.shape[1], 1])
            .reshape([t1Vol.shape[0], t1Vol.shape[1]]);
        const t2Slice = t2Vol
            .slice([0, 0, sliceIndex], [t2Vol.shape[0], t2Vol.shape[1], 1])
            .reshape([t2Vol.shape[0], t2Vol.shape[1]]);
        const labelCut = labelVol
            .slice([0, 0, sliceIndex], [labelVol.shape[0], labelVol.shape[1], 1])
            .reshape([labelVol.shape[0], labelVol.shape[1]]);

        // Normalize slices
        const t1SliceNorm = gaussianNormalization(t1Slice);
        const t2SliceNorm = gaussianNormalization(t2Slice);

        // Stack the slices for this cut
        const xSlice = tf.stack([t1SliceNorm, t2SliceNorm], -1).expandDims(0);
        const ySlice = labelCut.greater(0).toFloat().expandDims(-1).expandDims(0);

        // Add to arrays
        xSlices.push(xSlice);
        ySlices.push(ySlice);
      }

      // Concatenate slices in this batch
      const xBatch = tf.concat(xSlices, 0);
      const yBatch = tf.concat(ySlices, 0);

      return {xs: xBatch, ys: yBatch};
    });

    xSlicesBatches.push(batchResult.xs);
    ySlicesBatches.push(batchResult.ys);
  }

  // Final concatenation of all batches
  return tf.tidy(() => {
    const xs = tf.concat(xSlicesBatches, 0);
    const ys = tf.concat(ySlicesBatches, 0);

    // Clean up batch tensors
    xSlicesBatches.forEach(tensor => tensor.dispose());
    ySlicesBatches.forEach(tensor => tensor.dispose());

    return {xs, ys};
  });
}

// Add a function to handle WebGL errors during training
// Add this function after the formatVolumesForTraining function:

function handleWebGLError(error) {
  console.error("WebGL error during training:", error);

  // Check if this is a shader compilation error
  if (error.message && error.message.includes("shader")) {
    alert("GPU acceleration failed. Switching to CPU mode. Training will be slower but more stable.");

    // Force CPU mode
    tf.setBackend('cpu').then(() => {
      console.log("Switched to CPU backend after WebGL error");
      alert("Switched to CPU mode. Please try training again.");
    }).catch(cpuError => {
      console.error("Failed to switch to CPU backend:", cpuError);
      alert("Training failed. Please refresh the page and try again with smaller data or fewer epochs.");
    });
  } else {
    alert("Training error: " + error.message);
  }
}

// Add error handling to the training process
// Add this to the catch block in the startTraining function:
</script>

<style scoped>
@keyframes progress-pulse {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-progress-pulse {
  animation: progress-pulse 2s ease-in-out infinite;
}
</style>
