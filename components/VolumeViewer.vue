<template>
  <div class="flex flex-col items-center">
    <div class="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative shadow-inner">
      <!-- Loading overlay -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm z-10">
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-2 text-sm text-gray-200">Loading volume...</p>
        </div>
      </div>

      <!-- Canvas for rendering -->
      <canvas ref="canvasRef" class="w-full h-full object-contain"></canvas>

      <!-- Overlay controls -->
      <div class="absolute bottom-2 right-2 flex space-x-1">
        <button
            @click="zoomIn"
            class="p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
            aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
            @click="zoomOut"
            class="p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
            aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
        </button>
        <button
            @click="resetView"
            class="p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
            aria-label="Reset view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <div class="w-full mt-4 space-y-3">
      <!-- Slice slider -->
      <div class="flex items-center space-x-2">
        <button
            @click="decrementSlice"
            :disabled="sliceIndex <= 0"
            class="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous slice"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <div class="flex-1 relative">
          <input
              type="range"
              v-model="sliceIndex"
              :min="0"
              :max="maxSliceIndex"
              step="1"
              class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
          />
          <div class="absolute -top-6 left-0 right-0 flex justify-center">
            <div
                class="px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-md transform -translate-x-1/2"
                :style="{ left: `${(sliceIndex / maxSliceIndex) * 100}%` }"
            >
              {{ sliceIndex + 1 }}
            </div>
          </div>
        </div>

        <button
            @click="incrementSlice"
            :disabled="sliceIndex >= maxSliceIndex"
            class="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next slice"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Axis selection -->
      <div class="flex justify-center space-x-2">
        <button
            v-for="(axisOption, index) in ['Sagittal', 'Coronal', 'Axial']"
            :key="index"
            @click="handleAxisChange(index)"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="axis === index
            ? 'bg-blue-600 dark:bg-blue-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          {{ axisOption }}
        </button>
      </div>

      <!-- Layer selection buttons (for segmentation) -->
      <div v-if="isSegmentation || overlayVolume" class="flex justify-center space-x-2 mt-2">
        <button
            v-for="(layer, index) in [
            { value: 1, label: 'Background' },
            { value: 2, label: 'WM + BG' },
            { value: 3, label: 'All Tissues' }
          ]"
            :key="index"
            @click="segLayer = layer.value"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="segLayer === layer.value
            ? 'bg-blue-600 dark:bg-blue-700 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'"
        >
          {{ layer.label }}
        </button>
      </div>

      <!-- Volume info -->
      <div v-if="volume && volume.header" class="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>{{ volume.header.dimensions.join(' × ') }}</span>
        <span v-if="volume.header.pixelDimensions"> | {{ volume.header.pixelDimensions.map(d => d.toFixed(2)).join(' × ') }} mm</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { extractSlice, normalizeSlice, sliceToImageData, segmentationColormap } from '@/lib/analyze-parser';

// Add threshold prop
const props = defineProps({
  volume: {
    type: Object,
    required: true
  },
  overlayVolume: {
    type: Object,
    default: null
  },
  isSegmentation: {
    type: Boolean,
    default: false
  },
  threshold: {
    type: Number,
    default: 10
  }
});

const canvasRef = ref(null);
const sliceIndex = ref(0);
const axis = ref(2); // 0: Sagittal, 1: Coronal, 2: Axial
const segLayer = ref(3); // 1: background, 2: white matter+bg, 3: all
const isLoading = ref(true);
const zoomLevel = ref(1);
const panOffset = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// Compute max slice index based on volume dimensions
const maxSliceIndex = computed(() => {
  if (!props.volume || !props.volume.header || !props.volume.header.dimensions) return 0;
  return props.volume.header.dimensions[axis.value] - 1;
});

// Function to get segmentation colormap based on layer
const getSegmentationColormap = (value, layer) => {
  // For layer 1, only show background (transparent)
  if (layer === 1) {
    return value === 0 ? [0, 0, 0, 0] : [0, 0, 0, 0];
  }

  // For layer 2, show background and white matter (class 3)
  if (layer === 2) {
    if (value === 0) return [0, 0, 0, 0]; // Background (transparent)
    if (value === 3) return [255, 165, 0, 200]; // WM (orange, semi-transparent)
    return [0, 0, 0, 0]; // Hide other classes
  }

  // For layer 3 (default), show all classes
  switch (value) {
    case 0:
      return [0, 0, 0, 0]; // Background (transparent)
    case 1:
      return [65, 105, 225, 200]; // CSF (royal blue, semi-transparent)
    case 2:
      return [50, 205, 50, 200]; // GM (lime green, semi-transparent)
    case 3:
      return [255, 165, 0, 200]; // WM (orange, semi-transparent)
    default:
      return [255, 0, 0, 200]; // Error (red, semi-transparent)
  }
};

// Watch for changes in volume, overlay, slice index, axis, or segLayer
watch(
    [() => props.volume, () => props.overlayVolume, sliceIndex, axis, segLayer, zoomLevel, panOffset],
    () => {
      renderSlice();
    }
);

// Initialize when component is mounted
onMounted(() => {
  if (props.volume) {
    // Set slice to middle of the volume
    sliceIndex.value = Math.floor(props.volume.header.dimensions[axis.value] / 2);

    // Setup canvas event listeners
    setupCanvasInteractions();

    renderSlice();
  }

  // Hide loading indicator after a short delay
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

// Function to render the current slice
const renderSlice = () => {
  const canvas = canvasRef.value;
  if (!canvas || !props.volume) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Extract slice
  const slice = extractSlice(props.volume, sliceIndex.value, axis.value);

  // Set canvas dimensions
  canvas.width = slice.width;
  canvas.height = slice.height;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply zoom and pan transformations
  ctx.save();
  ctx.translate(panOffset.value.x, panOffset.value.y);
  ctx.scale(zoomLevel.value, zoomLevel.value);

  // Normalize slice data
  const normalizedSlice = normalizeSlice(slice.data, props.volume.min, props.volume.max);

  // Convert to image data
  const imageData = sliceToImageData(
      { ...slice, data: normalizedSlice },
      props.isSegmentation ? segmentationColormap : undefined
  );

  // Draw base image
  ctx.putImageData(imageData, 0, 0);

  // Draw overlay if available
  if (props.overlayVolume) {
    const overlaySlice = extractSlice(props.overlayVolume, sliceIndex.value, axis.value);

    // Only proceed if dimensions match
    if (overlaySlice.width === slice.width && overlaySlice.height === slice.height) {
      const normalizedOverlay = normalizeSlice(overlaySlice.data, props.overlayVolume.min, props.overlayVolume.max);

      // Create custom colormap based on selected layer
      const layerColormap = (value) => {
        const scaledValue = Math.round(value * 3); // Scale to 0-3 range
        return getSegmentationColormap(scaledValue, segLayer.value);
      };

      const overlayImageData = sliceToImageData({ ...overlaySlice, data: normalizedOverlay }, layerColormap);

      // Create a temporary canvas for the overlay
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = slice.width;
      tempCanvas.height = slice.height;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        tempCtx.putImageData(overlayImageData, 0, 0);

        // Draw the overlay with transparency
        ctx.globalAlpha = 0.7;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  // Restore canvas state
  ctx.restore();

  // Draw a border around the image
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
};

// Function to handle axis change
const handleAxisChange = (newAxis) => {
  axis.value = newAxis;
  // Set slice to middle of the new axis
  sliceIndex.value = Math.floor(props.volume.header.dimensions[newAxis] / 2);

  // Reset zoom and pan
  resetView();
};

// Function to increment slice
const incrementSlice = () => {
  if (sliceIndex.value < maxSliceIndex.value) {
    sliceIndex.value++;
  }
};

// Function to decrement slice
const decrementSlice = () => {
  if (sliceIndex.value > 0) {
    sliceIndex.value--;
  }
};

// Function to zoom in
const zoomIn = () => {
  zoomLevel.value = Math.min(5, zoomLevel.value + 0.25);
};

// Function to zoom out
const zoomOut = () => {
  zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.25);
};

// Function to reset view
const resetView = () => {
  zoomLevel.value = 1;
  panOffset.value = { x: 0, y: 0 };
};

// Setup canvas interactions
const setupCanvasInteractions = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Mouse wheel for zooming
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  });

  // Mouse drag for panning
  canvas.addEventListener('mousedown', (e) => {
    isDragging.value = true;
    dragStart.value = { x: e.clientX - panOffset.value.x, y: e.clientY - panOffset.value.y };
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging.value) {
      panOffset.value = {
        x: e.clientX - dragStart.value.x,
        y: e.clientY - dragStart.value.y
      };
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDragging.value = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging.value = false;
  });

  // Touch events for mobile
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging.value = true;
      dragStart.value = {
        x: e.touches[0].clientX - panOffset.value.x,
        y: e.touches[0].clientY - panOffset.value.y
      };
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    if (isDragging.value && e.touches.length === 1) {
      panOffset.value = {
        x: e.touches[0].clientX - dragStart.value.x,
        y: e.touches[0].clientY - dragStart.value.y
      };
      e.preventDefault();
    }
  });

  canvas.addEventListener('touchend', () => {
    isDragging.value = false;
  });
};

// Update the rendering logic to apply the threshold for ground truth
const dimensions = computed(() => {
  if (!props.volume || !props.volume.header || !props.volume.header.dimensions) return [0, 0];

  const dims = props.volume.header.dimensions;

  switch (axis.value) {
    case 0: // Sagittal
      return [dims[1], dims[2]];
    case 1: // Coronal
      return [dims[0], dims[2]];
    case 2: // Axial
      return [dims[0], dims[1]];
    default:
      return [0, 0];
  }
});

const getCurrentSlice = () => {
  if (!props.volume) return [];

  const sliceSize = dimensions.value[0] * dimensions.value[1];
  const slice = new Float32Array(sliceSize);
  const dims = props.volume.header.dimensions;

  let index = 0;

  switch (axis.value) {
    case 0: // Sagittal
      for (let z = 0; z < dims[2]; z++) {
        for (let y = 0; y < dims[1]; y++) {
          const x = sliceIndex.value;
          slice[index++] = props.volume.data[x + y * dims[0] + z * dims[0] * dims[1]];
        }
      }
      break;
    case 1: // Coronal
      for (let z = 0; z < dims[2]; z++) {
        for (let x = 0; x < dims[0]; x++) {
          const y = sliceIndex.value;
          slice[index++] = props.volume.data[x + y * dims[0] + z * dims[0] * dims[1]];
        }
      }
      break;
    case 2: // Axial
      for (let y = 0; y < dims[1]; y++) {
        for (let x = 0; x < dims[0]; x++) {
          const z = sliceIndex.value;
          slice[index++] = props.volume.data[x + y * dims[0] + z * dims[0] * dims[1]];
        }
      }
      break;
  }

  return slice;
};

const getSegmentationColor = (value) => {
  switch (value) {
    case 0:
      return { r: 0, g: 0, b: 0, a: 0 }; // Background (transparent)
    case 1:
      return { r: 65, g: 105, b: 225, a: 200 }; // CSF (royal blue, semi-transparent)
    case 2:
      return { r: 50, g: 205, b: 50, a: 200 }; // GM (lime green, semi-transparent)
    case 3:
      return { r: 255, g: 165, b: 0, a: 200 }; // WM (orange, semi-transparent)
    default:
      return { r: 255, g: 0, b: 0, a: 200 }; // Error (red, semi-transparent)
  }
};

const drawOverlay = () => {
  if (!props.overlayVolume) return;

  // Get the overlay slice
  const overlaySlice = getCurrentSlice(props.overlayVolume);

  // Create an image data object for the overlay
  const overlayImageData = canvas.getContext('2d').createImageData(dimensions.value[0], dimensions.value[1]);

  // Fill the image data for the overlay
  for (let y = 0; y < dimensions.value[1]; y++) {
    for (let x = 0; x < dimensions.value[0]; x++) {
      const i = (y * dimensions.value[0] + x);
      const pixelIndex = (y * dimensions.value[0] + x) * 4;

      let value = overlaySlice[i];

      // Apply threshold for ground truth if this is a segmentation
      if (props.isSegmentation && !props.overlayVolume) {
        value = value > props.threshold ? 1 : 0;
      }

      // Set the pixel color based on the value
      if (props.isSegmentation) {
        // Use a colormap for segmentation
        const color = getSegmentationColor(value);
        overlayImageData.data[pixelIndex] = color.r;
        overlayImageData.data[pixelIndex + 1] = color.g;
        overlayImageData.data[pixelIndex + 2] = color.b;
        overlayImageData.data[pixelIndex + 3] = color.a;
      } else {
        // Grayscale for normal volumes
        const intensity = Math.max(0, Math.min(255, Math.round(255 * (value - props.overlayVolume.min) / (props.overlayVolume.max - props.overlayVolume.min))));
        overlayImageData.data[pixelIndex] = intensity;
        overlayImageData.data[pixelIndex + 1] = intensity;
        overlayImageData.data[pixelIndex + 2] = intensity;
        overlayImageData.data[pixelIndex + 3] = 255;
      }
    }
  }

  // Draw the overlay image data to the canvas
  canvas.getContext('2d').putImageData(overlayImageData, 0, 0);
};

const canvas = canvasRef.value;
const renderVolume = () => {
  if (!props.volume) return;

  // Get the current slice
  const slice = getCurrentSlice();

  // Clear the canvas
  const ctx = canvasRef.value.getContext('2d');
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  // Create an image data object
  const imageData = ctx.createImageData(dimensions.value[0], dimensions.value[1]);

  // Fill the image data
  for (let y = 0; y < dimensions.value[1]; y++) {
    for (let x = 0; x < dimensions.value[0]; x++) {
      const i = (y * dimensions.value[0] + x);
      const pixelIndex = (y * dimensions.value[0] + x) * 4;

      let value = slice[i];

      // Apply threshold for ground truth if this is a segmentation
      if (props.isSegmentation && !props.overlayVolume) {
        value = value > props.threshold ? 1 : 0;
      }

      // Set the pixel color based on the value
      if (props.isSegmentation) {
        // Use a colormap for segmentation
        const color = getSegmentationColor(value);
        imageData.data[pixelIndex] = color.r;
        imageData.data[pixelIndex + 1] = color.g;
        imageData.data[pixelIndex + 2] = color.b;
        imageData.data[pixelIndex + 3] = color.a;
      } else {
        // Grayscale for normal volumes
        const intensity = Math.max(0, Math.min(255, Math.round(255 * (value - props.volume.min) / (props.volume.max - props.volume.min))));
        imageData.data[pixelIndex] = intensity;
        imageData.data[pixelIndex + 1] = intensity;
        imageData.data[pixelIndex + 2] = intensity;
        imageData.data[pixelIndex + 3] = 255;
      }
    }
  }

  // Draw the image data to the canvas
  ctx.putImageData(imageData, 0, 0);

  // Draw overlay if available
  if (props.overlayVolume) {
    drawOverlay();
  }
};
</script>

<style scoped>
/* Custom slider styling */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dark input[type="range"]::-webkit-slider-thumb {
  background: #3b82f6;
  border: 2px solid #1f2937;
}

.dark input[type="range"]::-moz-range-thumb {
  background: #3b82f6;
  border: 2px solid #1f2937;
}
</style>
