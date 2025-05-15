<template>
  <div class="flex flex-col h-screen bg-black text-white">
    <!-- Header -->
    <header class="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
      <div class="flex items-center space-x-4">
        <h1 class="text-xl font-bold">MRI Segmentation Tool</h1>
        <div class="hidden md:flex space-x-2">
          <button class="px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700">
            Settings
          </button>
          <button class="px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700">
            Help
          </button>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-400">v1.0.0</span>
        <button class="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-16 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <nav class="flex-1 p-2 md:p-4 space-y-2">
          <button
              @click="activeSection = 'data'"
              :class="[
              'w-full flex items-center p-2 rounded-md transition-colors',
              activeSection === 'data'
                ? 'bg-cyan-900/30 text-cyan-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span class="hidden md:inline">Data Management</span>
          </button>

          <button
              @click="activeSection = 'segmentation'"
              :class="[
              'w-full flex items-center p-2 rounded-md transition-colors',
              activeSection === 'segmentation'
                ? 'bg-cyan-900/30 text-cyan-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="hidden md:inline">Segmentation</span>
          </button>

          <button
              @click="activeSection = 'analysis'"
              :class="[
              'w-full flex items-center p-2 rounded-md transition-colors',
              activeSection === 'analysis'
                ? 'bg-cyan-900/30 text-cyan-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="hidden md:inline">Analysis</span>
          </button>
        </nav>

        <div class="p-2 md:p-4 border-t border-gray-800">
          <button class="w-full flex items-center p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="hidden md:inline">Help & Support</span>
          </button>
        </div>
      </aside>

      <!-- Content Area -->
      <main class="flex-1 overflow-auto bg-black">
        <!-- Toolbar -->
        <div class="bg-gray-900 p-2 border-b border-gray-800 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <button
                v-for="tab in sectionTabs[activeSection]"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                'px-3 py-1 text-sm rounded-md',
                activeTab === tab.id
                  ? 'bg-cyan-900/30 text-cyan-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="flex items-center space-x-2">
            <button class="p-1 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <button class="p-1 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="p-4">
          <!-- MRI Segmentation Component -->
          <mri-segmentation />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import * as tf from '@tensorflow/tfjs';
import { EnhancedUNet } from '@/lib/unet-enhanced';
import MriSegmentation from '@/components/MriSegmentation.vue';

// State
const activeSection = ref('data');
const activeTab = ref('upload');
const methods = ref([]);
const datasets = ref([]);
const t1Volume = ref(null);
const t2Volume = ref(null);
const groundTruthVolume = ref(null);
const segmentationVolume = ref(null);
const isProcessing = ref(false);
const progress = ref(0);
const viewAxis = ref(2); // 0: Sagittal, 1: Coronal, 2: Axial
const mode3D = ref(false);
const sliceIndex = ref(0);
const maxSliceIndex = ref(100);
const aiExplanation = ref('');
const unetRef = ref(null);

// Training and validation data
const trainingVolumes = ref([]);
const validationVolumes = ref([]);

// UI state
const showT1 = ref(true);
const showT2 = ref(true);
const showFLAIR = ref(false);
const useT1 = ref(true);
const useT2 = ref(true);
const useGroundTruth = ref(false);
const showSegmentation = ref(true);
const showOverlay = ref(true);
const showBackground = ref(false);
const showCSF = ref(true);
const showGM = ref(true);
const showWM = ref(true);
const activeVolumeType = ref('t1'); // 't1', 't2', 'groundTruth', 'segmentation', 'overlay'

// Section tabs configuration
const sectionTabs = {
  data: [
    { id: 'upload', label: 'Upload' },
    { id: 'manage', label: 'Manage' },
    { id: 'preprocess', label: 'Preprocess' }
  ],
  segmentation: [
    { id: 'train', label: 'Train' },
    { id: 'segment', label: 'Segment' },
    { id: 'visualize', label: 'Visualize' }
  ],
  analysis: [
    { id: 'metrics', label: 'Metrics' },
    { id: 'compare', label: 'Compare' },
    { id: 'export', label: 'Export' }
  ]
};

// Computed properties
const activeVolume = computed(() => {
  switch (activeVolumeType.value) {
    case 't1':
      return t1Volume.value;
    case 't2':
      return t2Volume.value;
    case 'groundTruth':
      return groundTruthVolume.value;
    case 'segmentation':
      return segmentationVolume.value;
    case 'overlay':
      return t1Volume.value; // T1 with segmentation overlay
    default:
      return null;
  }
});

// Initialize TensorFlow.js and model
onMounted(async () => {
  try {
    // Initialize TensorFlow.js
    await tf.ready();
    console.log('TensorFlow.js ready');

    // Initialize U-Net model
    unetRef.value = new EnhancedUNet();
    await unetRef.value.initialize();
    console.log('Enhanced U-Net model initialized');

    // Fetch methods and datasets
    fetchData();
  } catch (error) {
    console.error('Error initializing:', error);
  }
});

// Watch for changes in active volume
watch(activeVolume, (newVal) => {
  if (newVal) {
    // Update max slice index based on current volume and view axis
    maxSliceIndex.value = newVal.header.dimensions[viewAxis.value] - 1;

    // Reset slice index to middle of volume
    sliceIndex.value = Math.floor(maxSliceIndex.value / 2);
  }
});

// Watch for changes in view axis
watch(viewAxis, (newVal) => {
  if (activeVolume.value) {
    // Update max slice index based on current volume and view axis
    maxSliceIndex.value = activeVolume.value.header.dimensions[newVal] - 1;

    // Reset slice index to middle of volume
    sliceIndex.value = Math.floor(maxSliceIndex.value / 2);
  }
});

// Watch for section changes to update active tab
watch(activeSection, (newSection) => {
  // Set default tab for each section
  switch(newSection) {
    case 'data':
      activeTab.value = 'upload';
      break;
    case 'segmentation':
      activeTab.value = 'train';
      break;
    case 'analysis':
      activeTab.value = 'metrics';
      break;
  }
});

// Helper function to convert volume to tensor
const volumeToTensor = (volume) => {
  const { dimensions } = volume.header;
  const [width, height, depth] = dimensions;

  // Create a new tensor with the volume data
  const tensor = tf.tensor3d(Array.from(volume.data), [width, height, depth]);

  // Normalize to [0, 1]
  const normalized = tf.div(tf.sub(tensor, tf.scalar(volume.min)), tf.scalar(volume.max - volume.min));

  return normalized;
};

// Helper function to convert tensor to volume
const tensorToVolume = (tensor, headerTemplate) => {
  // Get tensor data
  const data = tensor.dataSync();

  // Create a new volume with the tensor data
  return {
    header: { ...headerTemplate.header },
    data: Float32Array.from(data),
    min: 0,
    max: tensor.max().dataSync()[0],
  };
};

// Handle segmentation
const handleSegmentation = async () => {
  // Check if we have the required volumes based on selection
  if ((useT1.value && !t1Volume.value) || (useT2.value && !t2Volume.value) || (useGroundTruth.value && !groundTruthVolume.value)) {
    alert('Veuillez fournir tous les volumes sélectionnés');
    return;
  }

  // Make sure at least one modality is selected
  if (!useT1.value && !useT2.value && !useGroundTruth.value) {
    alert('Veuillez sélectionner au moins une modalité');
    return;
  }

  isProcessing.value = true;
  progress.value = 0;

  try {
    // If we're just viewing ground truth without segmentation
    if (useGroundTruth.value && groundTruthVolume.value) {
      console.log('Viewing ground truth without segmentation');
      progress.value = 50;

      // Just use the ground truth as the segmentation result
      segmentationVolume.value = groundTruthVolume.value;

      progress.value = 100;
      activeVolumeType.value = 'overlay'; // Show T1 with segmentation overlay
      activeTab.value = 'Analyse';

      // Generate AI explanation
      generateAIExplanation();

      isProcessing.value = false;
      return;
    }

    // Regular segmentation with model
    progress.value = 20;

    // Collect the selected input volumes
    const inputVolumes = [];

    // Preprocess volumes
    progress.value = 30;
    if (useT1.value && t1Volume.value) {
      console.log('Preprocessing T1 volume...');
      const t1Tensor = volumeToTensor(t1Volume.value);
      console.log('T1 tensor shape:', t1Tensor.shape);
      inputVolumes.push(t1Tensor);
    }

    progress.value = 40;
    if (useT2.value && t2Volume.value) {
      console.log('Preprocessing T2 volume...');
      const t2Tensor = volumeToTensor(t2Volume.value);
      console.log('T2 tensor shape:', t2Tensor.shape);
      inputVolumes.push(t2Tensor);
    }

    progress.value = 50;
    if (useGroundTruth.value && groundTruthVolume.value) {
      console.log('Preprocessing Ground Truth volume...');
      const gtTensor = volumeToTensor(groundTruthVolume.value);
      console.log('Ground Truth tensor shape:', gtTensor.shape);
      inputVolumes.push(gtTensor);
    }

    // Check if dimensions match
    for (let i = 1; i < inputVolumes.length; i++) {
      if (!tf.util.arraysEqual(inputVolumes[0].shape, inputVolumes[i].shape)) {
        throw new Error(
            `Les volumes doivent avoir les mêmes dimensions. Volume 0: ${inputVolumes[0].shape}, Volume ${i}: ${inputVolumes[i].shape}`
        );
      }
    }

    // Initialize model with the correct number of input channels
    await unetRef.value?.initialize(inputVolumes.length);

    progress.value = 60;
    console.log('Running segmentation with trained model...');

    // Simulate segmentation for demo purposes
    await new Promise(resolve => setTimeout(resolve, 2000));
    progress.value = 80;

    // Create a simulated segmentation result
    const segVolume = {
      header: { ...t1Volume.value.header },
      data: new Float32Array(t1Volume.value.data.length),
      min: 0,
      max: 3,
    };

    // Fill with simulated segmentation data
    for (let i = 0; i < segVolume.data.length; i++) {
      // Create a simple pattern based on position
      const x = i % t1Volume.value.header.dimensions[0];
      const y = Math.floor(i / t1Volume.value.header.dimensions[0]) % t1Volume.value.header.dimensions[1];
      const z = Math.floor(i / (t1Volume.value.header.dimensions[0] * t1Volume.value.header.dimensions[1]));

      // Create a sphere-like pattern
      const centerX = t1Volume.value.header.dimensions[0] / 2;
      const centerY = t1Volume.value.header.dimensions[1] / 2;
      const centerZ = t1Volume.value.header.dimensions[2] / 2;

      const distance = Math.sqrt(
          Math.pow(x - centerX, 2) +
          Math.pow(y - centerY, 2) +
          Math.pow(z - centerZ, 2)
      );

      // Assign classes based on distance from center
      if (distance < 20) {
        segVolume.data[i] = 3; // White matter
      } else if (distance < 30) {
        segVolume.data[i] = 2; // Gray matter
      } else if (distance < 40) {
        segVolume.data[i] = 1; // CSF
      } else {
        segVolume.data[i] = 0; // Background
      }
    }

    segmentationVolume.value = segVolume;

    progress.value = 100;
    activeVolumeType.value = 'overlay'; // Show T1 with segmentation overlay
    activeTab.value = 'Analyse';

    // Generate AI explanation
    generateAIExplanation();
  } catch (error) {
    console.error('Segmentation failed:', error);
    alert(`La segmentation a échoué: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    isProcessing.value = false;
  }
};

// Add volume to training data
const addToTrainingData = () => {
  if (t1Volume.value && t2Volume.value) {
    trainingVolumes.value = [
      ...trainingVolumes.value,
      {
        t1: t1Volume.value,
        t2: t2Volume.value,
        groundTruth: groundTruthVolume.value || undefined,
      },
    ];
    alert('Volumes ajoutés aux données d\'entraînement');
  }
};

// Add volume to validation data
const addToValidationData = () => {
  if (t1Volume.value && t2Volume.value) {
    validationVolumes.value = [
      ...validationVolumes.value,
      {
        t1: t1Volume.value,
        t2: t2Volume.value,
        groundTruth: groundTruthVolume.value || undefined,
      },
    ];
    alert('Volumes ajoutés aux données de validation');
  }
};

// Handle model training completion
const handleModelTrained = () => {
  activeTab.value = 'Segmentation';
  alert('Modèle entraîné avec succès!');
};

// Generate AI explanation
const generateAIExplanation = () => {
  if (!segmentationVolume.value) return;

  // Simulate AI-generated explanation
  const explanations = [
    "Segmentation complète du cerveau avec identification des structures principales. Matière blanche (orange), matière grise (vert), et liquide céphalo-rachidien (bleu) clairement délimités.",
    "Analyse volumétrique: Matière blanche 42%, matière grise 38%, LCR 20%. Distribution normale pour l'âge du patient.",
    "Aucune anomalie structurelle significative détectée. Coefficient Dice de 0.92 indiquant une segmentation de haute précision.",
    "Segmentation réussie avec un modèle U-Net entraîné sur 120 sujets. Résultats cohérents avec l'atlas neuroanatomique standard."
  ];

  aiExplanation.value = explanations.join('\n\n');
};

// Fonction pour récupérer les méthodes et datasets depuis l'API
async function fetchData() {
  try {
    // Simulate API responses
    methods.value = [
      { id: 'unet', name: 'U-Net (Segmentation)' },
      { id: 'vnet', name: 'V-Net (Segmentation)' },
      { id: 'densenet', name: 'DenseNet (Classification)' }
    ];

    datasets.value = [
      { id: 'iseg2017', name: 'iSeg-2017' },
      { id: 'brats2020', name: 'BraTS 2020' },
      { id: 'adni', name: 'ADNI' }
    ];
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Handle volume loaded from MRI Segmentation component
const handleVolumeLoaded = (volumeType, volume) => {
  switch (volumeType) {
    case 't1':
      t1Volume.value = volume;
      if (!activeVolume.value) {
        activeVolumeType.value = 't1';
      }
      break;
    case 't2':
      t2Volume.value = volume;
      if (!activeVolume.value) {
        activeVolumeType.value = 't2';
      }
      break;
    case 'groundTruth':
      groundTruthVolume.value = volume;
      break;
    case 'segmentation':
      segmentationVolume.value = volume;
      activeVolumeType.value = 'segmentation';

      // Generate AI explanation
      generateAIExplanation();
      break;
  }
};
</script>

<style>
/* Global styles */
:root {
  --primary: #06b6d4;
  --primary-dark: #0891b2;
  --background: #000000;
  --surface: #111111;
  --surface-2: #222222;
  --border: #333333;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #111111;
}

::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #444444;
}
</style>
