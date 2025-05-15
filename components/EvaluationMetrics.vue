<template>
  <div v-if="segmentationVolume && groundTruthVolume" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Evaluation Metrics
      </h3>
    </div>

    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left column: Metrics -->
        <div class="space-y-6">
          <!-- Dice Coefficient -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Dice Coefficient</span>
              <span class="text-base font-bold text-gray-900 dark:text-gray-100">
                {{ metrics.dice !== null ? `${(metrics.dice * 100).toFixed(2)}%` : "Calculating..." }}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="{
                  'bg-green-500 dark:bg-green-400': metrics.dice > 0.8,
                  'bg-yellow-500 dark:bg-yellow-400': metrics.dice > 0.6 && metrics.dice <= 0.8,
                  'bg-red-500 dark:bg-red-400': metrics.dice <= 0.6
                }"
                  :style="{ width: `${metrics.dice * 100}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Measures the overlap between prediction and ground truth
            </div>
          </div>

          <!-- IoU -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">IoU (Intersection over Union)</span>
              <span class="text-base font-bold text-gray-900 dark:text-gray-100">
                {{ metrics.iou !== null ? `${(metrics.iou * 100).toFixed(2)}%` : "Calculating..." }}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="{
                  'bg-green-500 dark:bg-green-400': metrics.iou > 0.7,
                  'bg-yellow-500 dark:bg-yellow-400': metrics.iou > 0.5 && metrics.iou <= 0.7,
                  'bg-red-500 dark:bg-red-400': metrics.iou <= 0.5
                }"
                  :style="{ width: `${metrics.iou * 100}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Ratio of intersection to union of prediction and ground truth
            </div>
          </div>

          <!-- Precision -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Precision</span>
              <span class="text-base font-bold text-gray-900 dark:text-gray-100">
                {{ metrics.precision !== null ? `${(metrics.precision * 100).toFixed(2)}%` : "Calculating..." }}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="{
                  'bg-green-500 dark:bg-green-400': metrics.precision > 0.8,
                  'bg-yellow-500 dark:bg-yellow-400': metrics.precision > 0.6 && metrics.precision <= 0.8,
                  'bg-red-500 dark:bg-red-400': metrics.precision <= 0.6
                }"
                  :style="{ width: `${metrics.precision * 100}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Ratio of true positives to all predicted positives
            </div>
          </div>
        </div>

        <!-- Right column: More metrics and feedback -->
        <div class="space-y-6">
          <!-- Sensitivity -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sensitivity (Recall)</span>
              <span class="text-base font-bold text-gray-900 dark:text-gray-100">
                {{ metrics.sensitivity !== null ? `${(metrics.sensitivity * 100).toFixed(2)}%` : "Calculating..." }}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="{
                  'bg-green-500 dark:bg-green-400': metrics.sensitivity > 0.8,
                  'bg-yellow-500 dark:bg-yellow-400': metrics.sensitivity > 0.6 && metrics.sensitivity <= 0.8,
                  'bg-red-500 dark:bg-red-400': metrics.sensitivity <= 0.6
                }"
                  :style="{ width: `${metrics.sensitivity * 100}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Ratio of true positives to all actual positives
            </div>
          </div>

          <!-- Specificity -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Specificity</span>
              <span class="text-base font-bold text-gray-900 dark:text-gray-100">
                {{ metrics.specificity !== null ? `${(metrics.specificity * 100).toFixed(2)}%` : "Calculating..." }}
              </span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="{
                  'bg-green-500 dark:bg-green-400': metrics.specificity > 0.8,
                  'bg-yellow-500 dark:bg-yellow-400': metrics.specificity > 0.6 && metrics.specificity <= 0.8,
                  'bg-red-500 dark:bg-red-400': metrics.specificity <= 0.6
                }"
                  :style="{ width: `${metrics.specificity * 100}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Ratio of true negatives to all actual negatives
            </div>
          </div>

          <!-- Feedback section -->
          <div v-if="feedback" class="mt-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Analysis & Recommendations</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ feedback }}</p>
            <div class="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span>If you need to improve the model, return to the training tab and adjust parameters or add more data.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  segmentationVolume: {
    type: Object,
    default: null
  },
  groundTruthVolume: {
    type: Object,
    default: null
  }
});

const metrics = ref({
  dice: null,
  iou: null,
  precision: null,
  sensitivity: null,
  specificity: null
});

const feedback = ref(null);

// Calculate metrics when volumes change
watch(
    [() => props.segmentationVolume, () => props.groundTruthVolume],
    async ([newSeg, newGt]) => {
      if (!newSeg || !newGt) return;

      try {
        // Convert volumes to arrays
        const segData = Array.from(newSeg.data);
        const gtData = Array.from(newGt.data);

        // Fix class 4 to class 3 in ground truth
        const fixedGtData = gtData.map((val) => (val === 4 ? 3 : val));

        // Calculate metrics for each class
        const numClasses = 4;
        let totalDice = 0;
        let totalIou = 0;
        let totalPrecision = 0;
        let totalSensitivity = 0;
        let totalSpecificity = 0;
        let classCount = 0;

        for (let c = 1; c < numClasses; c++) {
          // Skip background class (0)
          // Create binary masks for current class
          const predMask = segData.map((val) => (val === c ? 1 : 0));
          const gtMask = fixedGtData.map((val) => (val === c ? 1 : 0));

          // Calculate metrics
          let truePositives = 0;
          let falsePositives = 0;
          let trueNegatives = 0;
          let falseNegatives = 0;

          for (let i = 0; i < predMask.length; i++) {
            if (predMask[i] === 1 && gtMask[i] === 1) truePositives++;
            if (predMask[i] === 1 && gtMask[i] === 0) falsePositives++;
            if (predMask[i] === 0 && gtMask[i] === 0) trueNegatives++;
            if (predMask[i] === 0 && gtMask[i] === 1) falseNegatives++;
          }

          // Only include classes that are present in ground truth
          const gtSum = truePositives + falseNegatives;
          if (gtSum > 0) {
            // Dice coefficient: 2*TP / (2*TP + FP + FN)
            const dice = (2 * truePositives) / (2 * truePositives + falsePositives + falseNegatives);

            // IoU: TP / (TP + FP + FN)
            const iou = truePositives / (truePositives + falsePositives + falseNegatives);

            // Precision: TP / (TP + FP)
            const precision = truePositives / (truePositives + falsePositives);

            // Sensitivity (Recall): TP / (TP + FN)
            const sensitivity = truePositives / (truePositives + falseNegatives);

            // Specificity: TN / (TN + FP)
            const specificity = trueNegatives / (trueNegatives + falsePositives);

            totalDice += dice;
            totalIou += iou;
            totalPrecision += precision;
            totalSensitivity += sensitivity;
            totalSpecificity += specificity;
            classCount++;
          }
        }

        // Calculate average metrics
        if (classCount > 0) {
          metrics.value = {
            dice: totalDice / classCount,
            iou: totalIou / classCount,
            precision: totalPrecision / classCount,
            sensitivity: totalSensitivity / classCount,
            specificity: totalSpecificity / classCount,
          };

          // Generate feedback based on Dice score
          feedback.value = generateFeedback(metrics.value.dice);
        }
      } catch (error) {
        console.error('Error calculating metrics:', error);
      }
    },
    { immediate: true }
);

// Function to generate feedback based on Dice score
const generateFeedback = (diceScore) => {
  if (diceScore >= 0.85) {
    return 'Excellent segmentation! The model is performing very well with high accuracy across all tissue classes. This model is suitable for clinical applications.';
  } else if (diceScore >= 0.75) {
    return 'Good segmentation quality. For further improvement, consider adding more training data or implementing data augmentation techniques such as rotation, flipping, and intensity variations.';
  } else if (diceScore >= 0.65) {
    return 'Moderate segmentation quality. Consider increasing training epochs, adding data augmentation, or adjusting the learning rate. You might also benefit from fine-tuning the model architecture.';
  } else {
    return 'The segmentation quality needs improvement. Try the following: 1) Add more diverse training data, 2) Implement comprehensive data augmentation, 3) Adjust model architecture with deeper networks or additional skip connections, 4) Consider transfer learning from a pre-trained model, and 5) Experiment with different optimization strategies.';
  }
};
</script>
