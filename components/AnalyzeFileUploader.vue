<template>
  <div class="flex flex-col items-center">
    <div class="w-full mb-4 bg-gray-800 rounded-md overflow-hidden">
      <div class="p-4">
        <div class="flex flex-col gap-4">
          <div>
            <p class="text-sm font-medium mb-2">Header File (.hdr)</p>
            <div class="flex items-center gap-2">
              <button
                  @click="triggerHeaderFileInput"
                  class="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                  :disabled="isLoading"
              >
                {{ headerFile ? headerFile.name : "Select .hdr file" }}
              </button>
              <input
                  type="file"
                  ref="headerInputRef"
                  @change="handleHeaderFileChange"
                  accept=".hdr"
                  class="hidden"
              />
            </div>
          </div>

          <div>
            <p class="text-sm font-medium mb-2">Image File (.img)</p>
            <div class="flex items-center gap-2">
              <button
                  @click="triggerImageFileInput"
                  class="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                  :disabled="isLoading"
              >
                {{ imageFile ? imageFile.name : "Select .img file" }}
              </button>
              <input
                  type="file"
                  ref="imageInputRef"
                  @change="handleImageFileChange"
                  accept=".img"
                  class="hidden"
              />
            </div>
          </div>
        </div>

        <div v-if="error" class="mt-4 text-sm text-red-500">{{ error }}</div>

        <button
            @click="loadVolume"
            :disabled="isLoading || !headerFile || !imageFile"
            class="w-full mt-4 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm disabled:bg-gray-700 disabled:text-gray-400"
        >
          {{ isLoading ? "Loading..." : currentVolume ? "Replace Volume" : "Load Volume" }}
        </button>
      </div>
    </div>

    <div v-if="currentVolume" class="text-sm text-gray-400">
      Loaded: {{ volumeType }} ({{ currentVolume.header.dimensions.join(" × ") }})
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { parseAnalyzeVolume } from '@/lib/analyze-parser';

const props = defineProps({
  volumeType: {
    type: String,
    required: true
  },
  currentVolume: {
    type: Object,
    default: null
  },
  optional: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['volume-loaded']);

const isLoading = ref(false);
const error = ref(null);
const headerInputRef = ref(null);
const imageInputRef = ref(null);
const headerFile = ref(null);
const imageFile = ref(null);

const handleHeaderFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.name.endsWith('.hdr')) {
    error.value = 'Please select a valid .hdr file';
    return;
  }

  headerFile.value = file;
  error.value = null;

  // Try to automatically find the matching .img file
  const imgFileName = file.name.replace('.hdr', '.img');
  if (imageFile.value?.name !== imgFileName) {
    // Clear the current image file if it doesn't match
    imageFile.value = null;
  }
};

const handleImageFileChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.name.endsWith('.img')) {
    error.value = 'Please select a valid .img file';
    return;
  }

  imageFile.value = file;
  error.value = null;

  // Try to automatically find the matching .hdr file
  const hdrFileName = file.name.replace('.img', '.hdr');
  if (headerFile.value?.name !== hdrFileName) {
    // Clear the current header file if it doesn't match
    headerFile.value = null;
  }
};

const loadVolume = async () => {
  if (!headerFile.value || !imageFile.value) {
    error.value = 'Please select both .hdr and .img files';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const headerBuffer = await headerFile.value.arrayBuffer();
    const imageBuffer = await imageFile.value.arrayBuffer();

    const volume = await parseAnalyzeVolume(headerBuffer, imageBuffer);
    emit('volume-loaded', volume);
  } catch (err) {
    console.error('Error loading volume:', err);
    error.value = `Error loading volume: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    isLoading.value = false;
  }
};

const triggerHeaderFileInput = () => {
  headerInputRef.value?.click();
};

const triggerImageFileInput = () => {
  imageInputRef.value?.click();
};
</script>
