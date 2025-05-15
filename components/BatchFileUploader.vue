<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        Batch File Uploader
      </h3>
    </div>

    <div class="p-6">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Upload multiple files at once. The system will automatically recognize and group files by patient.
      </p>

      <div class="space-y-6">
        <!-- File upload area -->
        <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            @click="handleFileSelect"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Drag and drop files here, or click to select files
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Supported formats: .hdr, .img, .nii, .nii.gz, .dcm
          </p>
          <input
              type="file"
              ref="fileInputRef"
              @change="handleFilesChange"
              multiple
              accept=".hdr,.img,.nii,.nii.gz,.dcm"
              class="hidden"
          />
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="mt-4">
          <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Processing files...</span>
            <span>{{ Math.round(progress) }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
                class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 relative"
                :style="{ width: `${progress}%` }"
            >
              <div class="absolute inset-0 bg-white/20 animate-progress-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
          {{ error }}
        </div>

        <!-- Recognized Patients -->
        <div v-if="Object.keys(subjects).length > 0" class="mt-4">
          <h4 class="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
            Recognized Subjects ({{ Object.keys(subjects).length }})
          </h4>
          <div class="bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th class="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Subject</th>
                <th class="text-center px-4 py-2 font-medium text-gray-700 dark:text-gray-300">T1</th>
                <th class="text-center px-4 py-2 font-medium text-gray-700 dark:text-gray-300">T2</th>
                <th class="text-center px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Label</th>
                <th class="text-center px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Status</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="subject in Object.values(subjects)" :key="subject.id" class="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{{ subject.id }}</td>
                <td class="px-4 py-3 text-center">
                    <span v-if="subject.files.t1Hdr && subject.files.t1Img" class="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  <span v-else class="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </span>
                </td>
                <td class="px-4 py-3 text-center">
                    <span v-if="subject.files.t2Hdr && subject.files.t2Img" class="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  <span v-else class="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </span>
                </td>
                <td class="px-4 py-3 text-center">
                    <span v-if="subject.files.labelHdr && subject.files.labelImg" class="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  <span v-else class="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </span>
                </td>
                <td class="px-4 py-3 text-center">
                    <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': subject.isLoaded,
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': !subject.isLoaded && subject.isComplete,
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': !subject.isLoaded && !subject.isComplete
                      }"
                    >
                      {{ subject.isLoaded ? "Loaded" : subject.isComplete ? "Ready" : "Incomplete" }}
                    </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Summary and Actions -->
        <div class="mt-6 space-y-4">
          <div class="flex flex-wrap gap-4 items-center justify-between bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">Complete: {{ completeSubjects.length }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">Loaded: {{ loadedSubjects.length }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span class="text-sm text-gray-700 dark:text-gray-300">Remaining: {{ remainingSubjects }}</span>
              </div>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ Object.keys(subjects).length }} subjects total
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
                @click="loadSubjects(true)"
                :disabled="isLoading || remainingSubjects === 0"
                class="px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isLoading || remainingSubjects === 0 ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <span>Load for Training</span>
            </button>
            <button
                @click="loadSubjects(false)"
                :disabled="isLoading || remainingSubjects === 0"
                class="px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="isLoading || remainingSubjects === 0 ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
              <span>Load for Validation</span>
            </button>
          </div>

          <button
              @click="clearSubjects"
              :disabled="isLoading || Object.keys(subjects).length === 0"
              class="w-full px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="isLoading || Object.keys(subjects).length === 0 ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>Clear All</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { parseAnalyzeVolume } from '@/lib/analyze-parser';

const emit = defineEmits(['subjects-loaded']);

const subjects = ref({});
const isLoading = ref(false);
const progress = ref(0);
const error = ref(null);
const fileInputRef = ref(null);

const completeSubjects = computed(() =>
    Object.values(subjects.value).filter(subject => subject.isComplete)
);

const loadedSubjects = computed(() =>
    Object.values(subjects.value).filter(subject => subject.isLoaded)
);

const remainingSubjects = computed(() =>
    completeSubjects.value.length - loadedSubjects.value.length
);

const handleFileSelect = () => {
  fileInputRef.value?.click();
};

const handleFileDrop = (e) => {
  e.preventDefault();
  if (e.dataTransfer.files) {
    handleFilesChange({ target: { files: e.dataTransfer.files } });
  }
};

const handleFilesChange = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  isLoading.value = true;
  error.value = null;
  progress.value = 0;

  try {
    // Group files by subject
    const newSubjects = { ...subjects.value };
    const fileArray = Array.from(files);

    // Parse file names to identify subjects and modalities
    for (const file of fileArray) {
      // Expected format: subject-[number]-[T1/T2/label].[hdr/img]
      const match = file.name.match(/subject-(\d+)-([^.]+)\.([^.]+)$/);
      if (!match) {
        console.warn(`File ${file.name} doesn't match the expected naming pattern, skipping`);
        continue;
      }

      const [_, subjectId, modality, extension] = match;
      const subjectKey = `subject-${subjectId}`;

      // Initialize subject if it doesn't exist
      if (!newSubjects[subjectKey]) {
        newSubjects[subjectKey] = {
          id: subjectKey,
          files: {},
          isComplete: false,
          isLoaded: false,
        };
      }

      // Add file to the appropriate category
      if (modality.toLowerCase() === 't1' && extension.toLowerCase() === 'hdr') {
        newSubjects[subjectKey].files.t1Hdr = file;
      } else if (modality.toLowerCase() === 't1' && extension.toLowerCase() === 'img') {
        newSubjects[subjectKey].files.t1Img = file;
      } else if (modality.toLowerCase() === 't2' && extension.toLowerCase() === 'hdr') {
        newSubjects[subjectKey].files.t2Hdr = file;
      } else if (modality.toLowerCase() === 't2' && extension.toLowerCase() === 'img') {
        newSubjects[subjectKey].files.t2Img = file;
      } else if (modality.toLowerCase() === 'label' && extension.toLowerCase() === 'hdr') {
        newSubjects[subjectKey].files.labelHdr = file;
      } else if (modality.toLowerCase() === 'label' && extension.toLowerCase() === 'img') {
        newSubjects[subjectKey].files.labelImg = file;
      }

      // Check if subject has complete T1 and T2 files
      newSubjects[subjectKey].isComplete =
          !!newSubjects[subjectKey].files.t1Hdr &&
          !!newSubjects[subjectKey].files.t1Img &&
          !!newSubjects[subjectKey].files.t2Hdr &&
          !!newSubjects[subjectKey].files.t2Img;
    }

    subjects.value = newSubjects;

    // Update progress
    progress.value = 100;

  } catch (err) {
    error.value = `Error processing files: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    isLoading.value = false;
    // Reset the file input
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
};

const loadSubjects = async (forTraining) => {
  isLoading.value = true;
  error.value = null;
  progress.value = 0;

  try {
    const subjectArray = Object.values(subjects.value).filter(
        (subject) => subject.isComplete && !subject.isLoaded
    );
    const totalSubjects = subjectArray.length;

    if (totalSubjects === 0) {
      error.value = 'No complete subjects to load';
      isLoading.value = false;
      return;
    }

    const loadedSubjects = [];

    for (let i = 0; i < totalSubjects; i++) {
      const subject = subjectArray[i];
      progress.value = ((i + 0.1) / totalSubjects) * 100;

      try {
        // Load T1 volume
        const t1HeaderBuffer = await subject.files.t1Hdr.arrayBuffer();
        const t1ImageBuffer = await subject.files.t1Img.arrayBuffer();
        const t1Volume = await parseAnalyzeVolume(t1HeaderBuffer, t1ImageBuffer);
        progress.value = ((i + 0.4) / totalSubjects) * 100;

        // Load T2 volume
        const t2HeaderBuffer = await subject.files.t2Hdr.arrayBuffer();
        const t2ImageBuffer = await subject.files.t2Img.arrayBuffer();
        const t2Volume = await parseAnalyzeVolume(t2HeaderBuffer, t2ImageBuffer);
        progress.value = ((i + 0.7) / totalSubjects) * 100;

        // Load label volume if available
        let labelVolume = undefined;
        if (subject.files.labelHdr && subject.files.labelImg) {
          const labelHeaderBuffer = await subject.files.labelHdr.arrayBuffer();
          const labelImageBuffer = await subject.files.labelImg.arrayBuffer();
          labelVolume = await parseAnalyzeVolume(labelHeaderBuffer, labelImageBuffer);
        }
        progress.value = ((i + 1) / totalSubjects) * 100;

        // Update subject with loaded volumes
        const loadedSubject = {
          ...subject,
          t1Volume: t1Volume,
          t2Volume: t2Volume,
          labelVolume: labelVolume,
          isLoaded: true,
        };

        loadedSubjects.push(loadedSubject);

        // Update subjects state
        subjects.value = {
          ...subjects.value,
          [subject.id]: loadedSubject,
        };
      } catch (err) {
        console.error(`Error loading subject ${subject.id}:`, err);
        error.value = `Error loading subject ${subject.id}: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    // Call the callback with loaded subjects
    if (loadedSubjects.length > 0) {
      emit('subjects-loaded', loadedSubjects, forTraining);
    }
  } catch (err) {
    error.value = `Error loading subjects: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    isLoading.value = false;
    progress.value = 100;
  }
};

const clearSubjects = () => {
  if (confirm('Are you sure you want to clear all subjects? This action cannot be undone.')) {
    subjects.value = {};
  }
};
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
