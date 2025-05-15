<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-medium mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clip-rule="evenodd" />
      </svg>
      Load Pre-trained Model
    </h3>

    <div class="space-y-4">
      <!-- Model Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Model
        </label>
        <div class="relative">
          <select
              v-model="selectedModel"
              class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
          >
            <option v-for="model in availableModels" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Model Details -->
      <div v-if="selectedModelDetails" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Model Details</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Type:</span>
            <span class="text-gray-800 dark:text-gray-200">{{ selectedModelDetails.type }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Input:</span>
            <span class="text-gray-800 dark:text-gray-200">{{ selectedModelDetails.input }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Output:</span>
            <span class="text-gray-800 dark:text-gray-200">{{ selectedModelDetails.output }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Size:</span>
            <span class="text-gray-800 dark:text-gray-200">{{ selectedModelDetails.size }}</span>
          </div>
        </div>
      </div>

      <!-- Load Button -->
      <button
          @click="loadModel"
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isLoading ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isLoading ? 'Loading...' : 'Load Model' }}</span>
      </button>

      <!-- Status Message -->
      <div v-if="statusMessage" class="mt-3 p-3 rounded-md text-sm" :class="statusType === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'">
        {{ statusMessage }}
      </div>

      <!-- Custom Model Upload -->
      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">Upload Custom Model</h4>
        <model-importer
            @model-imported="handleModelImported"
            @import-error="handleImportError"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import * as tf from '@tensorflow/tfjs';
import ModelImporter from './ModelImporter.vue';
import ModelService from '../services/modelService';

// Props and emits
const emit = defineEmits(['model-loaded', 'load-error']);

// State
const selectedModel = ref('unet-step1');
const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref('success');
const loadedModels = ref({});

// Available models
const availableModels = [
  {
    id: 'unet-step1',
    name: 'U-Net Step 1 (Brain Segmentation)',
    type: 'HDF5',
    input: 'T1+T2',
    output: 'Binary Mask',
    size: '2.3 MB',
    url: '/models/cascade1.hdf5'
  },
  {
    id: 'unet-step2',
    name: 'U-Net Step 2 (White Matter)',
    type: 'HDF5',
    input: 'T1+T2+Step1',
    output: 'Binary Mask',
    size: '2.5 MB',
    url: '/models/cascade2.hdf5'
  },
  {
    id: 'unet-step3',
    name: 'U-Net Step 3 (Multi-class)',
    type: 'HDF5',
    input: 'T1+T2+Step1+Step2',
    output: '4 Classes',
    size: '2.8 MB',
    url: '/models/cascade3.hdf5'
  },
  {
    id: 'unet-full',
    name: 'U-Net Complete (All Steps)',
    type: 'HDF5',
    input: 'T1+T2',
    output: '4 Classes',
    size: '7.6 MB',
    url: '/models/cascade_full.hdf5'
  }
];

// Computed properties
const selectedModelDetails = computed(() => {
  return availableModels.find(model => model.id === selectedModel.value);
});

// Methods
const loadModel = async () => {
  if (!selectedModelDetails.value) return;

  isLoading.value = true;
  statusMessage.value = '';

  try {
    // Check if model is already loaded
    if (loadedModels.value[selectedModel.value]) {
      statusMessage.value = `Model "${selectedModelDetails.value.name}" is already loaded`;
      statusType.value = 'success';
      emit('model-loaded', loadedModels.value[selectedModel.value]);
      isLoading.value = false;
      return;
    }

    // Initialize model service
    const modelService = new ModelService();
    await modelService.initialize();

    // Determine model type
    const modelType = selectedModel.value.includes('step1') ? 'step1' :
        selectedModel.value.includes('step2') ? 'step2' :
            selectedModel.value.includes('step3') ? 'step3' : 'full';

    // Fetch the model file
    const response = await fetch(selectedModelDetails.value.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    const modelBuffer = await response.arrayBuffer();

    // Load the model
    const success = await modelService.loadHDF5Model(modelBuffer, modelType);

    if (success) {
      // Get the loaded model
      let model;
      if (modelType === 'step1') {
        model = modelService.step1Model;
      } else if (modelType === 'step2') {
        model = modelService.step2Model;
      } else if (modelType === 'step3') {
        model = modelService.step3Model;
      }

      // Store the loaded model
      loadedModels.value[selectedModel.value] = {
        model,
        type: modelType,
        name: selectedModelDetails.value.name,
        inputShape: model.inputs[0].shape,
        outputShape: model.outputs[0].shape
      };

      statusMessage.value = `Model "${selectedModelDetails.value.name}" loaded successfully`;
      statusType.value = 'success';

      // Emit the model loaded event
      emit('model-loaded', loadedModels.value[selectedModel.value]);
    } else {
      throw new Error("Failed to load model");
    }
  } catch (error) {
    console.error('Error loading model:', error);
    statusMessage.value = `Error loading model: ${error.message}`;
    statusType.value = 'error';
    emit('load-error', error);
  } finally {
    isLoading.value = false;
  }
};

// Update the handleModelImported method to properly handle imported models

const handleModelImported = async (modelData) => {
  isLoading.value = true;
  statusMessage.value = '';

  try {
    // Initialize model service
    const modelService = new ModelService();
    await modelService.initialize();

    // Get the appropriate model based on type
    let model;
    if (modelData.modelType === 'step1') {
      model = modelService.step1Model;
    } else if (modelData.modelType === 'step2') {
      model = modelService.step2Model;
    } else if (modelData.modelType === 'step3') {
      model = modelService.step3Model;
    }

    if (!model) {
      throw new Error(`Model for ${modelData.modelType} not found`);
    }

    // Create a custom model ID
    const customModelId = `custom-${modelData.modelType}-${Date.now()}`;

    // Store the loaded model
    loadedModels.value[customModelId] = {
      model,
      type: modelData.modelType,
      name: `Custom: ${modelData.modelName}`,
      inputShape: model.inputs[0].shape,
      outputShape: model.outputs[0].shape,
      isCustom: true
    };

    // Add to available models
    availableModels.push({
      id: customModelId,
      name: `Custom: ${modelData.modelName}`,
      type: 'HDF5 (Custom)',
      input: modelData.modelType === 'step1' ? 'T1+T2' :
          modelData.modelType === 'step2' ? 'T1+T2+Step1' :
              'T1+T2+Step1+Step2',
      output: modelData.modelType === 'step3' ? '4 Classes' : 'Binary Mask',
      size: formatFileSize(modelData.modelSize),
      isCustom: true
    });

    // Select the newly imported model
    selectedModel.value = customModelId;

    statusMessage.value = `Custom model "${modelData.modelName}" imported and loaded successfully`;
    statusType.value = 'success';

    // Emit the model loaded event
    emit('model-loaded', loadedModels.value[customModelId]);
  } catch (error) {
    console.error('Error importing custom model:', error);
    statusMessage.value = `Error importing custom model: ${error.message}`;
    statusType.value = 'error';
    emit('load-error', error);
  } finally {
    isLoading.value = false;
  }
};

const handleImportError = (error) => {
  statusMessage.value = `Error importing model: ${error.message}`;
  statusType.value = 'error';
  emit('load-error', error);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Lifecycle hooks
onMounted(async () => {
  try {
    // Initialize TensorFlow.js
    await tf.ready();
    console.log('TensorFlow.js is ready');
  } catch (error) {
    console.error('Error initializing TensorFlow.js:', error);
    statusMessage.value = `Error initializing TensorFlow.js: ${error.message}`;
    statusType.value = 'error';
  }
});
</script>
