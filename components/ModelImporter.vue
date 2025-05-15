<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-medium mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      Import HDF5 Model
    </h3>

    <div class="space-y-4">
      <!-- Model Type Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Model Step
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
              v-for="step in ['step1', 'step2', 'step3']"
              :key="step"
              @click="selectedModelType = step"
              class="flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium transition-colors"
              :class="selectedModelType === step
              ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'"
          >
            {{ getStepLabel(step) }}
          </button>
        </div>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ getModelTypeDescription(selectedModelType) }}
        </p>
      </div>

      <!-- File Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload HDF5 Model File
        </label>
        <div class="flex items-center justify-center w-full">
          <label
              class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              :class="{ 'border-blue-500 dark:border-blue-400': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <svg class="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                HDF5 model files (.h5, .hdf5, .keras)
              </p>
            </div>
            <input
                type="file"
                class="hidden"
                accept=".h5,.hdf5,.keras"
                @change="handleFileSelect"
                ref="fileInput"
            />
          </label>
        </div>

        <!-- Selected File Info -->
        <div v-if="selectedFile" class="mt-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ selectedFile.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
          </div>
          <button
              @click="clearSelectedFile"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Import Button -->
      <button
          @click="importModel"
          :disabled="!selectedFile || isLoading"
          class="w-full px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="!selectedFile || isLoading ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isLoading ? 'Importing...' : 'Import Model' }}</span>
      </button>

      <!-- Status Message -->
      <div v-if="statusMessage" class="mt-3 p-3 rounded-md text-sm" :class="statusType === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as tf from '@tensorflow/tfjs';

// Import ModelService
import { ModelService } from '../services/modelService';

// Props and emits
const emit = defineEmits(['model-imported', 'import-error']);

// State
const selectedModelType = ref('step1');
const selectedFile = ref(null);
const isDragging = ref(false);
const isLoading = ref(false);
const statusMessage = ref('');
const statusType = ref('success');
const fileInput = ref(null);

// Computed properties
const getStepLabel = (step) => {
  switch (step) {
    case 'step1': return 'Step 1 (Brain)';
    case 'step2': return 'Step 2 (WM)';
    case 'step3': return 'Step 3 (Multi)';
    default: return step;
  }
};

const getModelTypeDescription = (type) => {
  switch (type) {
    case 'step1':
      return 'Binary segmentation of brain tissue (T1+T2 → Binary mask)';
    case 'step2':
      return 'Binary segmentation of white matter (T1+T2+Step1 → Binary mask)';
    case 'step3':
      return 'Multi-class segmentation (T1+T2+Step1+Step2 → 4 classes)';
    default:
      return '';
  }
};

// Methods
const handleFileSelect = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
    statusMessage.value = '';
  }
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.name.endsWith('.h5') || file.name.endsWith('.hdf5') || file.name.endsWith('.keras')) {
      selectedFile.value = file;
      statusMessage.value = '';
    } else {
      statusMessage.value = 'Please upload a valid HDF5 model file (.h5, .hdf5, .keras)';
      statusType.value = 'error';
    }
  }
};

const clearSelectedFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  statusMessage.value = '';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Update the importModel method to properly handle HDF5 models

const importModel = async () => {
  if (!selectedFile.value) return;

  isLoading.value = true;
  statusMessage.value = '';

  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(selectedFile.value);

    // Import the model using the ModelService
    const modelService = new ModelService();
    await modelService.initialize();

    // Load the HDF5 model
    const success = await modelService.loadHDF5Model(arrayBuffer, selectedModelType.value);

    if (success) {
      // Emit the model imported event
      emit('model-imported', {
        modelType: selectedModelType.value,
        modelName: selectedFile.value.name,
        modelSize: selectedFile.value.size,
        modelBuffer: arrayBuffer
      });

      statusMessage.value = `Model "${selectedFile.value.name}" imported successfully as ${getStepLabel(selectedModelType.value)}`;
      statusType.value = 'success';

      // Clear the selected file
      clearSelectedFile();
    } else {
      throw new Error("Failed to import model");
    }
  } catch (error) {
    console.error('Error importing model:', error);
    statusMessage.value = `Error importing model: ${error.message}`;
    statusType.value = 'error';
    emit('import-error', error);
  } finally {
    isLoading.value = false;
  }
};

const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};
</script>
