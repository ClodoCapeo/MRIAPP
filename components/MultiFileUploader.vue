<template>
  <div class="bg-[#181818] p-4 rounded-md">
    <h3 class="text-xl font-bold mb-4">Multi-File Uploader</h3>
    <p class="text-sm text-gray-400 mb-4">
      Upload multiple files at once. The system will automatically recognize and group files by patient.
    </p>

    <div class="space-y-4">
      <div>
        <button 
          @click="handleFileSelect" 
          :disabled="isLoading" 
          class="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md disabled:bg-gray-700 disabled:text-gray-400"
        >
          Select Multiple Files
        </button>
        <input
          type="file"
          ref="fileInputRef"
          @change="handleFilesChange"
          multiple
          accept=".hdr,.img,.nii,.nii.gz,.dcm"
          class="hidden"
        />
      </div>

      <div v-if="isLoading" class="mt-4">
        <div class="w-full bg-gray-700 rounded-full h-2">
          <div 
            class="bg-cyan-500 h-2 rounded-full" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-400 mt-1">Processing: {{ Math.round(progress) }}%</p>
      </div>

      <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>

      <!-- Recognized Patients -->
      <div v-if="Object.keys(patients).length > 0" class="mt-4">
        <h4 class="font-medium mb-2">Recognized Patients ({{ Object.keys(patients).length }})</h4>
        <div class="bg-gray-800 p-3 rounded-md max-h-60 overflow-y-auto">
          <div v-for="(patient, patientId) in patients" :key="patientId" class="mb-4 border-b border-gray-700 pb-3">
            <div class="flex justify-between items-center mb-2">
              <h5 class="font-medium">{{ patient.displayName }}</h5>
              <div class="flex space-x-2">
                <button 
                  @click="loadPatient(patientId)" 
                  :disabled="!patient.isComplete"
                  class="px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded disabled:bg-gray-700 disabled:text-gray-400"
                >
                  Load
                </button>
                <button 
                  @click="addToDataset(patientId, true)" 
                  :disabled="!patient.isComplete"
                  class="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:bg-gray-800 disabled:text-gray-500"
                >
                  Add to Training
                </button>
                <button 
                  @click="addToDataset(patientId, false)" 
                  :disabled="!patient.isComplete"
                  class="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:bg-gray-800 disabled:text-gray-500"
                >
                  Add to Validation
                </button>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 text-sm">
              <div class="flex items-center">
                <span class="w-8 inline-block">T1:</span>
                <span :class="patient.files.t1 ? 'text-green-500' : 'text-red-500'">
                  {{ patient.files.t1 ? '✓' : '✗' }}
                </span>
                <span class="ml-2 text-xs text-gray-400 truncate">
                  {{ patient.files.t1?.name || 'Missing' }}
                </span>
              </div>
              <div class="flex items-center">
                <span class="w-8 inline-block">T2:</span>
                <span :class="patient.files.t2 ? 'text-green-500' : 'text-red-500'">
                  {{ patient.files.t2 ? '✓' : '✗' }}
                </span>
                <span class="ml-2 text-xs text-gray-400 truncate">
                  {{ patient.files.t2?.name || 'Missing' }}
                </span>
              </div>
              <div class="flex items-center">
                <span class="w-8 inline-block">GT:</span>
                <span :class="patient.files.label ? 'text-green-500' : 'text-gray-500'">
                  {{ patient.files.label ? '✓' : '○' }}
                </span>
                <span class="ml-2 text-xs text-gray-400 truncate">
                  {{ patient.files.label?.name || 'Optional' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Manual File Assignment -->
      <div v-if="unassignedFiles.length > 0" class="mt-4">
        <h4 class="font-medium mb-2">Unassigned Files ({{ unassignedFiles.length }})</h4>
        <div class="bg-gray-800 p-3 rounded-md max-h-60 overflow-y-auto">
          <div v-for="(file, index) in unassignedFiles" :key="index" class="flex justify-between items-center mb-2">
            <span class="text-sm truncate max-w-[200px]">{{ file.name }}</span>
            <div class="flex space-x-2">
              <select 
                v-model="fileAssignments[index].patientId" 
                class="bg-gray-700 text-white text-xs rounded px-2 py-1"
              >
                <option value="">Select Patient</option>
                <option v-for="(patient, id) in patients" :key="id" :value="id">
                  {{ patient.displayName }}
                </option>
                <option value="new">+ New Patient</option>
              </select>
              <select 
                v-model="fileAssignments[index].type" 
                class="bg-gray-700 text-white text-xs rounded px-2 py-1"
              >
                <option value="">Select Type</option>
                <option value="t1">T1</option>
                <option value="t2">T2</option>
                <option value="label">Ground Truth</option>
              </select>
              <button 
                @click="assignFile(index)" 
                :disabled="!fileAssignments[index].patientId || !fileAssignments[index].type"
                class="px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded disabled:bg-gray-700 disabled:text-gray-400"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
        <button 
          @click="assignAllFiles" 
          :disabled="unassignedFiles.length === 0"
          class="mt-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm"
        >
          Auto-Assign All Files
        </button>
      </div>

      <div class="flex justify-between mt-4">
        <button
          @click="clearAll"
          :disabled="isLoading || (Object.keys(patients).length === 0 && unassignedFiles.length === 0)"
          class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm"
        >
          Clear All
        </button>
        <button
          @click="addAllToDataset(true)"
          :disabled="isLoading || completePatients.length === 0"
          class="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm"
        >
          Add All to Training
        </button>
        <button
          @click="addAllToDataset(false)"
          :disabled="isLoading || completePatients.length === 0"
          class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm"
        >
          Add All to Validation
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { parseAnalyzeVolume } from '@/lib/analyze-parser';

const emit = defineEmits(['volume-loaded', 'add-to-training', 'add-to-validation']);

// State
const patients = ref({});
const unassignedFiles = ref([]);
const fileAssignments = ref([]);
const isLoading = ref(false);
const progress = ref(0);
const error = ref(null);
const fileInputRef = ref(null);
const patientCounter = ref(1);

// Computed properties
const completePatients = computed(() => 
  Object.values(patients.value).filter(patient => patient.isComplete)
);

// Watch for changes in unassignedFiles to update fileAssignments
watch(unassignedFiles, (newFiles) => {
  fileAssignments.value = newFiles.map(() => ({ patientId: '', type: '' }));
}, { deep: true });

// File selection handler
const handleFileSelect = () => {
  fileInputRef.value?.click();
};

// File change handler
const handleFilesChange = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  isLoading.value = true;
  error.value = null;
  progress.value = 0;

  try {
    const fileArray = Array.from(files);
    
    // First pass: try to automatically recognize and group files
    const newPatients = { ...patients.value };
    const newUnassignedFiles = [];
    
    for (const file of fileArray) {
      // Try to identify patient ID and file type from filename
      const patientInfo = identifyPatientAndType(file.name);
      
      if (patientInfo.patientId && patientInfo.type) {
        // We identified both patient and type
        if (!newPatients[patientInfo.patientId]) {
          newPatients[patientInfo.patientId] = {
            id: patientInfo.patientId,
            displayName: `Patient ${patientInfo.patientId}`,
            files: {},
            isComplete: false,
            isLoaded: false
          };
        }
        
        // Assign file to the patient
        newPatients[patientInfo.patientId].files[patientInfo.type] = file;
        
        // Update completeness status
        newPatients[patientInfo.patientId].isComplete = 
          !!newPatients[patientInfo.patientId].files.t1 && 
          !!newPatients[patientInfo.patientId].files.t2;
      } else {
        // Couldn't automatically identify, add to unassigned
        newUnassignedFiles.push(file);
      }
    }
    
    // Update state
    patients.value = newPatients;
    unassignedFiles.value = [...unassignedFiles.value, ...newUnassignedFiles];
    
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

// Function to identify patient ID and file type from filename
const identifyPatientAndType = (filename) => {
  // Common patterns for medical imaging files
  const patterns = [
    // Pattern: patient-123-t1.hdr, patient-123-t2.img, patient-123-label.nii
    {
      regex: /patient-(\d+)-([^.]+)\.([^.]+)$/i,
      patientIdIndex: 1,
      typeIndex: 2,
      typeMap: { t1: 't1', t2: 't2', label: 'label', gt: 'label', seg: 'label' }
    },
    // Pattern: p123_t1.hdr, p123_t2.img, p123_seg.nii
    {
      regex: /p(\d+)_([^.]+)\.([^.]+)$/i,
      patientIdIndex: 1,
      typeIndex: 2,
      typeMap: { t1: 't1', t2: 't2', seg: 'label', gt: 'label', label: 'label' }
    },
    // Pattern: 123_t1.hdr, 123_t2.img, 123_seg.nii
    {
      regex: /^(\d+)_([^.]+)\.([^.]+)$/i,
      patientIdIndex: 1,
      typeIndex: 2,
      typeMap: { t1: 't1', t2: 't2', seg: 'label', gt: 'label', label: 'label' }
    },
    // Pattern: subject-123-t1.hdr, subject-123-t2.img, subject-123-label.nii
    {
      regex: /subject-(\d+)-([^.]+)\.([^.]+)$/i,
      patientIdIndex: 1,
      typeIndex: 2,
      typeMap: { t1: 't1', t2: 't2', label: 'label', gt: 'label', seg: 'label' }
    }
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern.regex);
    if (match) {
      const patientId = match[pattern.patientIdIndex];
      const typeRaw = match[pattern.typeIndex].toLowerCase();
      const type = pattern.typeMap[typeRaw] || '';
      
      if (patientId && type) {
        return { patientId, type };
      }
    }
  }
  
  return { patientId: '', type: '' };
};

// Assign a file to a patient
const assignFile = (index) => {
  const assignment = fileAssignments.value[index];
  const file = unassignedFiles.value[index];
  
  if (!assignment.patientId || !assignment.type) return;
  
  // If creating a new patient
  if (assignment.patientId === 'new') {
    const newPatientId = `p${patientCounter.value++}`;
    patients.value[newPatientId] = {
      id: newPatientId,
      displayName: `Patient ${newPatientId}`,
      files: {},
      isComplete: false,
      isLoaded: false
    };
    assignment.patientId = newPatientId;
  }
  
  // Assign file to patient
  patients.value[assignment.patientId].files[assignment.type] = file;
  
  // Update completeness status
  patients.value[assignment.patientId].isComplete = 
    !!patients.value[assignment.patientId].files.t1 && 
    !!patients.value[assignment.patientId].files.t2;
  
  // Remove from unassigned
  unassignedFiles.value.splice(index, 1);
  fileAssignments.value.splice(index, 1);
};

// Auto-assign all unassigned files
const assignAllFiles = () => {
  // This is a simplified version - in a real app, you might use more sophisticated
  // algorithms to group files by patient based on naming patterns or metadata
  
  // Group files by potential patient IDs
  const fileGroups = {};
  
  for (const file of unassignedFiles.value) {
    // Try to extract patient ID
    const patientInfo = identifyPatientAndType(file.name);
    
    if (patientInfo.patientId) {
      if (!fileGroups[patientInfo.patientId]) {
        fileGroups[patientInfo.patientId] = [];
      }
      fileGroups[patientInfo.patientId].push({
        file,
        type: patientInfo.type || guessFileType(file.name)
      });
    } else {
      // If we can't identify patient, create a new group
      const newPatientId = `p${patientCounter.value++}`;
      fileGroups[newPatientId] = [{
        file,
        type: guessFileType(file.name)
      }];
    }
  }
  
  // Create/update patients from groups
  for (const [patientId, files] of Object.entries(fileGroups)) {
    if (!patients.value[patientId]) {
      patients.value[patientId] = {
        id: patientId,
        displayName: `Patient ${patientId}`,
        files: {},
        isComplete: false,
        isLoaded: false
      };
    }
    
    // Assign files to patient
    for (const { file, type } of files) {
      if (type && !patients.value[patientId].files[type]) {
        patients.value[patientId].files[type] = file;
      }
    }
    
    // Update completeness
    patients.value[patientId].isComplete = 
      !!patients.value[patientId].files.t1 && 
      !!patients.value[patientId].files.t2;
  }
  
  // Clear unassigned files
  unassignedFiles.value = [];
  fileAssignments.value = [];
};

// Guess file type based on filename
const guessFileType = (filename) => {
  const lower = filename.toLowerCase();
  if (lower.includes('t1')) return 't1';
  if (lower.includes('t2')) return 't2';
  if (lower.includes('label') || lower.includes('seg') || lower.includes('gt')) return 'label';
  return '';
};

// Load a patient's data
const loadPatient = async (patientId) => {
  const patient = patients.value[patientId];
  if (!patient || !patient.isComplete) return;
  
  isLoading.value = true;
  error.value = null;
  progress.value = 0;
  
  try {
    // Load T1 volume
    progress.value = 20;
    const t1Volume = await loadVolumeFromFile(patient.files.t1);
    
    // Load T2 volume
    progress.value = 50;
    const t2Volume = await loadVolumeFromFile(patient.files.t2);
    
    // Load label volume if available
    let labelVolume = null;
    if (patient.files.label) {
      progress.value = 80;
      labelVolume = await loadVolumeFromFile(patient.files.label);
    }
    
    // Mark as loaded
    patients.value[patientId].isLoaded = true;
    
    // Emit volumes
    emit('volume-loaded', {
      t1: t1Volume,
      t2: t2Volume,
      groundTruth: labelVolume
    });
    
    progress.value = 100;
  } catch (err) {
    error.value = `Error loading patient data: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    isLoading.value = false;
  }
};

// Load volume from file
const loadVolumeFromFile = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  
  if (extension === 'hdr') {
    // For Analyze format, we need both .hdr and .img files
    const imgFileName = file.name.replace(/\.hdr$/i, '.img');
    const imgFile = findFileByName(imgFileName);
    
    if (!imgFile) {
      throw new Error(`Missing .img file for ${file.name}`);
    }
    
    const headerBuffer = await file.arrayBuffer();
    const imageBuffer = await imgFile.arrayBuffer();
    return parseAnalyzeVolume(headerBuffer, imageBuffer);
  } else if (extension === 'img') {
    // If .img file was selected, look for corresponding .hdr
    const hdrFileName = file.name.replace(/\.img$/i, '.hdr');
    const hdrFile = findFileByName(hdrFileName);
    
    if (!hdrFile) {
      throw new Error(`Missing .hdr file for ${file.name}`);
    }
    
    const headerBuffer = await hdrFile.arrayBuffer();
    const imageBuffer = await file.arrayBuffer();
    return parseAnalyzeVolume(headerBuffer, imageBuffer);
  } else if (extension === 'nii' || extension === 'gz') {
    // For NIfTI format
    // Note: This is a placeholder - you would need to implement NIfTI parsing
    throw new Error('NIfTI format support not implemented yet');
  } else if (extension === 'dcm') {
    // For DICOM format
    // Note: This is a placeholder - you would need to implement DICOM parsing
    throw new Error('DICOM format support not implemented yet');
  } else {
    throw new Error(`Unsupported file format: ${extension}`);
  }
};

// Helper to find a file by name in unassigned files
const findFileByName = (name) => {
  // First check unassigned files
  for (const file of unassignedFiles.value) {
    if (file.name === name) return file;
  }
  
  // Then check all patient files
  for (const patient of Object.values(patients.value)) {
    for (const file of Object.values(patient.files)) {
      if (file && file.name === name) return file;
    }
  }
  
  return null;
};

// Add a patient to dataset
const addToDataset = async (patientId, isTraining) => {
  const patient = patients.value[patientId];
  if (!patient || !patient.isComplete) return;
  
  isLoading.value = true;
  error.value = null;
  progress.value = 0;
  
  try {
    // Load volumes if not already loaded
    if (!patient.isLoaded) {
      // Load T1 volume
      progress.value = 20;
      const t1Volume = await loadVolumeFromFile(patient.files.t1);
      
      // Load T2 volume
      progress.value = 50;
      const t2Volume = await loadVolumeFromFile(patient.files.t2);
      
      // Load label volume if available
      let labelVolume = null;
      if (patient.files.label) {
        progress.value = 80;
        labelVolume = await loadVolumeFromFile(patient.files.label);
      }
      
      // Mark as loaded
      patients.value[patientId].isLoaded = true;
      
      // Emit to add to dataset
      if (isTraining) {
        emit('add-to-training', {
          t1: t1Volume,
          t2: t2Volume,
          groundTruth: labelVolume
        });
      } else {
        emit('add-to-validation', {
          t1: t1Volume,
          t2: t2Volume,
          groundTruth: labelVolume
        });
      }
    } else {
      // Already loaded, just emit the event
      // Note: In a real app, you would store the loaded volumes in the patient object
      // For simplicity, we'll reload them here
      const t1Volume = await loadVolumeFromFile(patient.files.t1);
      const t2Volume = await loadVolumeFromFile(patient.files.t2);
      let labelVolume = null;
      if (patient.files.label) {
        labelVolume = await loadVolumeFromFile(patient.files.label);
      }
      
      if (isTraining) {
        emit('add-to-training', {
          t1: t1Volume,
          t2: t2Volume,
          groundTruth: labelVolume
        });
      } else {
        emit('add-to-validation', {
          t1: t1Volume,
          t2: t2Volume,
          groundTruth: labelVolume
        });
      }
    }
    
    progress.value = 100;
  } catch (err) {
    error.value = `Error adding to dataset: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    isLoading.value = false;
  }
};

// Add all complete patients to dataset
const addAllToDataset = async (isTraining) => {
  const patientIds = completePatients.value.map(p => p.id);
  
  isLoading.value = true;
  error.value = null;
  
  try {
    for (let i = 0; i < patientIds.length; i++) {
      progress.value = (i / patientIds.length) * 100;
      await addToDataset(patientIds[i], isTraining);
    }
    progress.value = 100;
  } catch (err) {
    error.value = `Error adding patients to dataset: ${err instanceof Error ? err.message : String(err)}`;
  } finally {
    isLoading.value = false;
  }
};

// Clear all data
const clearAll = () => {
  patients.value = {};
  unassignedFiles.value = [];
  fileAssignments.value = [];
  patientCounter.value = 1;
};
</script>
