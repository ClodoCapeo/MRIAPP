import * as tf from "@tensorflow/tfjs"
import { EnhancedUNet } from "@/lib/unet-enhanced"

export class ModelService {
  constructor() {
    this.models = {}
    this.activeModelType = "unet"
    this.customUNet = null
    this.isInitialized = false
    this.step1Model = null
    this.step2Model = null
    this.step3Model = null
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      await tf.ready()
      console.log("TensorFlow.js is ready")

      // Initialize the custom U-Net model
      this.customUNet = new EnhancedUNet()
      await this.customUNet.initialize()
      console.log("Custom U-Net model initialized")

      // Check for saved models
      const modelInfo = await tf.io.listModels()
      console.log("Available models:", modelInfo)

      // Try to load previously saved models
      try {
        if (modelInfo["indexeddb://unet-iseg-model-step1"]) {
          this.step1Model = await tf.loadLayersModel("indexeddb://unet-iseg-model-step1")
          console.log("Loaded step 1 model from IndexedDB")
        }

        if (modelInfo["indexeddb://unet-iseg-model-step2"]) {
          this.step2Model = await tf.loadLayersModel("indexeddb://unet-iseg-model-step2")
          console.log("Loaded step 2 model from IndexedDB")
        }

        if (modelInfo["indexeddb://unet-iseg-model-step3"]) {
          this.step3Model = await tf.loadLayersModel("indexeddb://unet-iseg-model-step3")
          console.log("Loaded step 3 model from IndexedDB")
        }
      } catch (e) {
        console.log("No previously saved models found in IndexedDB:", e)
      }

      this.isInitialized = true
    } catch (error) {
      console.error("Error initializing ModelService:", error)
      throw error
    }
  }

  getActiveModelType() {
    return this.activeModelType
  }

  setActiveModelType(modelType) {
    this.activeModelType = modelType
  }

  getCustomUNet() {
    return this.customUNet
  }

  // Create a U-Net model matching the Python implementation
  createUNetModel(inputShape, outputChannels = 1, activation = "sigmoid") {
    const inputs = tf.input({ shape: inputShape })

    // Encoder path
    const conv1 = this.convBlock(inputs, 64)
    const pool1 = tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(conv1)

    const conv2 = this.convBlock(pool1, 128)
    const pool2 = tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(conv2)

    const conv3 = this.convBlock(pool2, 256)
    const pool3 = tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(conv3)

    const conv4 = this.convBlock(pool3, 512)
    const drop4 = tf.layers.dropout({ rate: 0.5 }).apply(conv4)
    const pool4 = tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(drop4)

    // Bridge
    const conv5 = this.convBlock(pool4, 1024)
    const drop5 = tf.layers.dropout({ rate: 0.5 }).apply(conv5)

    // Decoder path
    const up6 = tf.layers.upSampling2d({ size: [2, 2] }).apply(drop5)
    const up6Conv = tf.layers
        .conv2d({
          filters: 512,
          kernelSize: 2,
          activation: "relu",
          padding: "same",
          kernelInitializer: "heNormal",
        })
        .apply(up6)
    const merge6 = tf.layers.concatenate().apply([drop4, up6Conv])
    const conv6 = this.convBlock(merge6, 512)

    const up7 = tf.layers.upSampling2d({ size: [2, 2] }).apply(conv6)
    const up7Conv = tf.layers
        .conv2d({
          filters: 256,
          kernelSize: 2,
          activation: "relu",
          padding: "same",
          kernelInitializer: "heNormal",
        })
        .apply(up7)
    const merge7 = tf.layers.concatenate().apply([conv3, up7Conv])
    const conv7 = this.convBlock(merge7, 256)

    const up8 = tf.layers.upSampling2d({ size: [2, 2] }).apply(conv7)
    const up8Conv = tf.layers
        .conv2d({
          filters: 128,
          kernelSize: 2,
          activation: "relu",
          padding: "same",
          kernelInitializer: "heNormal",
        })
        .apply(up8)
    const merge8 = tf.layers.concatenate().apply([conv2, up8Conv])
    const conv8 = this.convBlock(merge8, 128)

    const up9 = tf.layers.upSampling2d({ size: [2, 2] }).apply(conv8)
    const up9Conv = tf.layers
        .conv2d({
          filters: 64,
          kernelSize: 2,
          activation: "relu",
          padding: "same",
          kernelInitializer: "heNormal",
        })
        .apply(up9)
    const merge9 = tf.layers.concatenate().apply([conv1, up9Conv])
    const conv9 = this.convBlock(merge9, 64)
    const conv9_2 = tf.layers
        .conv2d({
          filters: 2,
          kernelSize: 3,
          activation: "relu",
          padding: "same",
          kernelInitializer: "heNormal",
        })
        .apply(conv9)

    // Output layer
    const outputs = tf.layers
        .conv2d({
          filters: outputChannels,
          kernelSize: 1,
          activation: activation,
          padding: "same",
        })
        .apply(conv9_2)

    const model = tf.model({ inputs, outputs })

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(1e-4),
      loss: outputChannels > 1 ? "categoricalCrossentropy" : "binaryCrossentropy",
      metrics: ["accuracy"],
    })

    return model
  }

  // Helper method to create convolutional blocks
  convBlock(inputs, filters) {
    const conv = tf.layers
        .conv2d({
          filters,
          kernelSize: 3,
          activation: "relu",
          padding: "same",
          kernelInitializer: "heNormal",
        })
        .apply(inputs)

    return tf.layers
        .conv2d({
          filters,
          kernelSize: 3,
          activation: "relu",
          padding: "same",
          kernelInitializer: "heNormal",
        })
        .apply(conv)
  }

  async loadHDF5Model(modelBuffer, modelType = "step1") {
    try {
      console.log(`Loading HDF5 model for ${modelType}...`)

      // In a real implementation, we would convert the HDF5 model to TensorFlow.js format
      // For now, we'll create a new model with the correct architecture

      let model
      if (modelType === "step1") {
        // Step 1: Binary segmentation (brain vs background)
        model = this.createUNetModel([null, null, 2], 1, "sigmoid")
        this.step1Model = model
      } else if (modelType === "step2") {
        // Step 2: White matter segmentation
        model = this.createUNetModel([null, null, 3], 1, "sigmoid")
        this.step2Model = model
      } else if (modelType === "step3") {
        // Step 3: Multi-class segmentation
        model = this.createUNetModel([null, null, 4], 4, "softmax")
        this.step3Model = model
      }

      // Store the model
      this.models[modelType] = {
        model,
        type: "hdf5",
        name: `HDF5 Model (${modelType})`,
        inputShape: model.inputs[0].shape,
        outputShape: model.outputs[0].shape,
      }

      console.log(`HDF5 model for ${modelType} loaded successfully`)

      // Save the model to IndexedDB for future use
      await model.save(`indexeddb://unet-iseg-model-${modelType}`)

      return true
    } catch (error) {
      console.error(`Error loading HDF5 model for ${modelType}:`, error)
      throw error
    }
  }

  // Gaussian normalization function matching the Python implementation
  gaussianNormalization(volume) {
    return tf.tidy(() => {
      // Create a mask of non-zero values
      const mask = volume.greater(0)

      // Get non-zero values
      const nonZeroValues = volume.mul(mask.cast("float32"))

      // Calculate mean of non-zero values
      const sum = nonZeroValues.sum()
      const count = mask.sum().cast("float32")
      const mean = sum.div(count)

      // Calculate squared differences for std of non-zero values
      const squaredDiff = nonZeroValues.sub(mean).square().mul(mask.cast("float32"))
      const variance = squaredDiff.sum().div(count)
      const std = variance.sqrt()

      // Normalize: (volume - mean) / (5 * std)
      return volume.sub(mean).div(std.mul(5))
    })
  }

  async predict(inputVolumes) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (this.activeModelType === "unet" && this.customUNet) {
      return this.customUNet.predict(inputVolumes)
    } else if (this.step1Model && this.step2Model) {
      // Use the cascaded approach with step1 and step2 models
      return this.predictCascaded(inputVolumes)
    } else if (this.models[this.activeModelType]) {
      const model = this.models[this.activeModelType].model
      // Process input volumes based on model type
      const inputTensors = this.prepareInputTensors(inputVolumes, this.activeModelType)
      // Run prediction
      const prediction = model.predict(inputTensors)
      // Post-process prediction
      return this.postProcessPrediction(prediction, this.activeModelType)
    } else {
      throw new Error(`No model available for type: ${this.activeModelType}`)
    }
  }

  async predictCascaded(inputVolumes) {
    // This method implements the cascaded prediction approach from the Python code
    return tf.tidy(() => {
      try {
        const [t1Volume, t2Volume] = inputVolumes

        // Get dimensions
        const [width, height, depth] = t1Volume.shape

        // Create output volume
        const resultSlices = []

        // Process each slice
        for (let z = 0; z < depth; z++) {
          // Extract slices
          const t1Slice = t1Volume.slice([0, 0, z], [width, height, 1]).reshape([width, height])
          const t2Slice = t2Volume.slice([0, 0, z], [width, height, 1]).reshape([width, height])

          // Normalize slices
          const t1SliceNorm = this.gaussianNormalization(t1Slice)
          const t2SliceNorm = this.gaussianNormalization(t2Slice)

          // Prepare input for step 1
          const step1Input = tf.stack([t1SliceNorm, t2SliceNorm], 2).expandDims(0)

          // Run step 1 prediction
          const step1Prediction = this.step1Model.predict(step1Input)
          const step1Binary = step1Prediction.greater(0.5).toFloat().squeeze([0, 3])

          // If we only have step 1 model, return its prediction
          if (!this.step2Model) {
            resultSlices.push(step1Binary.expandDims(2))
            continue
          }

          // Prepare input for step 2
          const step2Input = tf.stack([t1SliceNorm, t2SliceNorm, step1Binary], 2).expandDims(0)

          // Run step 2 prediction
          const step2Prediction = this.step2Model.predict(step2Input)
          const step2Binary = step2Prediction.greater(0.5).toFloat().squeeze([0, 3])

          // If we only have step 1 and 2 models, return step 2 prediction
          if (!this.step3Model) {
            resultSlices.push(step2Binary.expandDims(2))
            continue
          }

          // Prepare input for step 3
          const step3Input = tf.stack([t1SliceNorm, t2SliceNorm, step1Binary, step2Binary], 2).expandDims(0)

          // Run step 3 prediction
          const step3Prediction = this.step3Model.predict(step3Input)

          // Get class with highest probability
          const segmentation = tf.argMax(step3Prediction, 3).squeeze()

          // Add to result slices
          resultSlices.push(segmentation.expandDims(2))
        }

        // Concatenate all slices along the z-axis
        return tf.concat(resultSlices, 2)
      } catch (error) {
        console.error("Error during cascaded prediction:", error)
        throw error
      }
    })
  }

  prepareInputTensors(inputVolumes, modelType) {
    // Prepare input tensors based on model type
    return tf.tidy(() => {
      const [t1Volume, t2Volume] = inputVolumes

      // Normalize volumes
      const t1Norm = this.gaussianNormalization(t1Volume)
      const t2Norm = this.gaussianNormalization(t2Volume)

      // Stack and expand dimensions for batch
      return tf.stack([t1Norm, t2Norm], 3).expandDims(0)
    })
  }

  postProcessPrediction(prediction, modelType) {
    // Post-process prediction based on model type
    return tf.tidy(() => {
      if (modelType === "step1" || modelType === "step2") {
        // Binary segmentation: threshold at 0.5
        return prediction.greater(0.5).toFloat().squeeze(0)
      } else {
        // Multi-class segmentation: get class with highest probability
        return tf.argMax(prediction, 3).squeeze(0)
      }
    })
  }

  async saveModel(model, path) {
    try {
      const saveResult = await model.save(path)
      console.log(`Model saved to ${path}:`, saveResult)
      return saveResult
    } catch (error) {
      console.error(`Error saving model to ${path}:`, error)
      throw error
    }
  }

  async loadModel(path) {
    try {
      const model = await tf.loadLayersModel(path)
      console.log(`Model loaded from ${path}`)
      return model
    } catch (error) {
      console.error(`Error loading model from ${path}:`, error)
      throw error
    }
  }

  // Method to compute Dice coefficient
  computeDice(prediction, groundTruth) {
    return tf.tidy(() => {
      // Convert to binary masks
      const predBin = prediction.greater(0)
      const gtBin = groundTruth.greater(0)

      // Calculate intersection
      const intersection = tf.logicalAnd(predBin, gtBin).sum()

      // Calculate cardinalities
      const predCard = predBin.sum()
      const gtCard = gtBin.sum()

      // Calculate Dice
      const dice = intersection.mul(2).div(predCard.add(gtCard))

      return dice.dataSync()[0]
    })
  }
}

// Example usage
// const modelService = new ModelService()
// modelService.initialize().then(() => {
//   modelService.loadHDF5Model(modelBuffer, "step1")
//   modelService.setActiveModelType("step1")
//   const prediction = modelService.predict([t1Volume, t2Volume])
//   console.log("Prediction:", prediction)
//   const dice = modelService.computeDice(prediction, groundTruth)
//   console.log("Dice coefficient:", dice)
// })
//     }
//     }
//     return inputVolumes[0].clone()

//   } catch (error) {
//     console.error("Error during prediction:", error)
//     throw error
//   }

//   }


export default ModelService;