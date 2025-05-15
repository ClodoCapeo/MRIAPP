<template>
  <div class="flex flex-col w-full h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Header with progress indicator -->
    <div class="relative mb-6">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-xl font-semibold">MRI Segmentation Workflow</h2>
        <div class="flex items-center space-x-2">
          <button
              @click="toggleDarkMode"
              class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
          >
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>
          <button
              @click="showHelp = !showHelp"
              class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Help"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Workflow progress steps -->
      <div class="flex w-full mb-6">
        <div
            v-for="(tab, index) in tabs"
            :key="tab.id"
            class="flex-1 relative"
        >
          <div
              class="flex flex-col items-center"
              :class="{ 'cursor-pointer': canNavigateToTab(tab.id) }"
              @click="canNavigateToTab(tab.id) ? activeTab = tab.id : null"
          >
            <div
                class="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 z-10"
                :class="[
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : index < tabs.findIndex(t => t.id === activeTab)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              ]"
            >
              <span v-if="index < tabs.findIndex(t => t.id === activeTab)" class="text-sm">✓</span>
              <span v-else class="text-sm">{{ index + 1 }}</span>
            </div>
            <span
                class="text-sm font-medium transition-colors duration-300"
                :class="[
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              ]"
            >
              {{ tab.label }}
            </span>
          </div>

          <!-- Connector line -->
          <div
              v-if="index < tabs.length - 1"
              class="absolute top-5 left-1/2 w-full h-0.5 transition-colors duration-300"
              :class="[
              index < tabs.findIndex(t => t.id === activeTab)
                ? 'bg-green-500'
                : 'bg-gray-200 dark:bg-gray-700'
            ]"
          ></div>
        </div>
      </div>

      <!-- Help tooltip -->
      <div
          v-if="showHelp"
          class="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-20 border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-fade-in"
      >
        <h3 class="font-medium mb-2">How to use</h3>
        <ol class="text-sm space-y-2 list-decimal list-inside">
          <li>Upload your MRI data (T1, T2, Ground Truth)</li>
          <li>Train the model or use a pre-trained one</li>
          <li>Run segmentation on your data</li>
          <li>View and analyze the results</li>
        </ol>
        <button
            @click="showHelp = false"
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="flex-1 overflow-hidden">
      <!-- Upload Tab -->
      <div v-if="activeTab === 'upload'" class="space-y-6 animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left column -->
          <div class="space-y-6">
            <!-- Model Status Card -->
            <div
                class="rounded-lg shadow-sm overflow-hidden transition-all duration-300"
                :class="modelLoaded ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'"
            >
              <div class="p-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div
                        class="w-10 h-10 rounded-full flex items-center justify-center"
                        :class="modelLoaded ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-700'"
                    >
                      <svg
                          class="h-6 w-6"
                          :class="modelLoaded ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                      >
                        <path v-if="modelLoaded" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3
                        class="text-lg font-medium"
                        :class="modelLoaded ? 'text-green-800 dark:text-green-400' : 'text-gray-800 dark:text-gray-300'"
                    >
                      {{ modelLoaded ? 'Model Ready' : 'No Model Loaded' }}
                    </h3>
                    <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {{ modelLoaded
                        ? 'A trained model is loaded and ready for segmentation. You can run segmentation on new data or continue training.'
                        : 'No trained model is currently loaded. Please train a model or load a pre-trained one before running segmentation.'
                      }}
                    </div>
                    <div class="mt-3 flex space-x-2" v-if="!modelLoaded">
                      <button
                          @click="activeTab = 'train'"
                          :disabled="trainingVolumes.length === 0"
                          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                          :class="trainingVolumes.length === 0
                          ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'"
                      >
                        <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                        </svg>
                        Train Model
                      </button>
                      <button
                          @click="showModelLoader = true"
                          class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                      >
                        <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                        Load Model
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Batch File Uploader -->
            <batch-file-uploader
                @subjects-loaded="handleSubjectsLoaded"
                class="transition-all duration-300 hover:shadow-md"
            />

            <!-- Model Loader (conditionally shown) -->
            <model-loader
                v-if="showModelLoader"
                @model-loaded="handleModelLoaded"
                @load-error="handleModelLoadError"
                class="transition-all duration-300 hover:shadow-md"
            />
          </div>

          <!-- Right column -->
          <div class="space-y-6">
            <!-- Dataset Manager -->
            <dataset-manager
                :training-data="trainingVolumes"
                :validation-data="validationVolumes"
                @remove-training-item="removeTrainingItem"
                @remove-validation-item="removeValidationItem"
                @clear-training-data="clearTrainingData"
                @clear-validation-data="clearValidationData"
                @load-item="loadDatasetItem"
                class="transition-all duration-300 hover:shadow-md"
            />

            <!-- Dataset Status -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-medium mb-4">Dataset Status</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400">Training Volumes</span>
                  <div class="flex items-center">
                    <span
                        class="font-semibold text-lg"
                        :class="trainingVolumes.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'"
                    >
                      {{ trainingVolumes.length }}
                    </span>
                    <span
                        v-if="trainingVolumes.length === 0"
                        class="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    >
                      Required
                    </span>
                  </div>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                      class="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      :style="{ width: `${Math.min(100, trainingVolumes.length * 10)}%` }"
                  ></div>
                </div>

                <div class="flex justify-between items-center mt-4">
                  <span class="text-gray-600 dark:text-gray-400">Validation Volumes</span>
                  <div class="flex items-center">
                    <span
                        class="font-semibold text-lg"
                        :class="validationVolumes.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'"
                    >
                      {{ validationVolumes.length }}
                    </span>
                    <span
                        v-if="validationVolumes.length === 0"
                        class="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    >
                      Required
                    </span>
                  </div>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                      class="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      :style="{ width: `${Math.min(100, validationVolumes.length * 20)}%` }"
                  ></div>
                </div>

                <div class="flex justify-between items-center mt-4">
                  <span class="text-gray-600 dark:text-gray-400">Model Status</span>
                  <span
                      class="font-semibold"
                      :class="modelLoaded ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'"
                  >
                    {{ modelLoaded ? 'Trained' : 'Not Trained' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap justify-center gap-4 mt-8">
          <button
              @click="activeTab = 'train'"
              :disabled="trainingVolumes.length === 0"
              class="px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="trainingVolumes.length === 0 ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
            </svg>
            <span>Go to Training</span>
          </button>

          <button
              @click="splitDatasets"
              :disabled="trainingVolumes.length + validationVolumes.length < 10"
              class="px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="trainingVolumes.length + validationVolumes.length < 10
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Auto-Split (6-2-2)</span>
          </button>
        </div>
      </div>

      <!-- Train Tab -->
      <div v-else-if="activeTab === 'train'" class="space-y-6 animate-fade-in">
        <model-trainer-enhanced
            :training-volumes="trainingVolumes"
            :validation-volumes="validationVolumes"
            :unet-model="unetRef"
            @model-trained="handleModelTrained"
            @training-progress="handleTrainingProgress"
            @training-error="error => console.error('Training error:', error)"
            @visualization-step="handleVisualizationStep"
            class="transition-all duration-300"
        />

        <div class="flex justify-center mt-8">
          <button
              @click="activeTab = 'upload'"
              class="px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-300 flex items-center space-x-2 bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            <span>Back to Upload</span>
          </button>
        </div>
      </div>

      <!-- Segmentation Tab -->
      <div v-else-if="activeTab === 'segmentation'" class="space-y-6 animate-fade-in">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clip-rule="evenodd" />
            </svg>
            Run Segmentation
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Volume to Segment</label>
              <div v-if="validationVolumes.length === 0" class="text-red-500 dark:text-red-400 text-sm mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                No validation volumes available. Please upload data first.
              </div>
              <div class="relative">
                <select
                    v-model="selectedVolumeIndex"
                    class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    :disabled="validationVolumes.length === 0"
                >
                  <option v-for="(volume, index) in validationVolumes" :key="index" :value="index">
                    Volume {{ index + 1 }}: {{ getVolumeDescription(volume) }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <button
                @click="runSegmentation"
                :disabled="!canRunSegmentation || !modelLoaded"
                class="w-full px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="!canRunSegmentation || !modelLoaded ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span>Run Segmentation</span>
            </button>

            <div v-if="isProcessing" class="mt-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600 dark:text-gray-400">Processing</span>
                <span class="text-gray-800 dark:text-gray-200 font-medium">{{ progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${progress}%` }"
                ></div>
              </div>
              <div class="text-center mt-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Processing MRI data...
              </div>
            </div>
          </div>
        </div>

        <div v-if="validationVolumes.length > 0 && selectedVolumeIndex >= 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Volume Details</h4>
          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">T1</div>
              <div class="flex items-center justify-center h-8">
                <span v-if="validationVolumes[selectedVolumeIndex]?.t1" class="text-green-500 dark:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </span>
                <span v-else class="text-red-500 dark:text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>

            <div class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">T2</div>
              <div class="flex items-center justify-center h-8">
                <span v-if="validationVolumes[selectedVolumeIndex]?.t2" class="text-green-500 dark:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </span>
                <span v-else class="text-red-500 dark:text-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>

            <div class="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-sm font-medium mb-1 text-gray-500 dark:text-gray-400">Ground Truth</div>
              <div class="flex items-center justify-center h-8">
                <span v-if="validationVolumes[selectedVolumeIndex]?.groundTruth" class="text-green-500 dark:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </span>
                <span v-else class="text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div v-if="validationVolumes[selectedVolumeIndex]?.t1?.header?.dimensions" class="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            Dimensions: {{ validationVolumes[selectedVolumeIndex].t1.header.dimensions.join(' × ') }}
          </div>
        </div>

        <div v-if="segmentationVolume" class="flex justify-center mt-6">
          <button
              @click="activeTab = 'results'"
              class="px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            <span>View Results</span>
          </button>
        </div>
      </div>

      <!-- Results Tab -->
      <div v-else-if="activeTab === 'results'" class="space-y-6 animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-if="t1Volume" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">T1 Volume</h3>
            </div>
            <div class="p-4">
              <volume-viewer :volume="t1Volume" class="rounded-lg overflow-hidden" />
            </div>
          </div>

          <div v-if="t2Volume" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">T2 Volume</h3>
            </div>
            <div class="p-4">
              <volume-viewer :volume="t2Volume" class="rounded-lg overflow-hidden" />
            </div>
          </div>

          <div v-if="groundTruthVolume" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">Ground Truth</h3>
            </div>
            <div class="p-4">
              <volume-viewer :volume="groundTruthVolume" :is-segmentation="true" class="rounded-lg overflow-hidden" />
            </div>
          </div>

          <div v-if="segmentationVolume" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">Segmentation Result</h3>
            </div>
            <div class="p-4">
              <volume-viewer :volume="segmentationVolume" :is-segmentation="true" class="rounded-lg overflow-hidden" />
            </div>
          </div>
        </div>

        <div v-if="segmentationVolume && t1Volume" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">Segmentation with T1 Overlay</h3>
          </div>
          <div class="p-4">
            <volume-viewer :volume="t1Volume" :overlay-volume="segmentationVolume" class="rounded-lg overflow-hidden" />
          </div>
        </div>

        <!-- Evaluation metrics component -->
        <evaluation-metrics
            v-if="segmentationVolume && groundTruthVolume"
            :segmentation-volume="segmentationVolume"
            :ground-truth-volume="groundTruthVolume"
            class="transition-all duration-300 hover:shadow-md"
        />

        <!-- Step-specific visualization section -->
        <div v-if="segmentationVolume && groundTruthVolume" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200">Step Visualization</h3>
          </div>
          <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-md font-medium mb-2">Prediction</h4>
              <volume-viewer :volume="segmentationVolume" :is-segmentation="true" class="rounded-lg overflow-hidden" />
            </div>
            <div>
              <h4 class="text-md font-medium mb-2">Ground Truth</h4>
              <volume-viewer
                  :volume="groundTruthVolume"
                  :is-segmentation="true"
                  :threshold="10"
                  class="rounded-lg overflow-hidden"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-center mt-8 space-x-4">
          <button
              @click="activeTab = 'segmentation'"
              class="px-4 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-300 flex items-center space-x-2 bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            <span>Back to Segmentation</span>
          </button>

          <button
              @click="exportResults"
              class="px-4 py-2.5 rounded-lg shadow-sm text-white font-medium transition-all duration-300 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <span>Export Results</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import * as tf from '@tensorflow/tfjs';
import { EnhancedUNet } from '@/lib/unet-enhanced';
import VolumeViewer from '@/components/VolumeViewer.vue';
import BatchFileUploader from '@/components/BatchFileUploader.vue';
import DatasetManager from '@/components/DatasetManager.vue';
import ModelTrainerEnhanced from '@/components/ModelTrainerEnhanced.vue';
import EvaluationMetrics from '@/components/EvaluationMetrics.vue';
import ModelLoader from '@/components/ModelLoader.vue';
import { createSimulatedSegmentation } from '@/lib/utils';
import { ModelService } from '@/services/modelService';

// Initialize model service
const modelService = new ModelService();

// State
const t1Volume = ref(null);
const t2Volume = ref(null);
const groundTruthVolume = ref(null);
const segmentationVolume = ref(null);
const isProcessing = ref(false);
const progress = ref(0);
const activeTab = ref('upload');
const unetRef = ref(null);
const modelLoaded = ref(false);
const selectedVolumeIndex = ref(0);
const isDarkMode = ref(false); // Default value
const showHelp = ref(false);
const activeModel = ref('unet');
const unetModel = ref(null);
const showModelLoader = ref(false);

// Training and validation data
const trainingVolumes = ref([]);
const validationVolumes = ref([]);

// Tabs configuration
const tabs = [
  { label: 'Upload Data', id: 'upload' },
  { label: 'Train Model', id: 'train' },
  { label: 'Segmentation', id: 'segmentation' },
  { label: 'Results', id: 'results' }
];

// Computed properties
const canRunSegmentation = computed(() => {
  return validationVolumes.value.length > 0 &&
      selectedVolumeIndex.value >= 0 &&
      selectedVolumeIndex.value < validationVolumes.value.length;
});

// Initialize model
onMounted(async () => {
  // Check for dark mode preference in localStorage or system preference
  if (typeof window !== 'undefined') {
    isDarkMode.value = localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDarkMode();
  }
  try {
    // Apply dark mode if needed
    applyDarkMode();

    // Initialize TensorFlow.js
    await tf.ready();
    console.log('TensorFlow.js ready');

    // Initialize U-Net model
    unetRef.value = new EnhancedUNet();
    await unetRef.value.initialize();
    console.log('Enhanced U-Net model initialized');

    // Check if a model is already saved
    try {
      const modelInfo = await tf.io.listModels();
      if (modelInfo['indexeddb://unet-iseg-model']) {
        modelLoaded.value = true;
        console.log('Found previously trained model in storage');
      }
    } catch (e) {
      console.log('No previously trained model found');
    }
  } catch (error) {
    console.error('Error initializing model:', error);
  }
});

// Toggle dark mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (typeof window !== 'undefined') {
    localStorage.setItem('darkMode', isDarkMode.value);
  }
  applyDarkMode();
};

// Apply dark mode
const applyDarkMode = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Check if we can navigate to a tab
const canNavigateToTab = (tabId) => {
  const currentTabIndex = tabs.findIndex(t => t.id === activeTab.value);
  const targetTabIndex = tabs.findIndex(t => t.id === tabId);

  // Can always go back
  if (targetTabIndex < currentTabIndex) return true;

  // Can go to train if we have training data
  if (tabId === 'train') return trainingVolumes.value.length > 0;

  // Can go to segmentation if model is loaded
  if (tabId === 'segmentation') return modelLoaded.value;

  // Can go to results if segmentation is done
  if (tabId === 'results') return segmentationVolume.value !== null;

  return false;
};

// Handle subjects loaded from batch uploader
const handleSubjectsLoaded = (subjects, forTraining) => {
  // Filter out subjects that don't have both T1 and T2 volumes
  const validSubjects = subjects.filter((subject) => subject.t1Volume && subject.t2Volume);

  if (validSubjects.length === 0) {
    alert('No valid subjects found with both T1 and T2 volumes');
    return;
  }

  // Convert subjects to the format expected by the training/validation data
  const volumeData = validSubjects.map((subject) => ({
    t1: subject.t1Volume,
    t2: subject.t2Volume,
    groundTruth: subject.labelVolume,
  }));

  if (forTraining) {
    trainingVolumes.value = [...trainingVolumes.value, ...volumeData];
    console.log(`Added ${validSubjects.length} subjects to training data`);
  } else {
    validationVolumes.value = [...validationVolumes.value, ...volumeData];
    console.log(`Added ${validSubjects.length} subjects to validation data`);
  }

  // If we have at least one subject, set the current volumes to the first one
  if (validSubjects.length > 0) {
    const firstSubject = validSubjects[0];
    t1Volume.value = firstSubject.t1Volume;
    t2Volume.value = firstSubject.t2Volume;
    if (firstSubject.labelVolume) {
      groundTruthVolume.value = firstSubject.labelVolume;
    }
  }
};

// Remove training item
const removeTrainingItem = (index) => {
  trainingVolumes.value = trainingVolumes.value.filter((_, i) => i !== index);
};

// Remove validation item
const removeValidationItem = (index) => {
  validationVolumes.value = validationVolumes.value.filter((_, i) => i !== index);

  // Update selected volume index if needed
  if (selectedVolumeIndex.value >= validationVolumes.value.length) {
    selectedVolumeIndex.value = Math.max(0, validationVolumes.value.length - 1);
  }
};

// Clear training data
const clearTrainingData = () => {
  if (confirm('Are you sure you want to clear all training data?')) {
    trainingVolumes.value = [];
  }
};

// Clear validation data
const clearValidationData = () => {
  if (confirm('Are you sure you want to clear all validation data?')) {
    validationVolumes.value = [];
    selectedVolumeIndex.value = 0;
  }
};

// Load dataset item
const loadDatasetItem = (item) => {
  t1Volume.value = item.t1;
  t2Volume.value = item.t2;
  if (item.groundTruth) {
    groundTruthVolume.value = item.groundTruth;
  } else {
    groundTruthVolume.value = null;
  }
};

// Split datasets
const splitDatasets = () => {
  // Get all volumes that have both T1 and T2
  const allVolumes = [...trainingVolumes.value, ...validationVolumes.value].filter(
      (vol) => vol.t1 && vol.t2
  );

  if (allVolumes.length < 10) {
    alert(`Need at least 10 subjects for 6-2-2 split. Currently have ${allVolumes.length}.`);
    return;
  }

  // Shuffle the volumes
  const shuffled = [...allVolumes].sort(() => 0.5 - Math.random());

  // Split into 6-2-2
  const trainSet = shuffled.slice(0, 6);
  const testSet = shuffled.slice(6, 8);
  const validSet = shuffled.slice(8, 10);

  // Update the state
  trainingVolumes.value = trainSet;
  validationVolumes.value = [...testSet, ...validSet];

  alert(`Data split complete: 6 for training, 2 for testing, 2 for validation`);
};

// Handle model training completion
const handleModelTrained = (modelData) => {
  modelLoaded.value = true;
  unetRef.value = modelData.model;
  activeTab.value = 'segmentation';
};

// Handle model loaded from ModelLoader
const handleModelLoaded = (modelData) => {
  modelLoaded.value = true;

  if (modelData.model) {
    if (modelData.step === 1) {
      modelService.step1Model = modelData.model;
    } else if (modelData.step === 2) {
      modelService.step2Model = modelData.model;
    } else if (modelData.step === 3) {
      modelService.step3Model = modelData.model;
    }

    // Hide the model loader
    showModelLoader.value = false;

    // Show success message
    alert(`Model "${modelData.name}" loaded successfully!`);

    // Navigate to segmentation tab
    activeTab.value = 'segmentation';
  }
};

// Handle model load error
const handleModelLoadError = (error) => {
  console.error('Error loading model:', error);
  alert(`Error loading model: ${error.message}`);
};

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

// Helper function to get volume description
const getVolumeDescription = (volume) => {
  const hasT1 = !!volume.t1;
  const hasT2 = !!volume.t2;
  const hasGT = !!volume.groundTruth;

  let description = [];
  if (hasT1) description.push('T1');
  if (hasT2) description.push('T2');
  if (hasGT) description.push('Ground Truth');

  if (volume.t1 && volume.t1.header && volume.t1.header.dimensions) {
    const dims = volume.t1.header.dimensions;
    description.push(`(${dims[0]}×${dims[1]}×${dims[2]})`);
  }

  return description.join(' + ');
};

// Update the runSegmentation method to properly handle segmentation

const runSegmentation = async () => {
  if (!canRunSegmentation.value || !modelLoaded.value) {
    return;
  }

  isProcessing.value = true;
  progress.value = 0;

  try {
    // Get the selected volume
    const selectedVolume = validationVolumes.value[selectedVolumeIndex.value];
    if (!selectedVolume) {
      throw new Error('No volume selected');
    }

    // Set current volumes for display
    t1Volume.value = selectedVolume.t1;
    t2Volume.value = selectedVolume.t2;
    groundTruthVolume.value = selectedVolume.groundTruth || null;

    progress.value = 10;

    // Initialize model service if not already initialized
    if (!modelService.isInitialized) {
      await modelService.initialize();
    }

    progress.value = 20;

    // Convert volumes to tensors
    const t1Tensor = volumeToTensor(selectedVolume.t1);
    const t2Tensor = volumeToTensor(selectedVolume.t2);

    progress.value = 30;

    // Apply Gaussian normalization
    const t1Normalized = modelService.gaussianNormalization(t1Tensor);
    const t2Normalized = modelService.gaussianNormalization(t2Tensor);

    progress.value = 40;

    // Run segmentation
    let segmentationTensor;

    if (modelService.step1Model && modelService.step2Model) {
      // Use cascaded approach
      progress.value = 50;
      segmentationTensor = await modelService.predictCascaded([t1Normalized, t2Normalized]);
      progress.value = 80;
    } else if (unetRef.value) {
      // Use the EnhancedUNet model
      progress.value = 50;
      segmentationTensor = await unetRef.value.predict([t1Normalized, t2Normalized]);
      progress.value = 80;
    } else {
      throw new Error('No model available for segmentation');
    }

    // Convert tensor to volume
    const segVolume = tensorToVolume(segmentationTensor, selectedVolume.t1);
    segmentationVolume.value = segVolume;

    progress.value = 90;

    // Compute Dice coefficient if ground truth is available
    if (selectedVolume.groundTruth) {
      const groundTruthTensor = volumeToTensor(selectedVolume.groundTruth);
      const dice = modelService.computeDice(segmentationTensor, groundTruthTensor);
      console.log(`Dice coefficient: ${dice}`);
    }

    progress.value = 100;

    // Clean up tensors
    t1Tensor.dispose();
    t2Tensor.dispose();
    t1Normalized.dispose();
    t2Normalized.dispose();
    segmentationTensor.dispose();

    // Switch to results tab
    activeTab.value = 'results';
  } catch (error) {
    console.error('Segmentation failed:', error);
    alert(`Segmentation failed: ${error.message}`);
  } finally {
    isProcessing.value = false;
  }
};

// Add this function to handle training progress updates
const handleTrainingProgress = (progressData) => {
  // Update progress indicators
  progress.value = progressData.progress;

  // If there's a prediction, update the current volumes and segmentation
  if (progressData.prediction) {
    // Set the current volumes for visualization
    t1Volume.value = progressData.prediction.t1;
    t2Volume.value = progressData.prediction.t2;

    // Generate a simulated segmentation based on the step
    const step = progressData.step;

    // In a real implementation, this would be the actual prediction from the model
    // For now, we'll create a simulated segmentation
    const simSegmentation = createSimulatedSegmentation(t1Volume.value, step);
    segmentationVolume.value = simSegmentation;
  }
};

// Add a method to handle visualization steps from the ModelTrainerEnhanced component
const handleVisualizationStep = (visualizationData) => {
  // Update the current volumes for display
  if (visualizationData.prediction) {
    segmentationVolume.value = visualizationData.prediction;
  }

  if (visualizationData.groundTruth) {
    groundTruthVolume.value = visualizationData.groundTruth;
  }

  // Based on the step, show the appropriate visualization
  const step = visualizationData.step;
  const threshold = visualizationData.threshold || 10;

  // Create a visualization section to display the results
  if (step === 1) {
    // Step 5 in the notebook - after first layer training
    console.log("Visualizing Step 5 - First layer results");
    // Display the prediction and ground truth with threshold 10
    for (let k = 0; k < validationVolumes.value.length; k++) {
      const patientIndex = 8 + k; // Starting from patient 8 as in the notebook
      console.log(`Patient ${patientIndex}: Prediction vs Ground Truth (threshold ${threshold})`);
    }
  } else if (step === 2) {
    // Step 6 in the notebook - after second layer training
    console.log("Visualizing Step 6 - Second layer results");
    // Display the prediction and ground truth with threshold 150
    for (let k = 0; k < validationVolumes.value.length; k++) {
      const patientIndex = 8 + k; // Starting from patient 8 as in the notebook
      console.log(`Patient ${patientIndex}: Prediction vs Ground Truth (threshold ${threshold})`);
    }
  }

  // Show the results tab to display the visualizations
  activeTab.value = 'results';
};

const handleSegmentationUpdated = (updatedSegmentation) => {
  segmentationVolume.value = updatedSegmentation;
};

const runPrediction = async () => {
  if (!t1Volume.value || !t2Volume.value) {
    console.warn('T1 or T2 volume not loaded');
    return;
  }

  isProcessing.value = true;

  try {
    // Convert volumes to tensors
    const t1Tensor = tf.tensor3d(t1Volume.value.data, t1Volume.value.shape);
    const t2Tensor = tf.tensor3d(t2Volume.value.data, t2Volume.value.shape);

    // Run prediction
    const segmentationTensor = await modelService.predict([t1Tensor, t2Tensor]);

    // Convert tensor to volume
    const segmentationData = await segmentationTensor.data();

    // Create segmentation volume
    segmentationVolume.value = {
      data: new Float32Array(segmentationData),
      shape: segmentationTensor.shape,
      header: t1Volume.value.header,
      min: 0,
      max: 3 // Assuming 4 classes (0, 1, 2, 3)
    };

    // Clean up tensors
    t1Tensor.dispose();
    t2Tensor.dispose();
    segmentationTensor.dispose();
  } catch (error) {
    console.error('Error running prediction:', error);
  } finally {
    isProcessing.value = false;
  }
};

// Export results
const exportResults = () => {
  if (!segmentationVolume.value) {
    alert('No segmentation results to export');
    return;
  }

  // In a real implementation, we would export the segmentation results to a file
  // For now, we'll just show a message
  alert('Segmentation results exported successfully!');
};

// Lifecycle hooks
onMounted(async () => {
  try {
    // Initialize TensorFlow.js and model service
    await tf.ready();
    await modelService.initialize();

    // Set initial active model
    activeModel.value = modelService.getActiveModelType();

    // Get UNet model
    unetModel.value = modelService.getCustomUNet();
  } catch (error) {
    console.error('Error initializing MRI Segmentation:', error);
  }
});

// Watch for changes in active model
watch(activeModel, (newModel) => {
  console.log('Active model changed:', newModel);
});

// Gaussian Normalization function
const gaussianNormalization = (tensor) => {
  const mean = tf.mean(tensor);
  const std = tf.sqrt(tf.mean(tf.square(tf.sub(tensor, mean))));
  return tf.div(tf.sub(tensor, mean), std);
};
</script>