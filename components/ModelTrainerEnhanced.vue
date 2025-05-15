<template>
  <div class="model-trainer-container">
    <div class="debug-panel">
      <h3>Training Debug Information</h3>
      <div class="debug-info">
        <p><strong>Current Phase:</strong> {{ currentTrainingPhase }}</p>
        <p><strong>Current Step:</strong> {{ currentStep }}</p>
        <p><strong>Backend:</strong> {{ tfBackend }}</p>
        <p><strong>Memory Usage:</strong> {{ memoryInfo }}</p>
        <p><strong>Batch Size:</strong> {{ batchSize }}</p>
        <p v-if="trainingProgress > 0"><strong>Training Progress:</strong> {{ Math.round(trainingProgress * 100) }}%</p>
      </div>
    </div>

    <div class="controls">
      <button @click="startTraining" :disabled="isTraining">Start Training</button>
      <button @click="stopTraining" :disabled="!isTraining">Stop Training</button>
      <button @click="exportModel" :disabled="isTraining || !trainedModel">Export Model</button>
    </div>

    <div class="training-logs">
      <h3>Training Logs</h3>
      <div class="log-container">
        <div v-for="(log, index) in trainingLogs" :key="index" :class="['log-entry', log.type]">
          {{ log.timestamp }} - {{ log.message }}
        </div>
      </div>
    </div>

    <div class="visualization" v-if="visualizationData">
      <h3>Training Visualization</h3>
      <canvas ref="visualizationCanvas" width="600" height="400"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import * as tf from '@tensorflow/tfjs';
import { setWasmPath } from '@tensorflow/tfjs-backend-wasm';
import { createUnetModel } from '@/lib/unet-enhanced';
import { gaussianNormalization, formatVolumesForTraining } from '@/utils/volumeUtils.js';

// State variables
const isTraining = ref(false);
const trainedModel = ref(null);
const currentTrainingPhase = ref('Not started');
const currentStep = ref(0);
const trainingProgress = ref(0);
const trainingLogs = ref([]);
const visualizationData = ref(null);
const tfBackend = ref('');
const memoryInfo = ref('');
const batchSize = ref(10);
const shouldStopTraining = ref(false);
const visualizationCanvas = ref(null);
let memoryMonitorInterval = null;

// Emit events
const emit = defineEmits(['training-started', 'training-completed', 'training-error', 'visualization-step']);

// Add a log entry
function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  trainingLogs.value.unshift({ timestamp, message, type });
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Initialize TensorFlow backend with proper error handling
async function initializeTensorFlowBackend() {
  addLog('Initializing TensorFlow backend...', 'info');

  // Set conservative WebGL settings before initializing the backend
  // This helps prevent texture size issues
  tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
  tf.env().set('WEBGL_PACK', false);

  try {
    // First try to use WebGL
    await tf.setBackend('webgl');
    tfBackend.value = 'WebGL';
    addLog('Using WebGL backend', 'success');

    // Set WebGL flags to improve stability
    const gl = tf.backend().getGPGPUContext().gl;
    if (gl) {
      // Get max texture size from WebGL
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      addLog(`WebGL max texture size: ${maxTextureSize}`, 'info');

      // Use a more conservative texture size limit to avoid issues
      // Use 75% of the maximum or 2048, whichever is smaller
      const safeTextureSize = Math.min(2048, Math.floor(maxTextureSize * 0.75));
      tf.env().set('WEBGL_MAX_TEXTURE_SIZE', safeTextureSize);
      addLog(`Setting WEBGL_MAX_TEXTURE_SIZE to ${safeTextureSize}`, 'info');

      // Additional WebGL optimizations
      tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
      tf.env().set('WEBGL_PACK', false);
      tf.env().set('WEBGL_FLUSH_THRESHOLD', 1); // Flush more frequently
      addLog('WebGL optimizations applied', 'info');
    }
  } catch (e) {
    addLog(`WebGL backend failed: ${e.message}`, 'error');
    try {
      // Try to use WASM backend
      setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/');
      await tf.setBackend('wasm');
      tfBackend.value = 'WASM';
      addLog('Using WASM backend', 'success');
    } catch (wasmError) {
      addLog(`WASM backend failed: ${wasmError.message}`, 'error');
      // Fall back to CPU
      await tf.setBackend('cpu');
      tfBackend.value = 'CPU';
      addLog('Using CPU backend (slow)', 'warning');
    }
  }

  // Wait for backend initialization
  await tf.ready();
  addLog(`TensorFlow.js ready with backend: ${tf.getBackend()}`, 'success');

  // Log detailed WebGL information
  logWebGLInfo();
}

// Add WebGL diagnostics function
function logWebGLInfo() {
  try {
    if (tf.getBackend() === 'webgl') {
      const gl = tf.backend().getGPGPUContext().gl;
      console.log("WebGL Information:");
      console.log("Vendor:", gl.getParameter(gl.VENDOR));
      console.log("Renderer:", gl.getParameter(gl.RENDERER));
      console.log("Version:", gl.getParameter(gl.VERSION));
      console.log("Shader Version:", gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
      console.log("Max Texture Size:", gl.getParameter(gl.MAX_TEXTURE_SIZE));
      console.log("Max Viewport Dimensions:", gl.getParameter(gl.MAX_VIEWPORT_DIMS));
      console.log("Max Renderbuffer Size:", gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));

      // Log TensorFlow.js WebGL settings
      console.log("TensorFlow.js WebGL Settings:");
      console.log("WEBGL_VERSION:", tf.env().get('WEBGL_VERSION'));
      console.log("WEBGL_MAX_TEXTURE_SIZE:", tf.env().get('WEBGL_MAX_TEXTURE_SIZE'));
      console.log("WEBGL_FORCE_F16_TEXTURES:", tf.env().get('WEBGL_FORCE_F16_TEXTURES'));
      console.log("WEBGL_PACK:", tf.env().get('WEBGL_PACK'));
      console.log("WEBGL_RENDER_FLOAT32_ENABLED:", tf.env().get('WEBGL_RENDER_FLOAT32_ENABLED'));
    } else {
      console.log(`Current backend is not WebGL, using: ${tf.getBackend()}`);
    }
  } catch (e) {
    console.error("Error getting WebGL info:", e);
  }
}

// Update memory info
function updateMemoryInfo() {
  try {
    const memInfo = tf.memory();
    const usedBytes = (memInfo.numBytes / (1024 * 1024)).toFixed(2);
    const totalBytes = (memInfo.numBytesInGPU / (1024 * 1024)).toFixed(2);
    memoryInfo.value = `${usedBytes} MB used / ${totalBytes} MB total`;
  } catch (e) {
    memoryInfo.value = 'Not available';
  }
}

// Normalize volumes using Gaussian normalization
function normalizeVolumes(volumes) {
  addLog('Normalizing volumes...', 'info');

  const normalizedVolumes = [];
  for (let i = 0; i < volumes.length; i++) {
    const normalizedVolume = gaussianNormalization(volumes[i]);
    normalizedVolumes.push(normalizedVolume);
    addLog(`Normalized volume ${i+1}`, 'info');
  }

  return normalizedVolumes;
}

// Add memory monitoring function
function monitorMemoryUsage() {
  try {
    const memInfo = tf.memory();
    console.log("Memory Usage:");
    console.log(`- Tensors: ${memInfo.numTensors}`);
    console.log(`- Data Buffers: ${memInfo.numDataBuffers}`);
    console.log(`- Total Bytes: ${(memInfo.numBytes / (1024 * 1024)).toFixed(2)} MB`);

    if (tf.getBackend() === 'webgl') {
      console.log(`- GPU Bytes: ${(memInfo.numBytesInGPU / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`- Unreliable GPU Memory: ${memInfo.unreliable ? 'Yes' : 'No'}`);
    }
  } catch (e) {
    console.error("Error monitoring memory:", e);
  }
}

// Start the training process
async function startTraining() {
  if (isTraining.value) {
    addLog('Training already in progress', 'warning');
    return;
  }

  try {
    isTraining.value = true;
    shouldStopTraining.value = false;
    trainingProgress.value = 0;

    emit('training-started');
    addLog('Starting training process...', 'info');

    // Initialize TensorFlow backend
    await initializeTensorFlowBackend();

    // Add WebGL diagnostics function
    logWebGLInfo();

    // Load and prepare data
    addLog('Loading and preparing data...', 'info');

    // This would be replaced with actual data loading from files
    // For now, we'll create some dummy data for demonstration with smaller dimensions
    // to avoid WebGL texture size limitations
    const t1Vols = [
      tf.randomNormal([128, 128, 64]),
      tf.randomNormal([128, 128, 64])
    ];

    const t2Vols = [
      tf.randomNormal([128, 128, 64]),
      tf.randomNormal([128, 128, 64])
    ];

    const labelVols = [
      tf.randomUniform([128, 128, 64], 0, 2).floor(),
      tf.randomUniform([128, 128, 64], 0, 2).floor()
    ];

    // Normalize volumes
    const normalizedT1Vols = normalizeVolumes(t1Vols);
    const normalizedT2Vols = normalizeVolumes(t2Vols);

    // Step 1: Train brain segmentation model (binary segmentation)
    currentTrainingPhase.value = 'Step 1: Brain Segmentation';
    currentStep.value = 1;
    addLog('Starting Step 1: Brain Segmentation', 'info');

    // Format data for first stage
    const { xs: xTrainStage1, ys: yTrainStage1 } = formatVolumesForTraining(
        normalizedT1Vols,
        normalizedT2Vols,
        labelVols,
        batchSize.value
    );

    if (!xTrainStage1 || !yTrainStage1) {
      throw new Error('Failed to prepare training data for stage 1');
    }

    // Create and train first stage model
    addLog('Creating U-Net model for stage 1...', 'info');
    const unetStage1 = createUnetModel([128, 128, 2]);

    // Compile model
    unetStage1.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    // Convert labels to binary for first stage (brain vs. background)
    const binaryLabels = yTrainStage1.greater(0).cast('float32');

    // Train first stage model
    addLog('Training stage 1 model...', 'info');

    // Add this to the startTraining function to periodically monitor memory
    memoryMonitorInterval = setInterval(() => {
      if (isTraining.value) {
        monitorMemoryUsage();
      }
    }, 5000);

    // Visualize training data
    visualizeTrainingData(xTrainStage1, binaryLabels, 0);

    await unetStage1.fit(xTrainStage1, binaryLabels, {
      epochs: 10,
      batchSize: 4,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          addLog(`Stage 1 - Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`, 'info');
          trainingProgress.value = (epoch + 1) / 10;

          // Emit visualization event
          emit('visualization-step', {
            step: 1,
            epoch: epoch + 1,
            loss: logs.loss,
            accuracy: logs.acc
          });

          return shouldStopTraining.value ? true : false; // Stop if requested
        }
      }
    });

    if (shouldStopTraining.value) {
      addLog('Training stopped by user', 'warning');
      isTraining.value = false;
      return;
    }

    // Evaluate models
    addLog('Evaluating models...', 'info');

    // Save trained model
    trainedModel.value = {
      stage1: unetStage1
    };

    addLog('Training completed successfully!', 'success');
    emit('training-completed', trainedModel.value);

  } catch (error) {
    addLog(`Training error: ${error.message}`, 'error');
    console.error('Training error:', error);
    emit('training-error', error);
  } finally {
    isTraining.value = false;
    trainingProgress.value = 1;

    // Clean up tensors
    try {
      tf.disposeVariables();
      tf.tidy(() => {
        // Empty tidy function to clean up unused tensors
      });
      updateMemoryInfo();
      addLog('Memory cleaned up', 'info');
    } catch (e) {
      addLog(`Error cleaning up memory: ${e.message}`, 'error');
    }

    // Make sure to clear the interval when training stops
    if (memoryMonitorInterval) {
      clearInterval(memoryMonitorInterval);
      memoryMonitorInterval = null;
    }
  }
}

// Stop the training process
function stopTraining() {
  if (!isTraining.value) {
    return;
  }

  addLog('Stopping training...', 'warning');
  shouldStopTraining.value = true;
}

// Export the trained model
async function exportModel() {
  if (!trainedModel.value) {
    addLog('No trained model to export', 'error');
    return;
  }

  try {
    addLog('Exporting model...', 'info');

    // Export stage 1 model
    await trainedModel.value.stage1.save('downloads://unet-brain-segmentation');
    addLog('Stage 1 model exported', 'success');

  } catch (error) {
    addLog(`Export error: ${error.message}`, 'error');
  }
}

// Visualize training data
function visualizeTrainingData(x, y, stage) {
  try {
    // Get a sample from the training data
    const sampleIdx = Math.floor(Math.random() * x.shape[0]);
    const xSample = x.slice([sampleIdx, 0, 0, 0], [1, x.shape[1], x.shape[2], x.shape[3]]);
    const ySample = y.slice([sampleIdx, 0, 0], [1, y.shape[1], y.shape[2]]);

    // Convert to image data
    const xChannel = stage === 0 ? 0 : 2; // Use T1 for stage 1, prediction for stage 2
    const xImage = xSample.slice([0, 0, 0, xChannel], [1, xSample.shape[1], xSample.shape[2], 1])
        .reshape([xSample.shape[1], xSample.shape[2]])
        .div(tf.scalar(tf.max(xSample).dataSync()[0])) // Normalize to [0,1]
        .mul(255)
        .cast('int32');

    const yImage = ySample.reshape([ySample.shape[1], ySample.shape[2]])
        .mul(255)
        .cast('int32');

    // Get data as arrays
    const xData = xImage.dataSync();
    const yData = yImage.dataSync();

    // Store visualization data
    visualizationData.value = {
      x: xData,
      y: yData,
      width: xSample.shape[2],
      height: xSample.shape[1],
      stage
    };

    // Emit visualization event
    emit('visualization-step', {
      stage,
      xData: Array.from(xData),
      yData: Array.from(yData),
      width: xSample.shape[2],
      height: xSample.shape[1]
    });

  } catch (error) {
    addLog(`Visualization error: ${error.message}`, 'error');
  }
}

// Draw visualization when data changes
watch(visualizationData, (newData) => {
  if (!newData || !visualizationCanvas.value) return;

  const canvas = visualizationCanvas.value;
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw input image
  const inputImageData = new ImageData(
      new Uint8ClampedArray(newData.x.length * 4),
      newData.width,
      newData.height
  );

  for (let i = 0; i < newData.x.length; i++) {
    const value = newData.x[i];
    inputImageData.data[i * 4] = value;     // R
    inputImageData.data[i * 4 + 1] = value; // G
    inputImageData.data[i * 4 + 2] = value; // B
    inputImageData.data[i * 4 + 3] = 255;   // A
  }

  // Draw label image
  const labelImageData = new ImageData(
      new Uint8ClampedArray(newData.y.length * 4),
      newData.width,
      newData.height
  );

  for (let i = 0; i < newData.y.length; i++) {
    const value = newData.y[i];
    labelImageData.data[i * 4] = 0;         // R
    labelImageData.data[i * 4 + 1] = value; // G
    labelImageData.data[i * 4 + 2] = 0;     // B
    labelImageData.data[i * 4 + 3] = value > 0 ? 200 : 0; // A
  }

  // Create temporary canvases
  const tempCanvas1 = document.createElement('canvas');
  tempCanvas1.width = newData.width;
  tempCanvas1.height = newData.height;
  const tempCtx1 = tempCanvas1.getContext('2d');
  tempCtx1.putImageData(inputImageData, 0, 0);

  const tempCanvas2 = document.createElement('canvas');
  tempCanvas2.width = newData.width;
  tempCanvas2.height = newData.height;
  const tempCtx2 = tempCanvas2.getContext('2d');
  tempCtx2.putImageData(labelImageData, 0, 0);

  // Draw to main canvas
  ctx.drawImage(tempCanvas1, 0, 0, canvas.width / 2, canvas.height);
  ctx.drawImage(tempCanvas2, canvas.width / 2, 0, canvas.width / 2, canvas.height);

  // Add labels
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Stage ${newData.stage + 1} Input`, 10, 20);
  ctx.fillText(`Stage ${newData.stage + 1} Label`, canvas.width / 2 + 10, 20);
});

// Setup and cleanup
onMounted(async () => {
  await initializeTensorFlowBackend();

  // Set up memory monitoring
  const memoryMonitor = setInterval(() => {
    if (isTraining.value) {
      updateMemoryInfo();
    }
  }, 5000);

  // Clean up on unmount
  onUnmounted(() => {
    clearInterval(memoryMonitor);
    if (memoryMonitorInterval) {
      clearInterval(memoryMonitorInterval);
    }
    if (trainedModel.value) {
      if (trainedModel.value.stage1) trainedModel.value.stage1.dispose();
      if (trainedModel.value.stage2) trainedModel.value.stage2.dispose();
    }
    tf.disposeVariables();
    tf.tidy(() => {
      // Empty tidy function to clean up unused tensors
    });
  });
});
</script>

<style scoped>
.model-trainer-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-panel {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 15px;
  color: #fff;
}

.debug-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  background-color: #4a5568;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #2d3748;
}

button:disabled {
  background-color: #718096;
  cursor: not-allowed;
}

.training-logs {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 15px;
  color: #fff;
  height: 300px;
  overflow-y: auto;
}

.log-container {
  display: flex;
  flex-direction: column-reverse;
  gap: 5px;
}

.log-entry {
  padding: 5px;
  border-radius: 4px;
  font-family: monospace;
}

.log-entry.info {
  background-color: #2d3748;
}

.log-entry.success {
  background-color: #276749;
}

.log-entry.warning {
  background-color: #975a16;
}

.log-entry.error {
  background-color: #9b2c2c;
}

.visualization {
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 15px;
  color: #fff;
}

canvas {
  width: 100%;
  height: auto;
  background-color: #2d3748;
  border-radius: 4px;
}
</style>
