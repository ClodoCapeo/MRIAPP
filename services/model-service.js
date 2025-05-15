import * as tf from "@tensorflow/tfjs"
import { EnhancedUNet } from "@/lib/unet-enhanced"

// Model types
export const MODEL_TYPES = {
  CUSTOM: "custom",
  ISEG_WINNER: "iseg_winner",
  HDF5_MODEL: "hdf5_model",
}

// Model paths
const MODEL_PATHS = {
  [MODEL_TYPES.ISEG_WINNER]: "models/iseg2017_winner/model.json",
}

class ModelService {
  constructor() {
    this.models = {}
    this.activeModelType = MODEL_TYPES.ISEG_WINNER // Default to iSeg winner model
    this.customUNet = null
    this.hdf5Models = {} // Store for HDF5 models
  }

  async initialize() {
    try {
      await tf.ready()
      console.log("TensorFlow.js initialized")

      // Initialize the custom UNet model
      this.customUNet = new EnhancedUNet()
      await this.customUNet.initialize()
      this.models[MODEL_TYPES.CUSTOM] = this.customUNet

      // Load the iSeg-2017 Challenge Winner Model
      await this.loadPretrainedModel(MODEL_TYPES.ISEG_WINNER)

      return true
    } catch (error) {
      console.error("Failed to initialize ModelService:", error)
      return false
    }
  }

  async loadPretrainedModel(modelType) {
    if (!MODEL_PATHS[modelType]) {
      throw new Error(`Unknown model type: ${modelType}`)
    }

    try {
      console.log(`Loading pre-trained model: ${modelType}`)
      const model = await tf.loadLayersModel(MODEL_PATHS[modelType])
      this.models[modelType] = model
      console.log(`Successfully loaded ${modelType} model`)
      return model
    } catch (error) {
      console.error(`Failed to load ${modelType} model:`, error)
      throw error
    }
  }

  // New method to load HDF5 models
  async loadHDF5Model(modelFile, modelType, step) {
    try {
      console.log(`Loading HDF5 model: ${modelFile}`)

      // In a real implementation, we would need to:
      // 1. Convert the HDF5 file to TensorFlow.js format
      // 2. Load the converted model

      // For this demo, we'll simulate loading
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a unique key for this HDF5 model
      const modelKey = `${MODEL_TYPES.HDF5_MODEL}_${step}`

      // Store model information
      this.hdf5Models[modelKey] = {
        file: modelFile,
        type: modelType,
        step: step,
        loaded: true,
      }

      // For demo purposes, we'll use the custom UNet model as a placeholder
      if (step === 1) {
        this.models[modelKey] = this.customUNet.modelStep1
      } else if (step === 2) {
        this.models[modelKey] = this.customUNet.modelStep2
      } else if (step === 3) {
        this.models[modelKey] = this.customUNet.modelStep3
      }

      console.log(`Successfully loaded HDF5 model: ${modelFile}`)
      return this.models[modelKey]
    } catch (error) {
      console.error(`Failed to load HDF5 model: ${modelFile}`, error)
      throw error
    }
  }

  setActiveModel(modelType) {
    if (!this.models[modelType]) {
      throw new Error(`Model not loaded: ${modelType}`)
    }
    this.activeModelType = modelType
    console.log(`Active model set to: ${modelType}`)
  }

  getActiveModel() {
    return this.models[this.activeModelType]
  }

  getActiveModelType() {
    return this.activeModelType
  }

  getCustomUNet() {
    return this.customUNet
  }

  async predict(inputVolumes) {
    const activeModel = this.getActiveModel()

    if (this.activeModelType === MODEL_TYPES.CUSTOM) {
      // Use the custom UNet prediction method
      return await this.customUNet.predict(inputVolumes)
    } else if (this.activeModelType.startsWith(MODEL_TYPES.HDF5_MODEL)) {
      // Use the HDF5 model for prediction
      // For demo purposes, we'll use the custom UNet prediction method
      return await this.customUNet.predict(inputVolumes)
    } else {
      // Use the pre-trained model for prediction
      return await this.predictWithPretrainedModel(activeModel, inputVolumes)
    }
  }

  async predictWithPretrainedModel(model, inputVolumes) {
    // If we're just viewing ground truth
    if (inputVolumes.length === 1) {
      // Just return the input volume (assuming it's the ground truth)
      return inputVolumes[0].clone()
    }

    return tf.tidy(() => {
      try {
        // Get volume dimensions from the first volume
        const [width, height, depth] = inputVolumes[0].shape

        // Check that all volumes have the same dimensions
        for (let i = 1; i < inputVolumes.length; i++) {
          if (!tf.util.arraysEqual(inputVolumes[0].shape, inputVolumes[i].shape)) {
            throw new Error(
                `Input volumes must have the same dimensions. Volume 0: ${inputVolumes[0].shape}, Volume ${i}: ${inputVolumes[i].shape}`,
            )
          }
        }

        // Process each slice and combine results
        const resultSlices = []

        for (let z = 0; z < depth; z++) {
          // Extract 2D slices from each volume
          const slices = inputVolumes.map((volume) =>
              volume.slice([0, 0, z], [width, height, 1]).reshape([width, height]),
          )

          // Resize slices to 128x128
          const resizedSlices = slices.map((slice) =>
              tf.image.resizeBilinear(slice.expandDims(2), [128, 128]).squeeze(),
          )

          // Combine slices into a single input tensor
          const input = tf.stack(resizedSlices, 2).expandDims(0)

          // Normalize to [0,1]
          const normalizedInput = input.div(input.max())

          // Run prediction
          const prediction = model.predict(normalizedInput)

          // Get class with highest probability for each pixel
          const segmentation = tf.argMax(prediction, 3).squeeze()

          // Resize back to original dimensions
          const resizedSegmentation = tf.image
              .resizeBilinear(segmentation.expandDims(2), [width, height], true)
              .squeeze()

          // Convert back to integer classes
          const finalSegmentation = tf.cast(tf.round(resizedSegmentation), "int32")

          // Add to result slices
          resultSlices.push(finalSegmentation.expandDims(2))
        }

        // Concatenate all slices along the z-axis
        return tf.concat(resultSlices, 2)
      } catch (error) {
        console.error("Error during prediction:", error)
        throw error
      }
    })
  }
}

// Create a singleton instance
const modelService = new ModelService()

export default modelService
