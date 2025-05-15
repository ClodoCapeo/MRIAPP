<template>
  <div v-if="segmentationVolume" class="bg-[#181818] p-4 rounded-md">
    <h3 class="text-lg font-medium mb-4">Post-Processing Results</h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Original T1 -->
      <div v-if="t1Volume">
        <h4 class="text-sm font-medium mb-2">T1 Image</h4>
        <div class="bg-gray-800 rounded-md aspect-square relative">
          <canvas ref="canvasRef" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Raw Segmentation -->
      <div v-if="segmentationVolume">
        <h4 class="text-sm font-medium mb-2">Raw Segmentation</h4>
        <div class="bg-gray-800 rounded-md aspect-square relative">
          <canvas ref="canvasOriginalRef" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Post-processed Segmentation -->
      <div v-if="processedVolume">
        <h4 class="text-sm font-medium mb-2">Post-processed</h4>
        <div class="bg-gray-800 rounded-md aspect-square relative">
          <canvas ref="canvasProcessedRef" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <div v-if="t1Volume" class="mt-4">
      <label class="block text-sm font-medium mb-1">Slice: {{ sliceIndex }}</label>
      <input
          type="range"
          v-model="sliceIndex"
          :min="0"
          :max="t1Volume.header.dimensions[2] - 1"
          step="1"
          class="w-full accent-cyan-500"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import * as tf from '@tensorflow/tfjs';

const props = defineProps({
  segmentationVolume: {
    type: Object,
    default: null
  },
  groundTruthVolume: {
    type: Object,
    default: null
  },
  t1Volume: {
    type: Object,
    default: null
  }
});

const processedVolume = ref(null);
const sliceIndex = ref(70);
const canvasRef = ref(null);
const canvasOriginalRef = ref(null);
const canvasProcessedRef = ref(null);

// Process the segmentation volume when it changes
watch(
    () => props.segmentationVolume,
    async (newVal) => {
      if (!newVal) return;

      // Apply argmax decoding as shown in the tutorial
      try {
        // Convert volume data to tensor
        const segData = Array.from(newVal.data);
        const [width, height, depth, channels] = newVal.header.dimensions;

        // Reshape to 4D tensor with channels as last dimension
        const segTensor = tf.tensor4d(segData, [width, height, depth, channels]);

        // Apply argmax to get the class with highest probability
        const argmaxTensor = tf.argMax(segTensor, -1);

        // Convert back to volume
        const processedData = await argmaxTensor.data();

        processedVolume.value = {
          header: {
            ...newVal.header,
            dimensions: [width, height, depth],
          },
          data: new Float32Array(processedData),
          min: 0,
          max: 3,
        };

        // Clean up
        segTensor.dispose();
        argmaxTensor.dispose();
      } catch (error) {
        console.error('Error in post-processing:', error);
      }
    },
    { immediate: true }
);

// Render slices when any relevant data changes
watch(
    [sliceIndex, () => props.t1Volume, () => props.segmentationVolume, processedVolume],
    () => {
      renderSlices();
    }
);

// Initialize when component is mounted
onMounted(() => {
  if (props.t1Volume) {
    // Set slice to middle of the volume
    sliceIndex.value = Math.floor(props.t1Volume.header.dimensions[2] / 2);
  }
  renderSlices();
});

// Function to render all slices
const renderSlices = () => {
  if (!props.t1Volume) return;

  // Render T1 slice
  const canvasT1 = canvasRef.value;
  if (canvasT1) {
    const ctx = canvasT1.getContext('2d');
    if (ctx) {
      const { dimensions } = props.t1Volume.header;
      const [width, height, depth] = dimensions;

      canvasT1.width = width;
      canvasT1.height = height;

      // Extract slice data
      const sliceData = new Float32Array(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const volumeIndex = x + y * width + sliceIndex.value * width * height;
          sliceData[x + y * width] = props.t1Volume.data[volumeIndex];
        }
      }

      // Normalize and render
      const imageData = ctx.createImageData(width, height);
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < sliceData.length; i++) {
        min = Math.min(min, sliceData[i]);
        max = Math.max(max, sliceData[i]);
      }

      const range = max - min;
      for (let i = 0; i < sliceData.length; i++) {
        const value = Math.round(((sliceData[i] - min) / range) * 255);
        imageData.data[i * 4] = value;
        imageData.data[i * 4 + 1] = value;
        imageData.data[i * 4 + 2] = value;
        imageData.data[i * 4 + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
    }
  }

  // Render original segmentation
  if (props.segmentationVolume) {
    const canvasOriginal = canvasOriginalRef.value;
    if (canvasOriginal) {
      renderSegmentation(canvasOriginal, props.segmentationVolume, sliceIndex.value);
    }
  }

  // Render post-processed segmentation
  if (processedVolume.value) {
    const canvasProcessed = canvasProcessedRef.value;
    if (canvasProcessed) {
      renderProcessedSegmentation(canvasProcessed, processedVolume.value, sliceIndex.value);
    }
  }
};

// Function to render segmentation
const renderSegmentation = (canvas, volume, sliceIdx) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { dimensions } = volume.header;
  const [width, height, depth] = dimensions;

  canvas.width = width;
  canvas.height = height;

  // Create image data
  const imageData = ctx.createImageData(width, height);

  // Extract slice data and apply colormap
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const volumeIndex = x + y * width + sliceIdx * width * height;
      const value = volume.data[volumeIndex];

      // Apply colormap based on class
      let r = 0, g = 0, b = 0, a = 0;

      if (value === 0) {
        // Background - transparent
        r = 0; g = 0; b = 0; a = 0;
      } else if (value === 1) {
        // Class 1 - Blue (CSF)
        r = 65; g = 105; b = 225; a = 200;
      } else if (value === 2) {
        // Class 2 - Green (GM)
        r = 50; g = 205; b = 50; a = 200;
      } else if (value === 3 || value === 4) {
        // Class 3/4 - Orange (WM)
        r = 255; g = 165; b = 0; a = 200;
      }

      const pixelIndex = (y * width + x) * 4;
      imageData.data[pixelIndex] = r;
      imageData.data[pixelIndex + 1] = g;
      imageData.data[pixelIndex + 2] = b;
      imageData.data[pixelIndex + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

// Function to render processed segmentation
const renderProcessedSegmentation = (canvas, volume, sliceIdx) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { dimensions } = volume.header;
  const [width, height, depth] = dimensions;

  canvas.width = width;
  canvas.height = height;

  // Create image data
  const imageData = ctx.createImageData(width, height);

  // Extract slice data and apply colormap
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const volumeIndex = x + y * width + sliceIdx * width * height;
      const value = volume.data[volumeIndex];

      // Apply colormap based on class
      let r = 0, g = 0, b = 0, a = 0;

      if (value === 0) {
        // Background - transparent
        r = 0; g = 0; b = 0; a = 0;
      } else if (value === 1) {
        // Class 1 - Blue (CSF)
        r = 65; g = 105; b = 225; a = 200;
      } else if (value === 2) {
        // Class 2 - Green (GM)
        r = 50; g = 205; b = 50; a = 200;
      } else if (value === 3) {
        // Class 3 - Orange (WM)
        r = 255; g = 165; b = 0; a = 200;
      }

      const pixelIndex = (y * width + x) * 4;
      imageData.data[pixelIndex] = r;
      imageData.data[pixelIndex + 1] = g;
      imageData.data[pixelIndex + 2] = b;
      imageData.data[pixelIndex + 3] = a;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
</script>
