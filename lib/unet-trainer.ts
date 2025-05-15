import * as tf from "@tensorflow/tfjs"
import { gaussianNormalization, filterValidCuts } from "./utils"

/**
 * Class for training U-Net models for MRI segmentation
 * This follows the same workflow as the Python code
 */
export class UNetTrainer {
  private model: tf.LayersModel | null = null
  private modelType: string = 'step1'
  private inputShape: [number, number, number] = [144, 192, 2]
  private trainingData: any[] = []
  private validationData: any[] = []
  private testData: any[] = []
  private isTraining: boolean = false
  private callbacks: tf.Callback[] = []
  private epochs: number = 100
  private batchSize: number = 1

  /**
   * Constructor
   * @param modelType Type of model to train (step1, step2, step3)
   */
  constructor(modelType: string = 'step1') {
    this.modelType = modelType
    this.inputShape = modelType === 'step1' ? [144, 192, 2] :
        modelType === 'step2' ? [144, 192, 3] :
            [144, 192, 4]
  }

  /**
   * Initialize the trainer
   * @param pretrainedWeights Path to pretrained weights (optional)
   */
  public async initialize(pretrainedWeights?: string): Promise<void> {
    try {
      await tf.ready()
      console.log('TensorFlow.js is ready')

      // Create the model
      this.model = await this.createUNetModel()

      // Load pretrained weights if provided
      if (pretrainedWeights) {
        await this.loadWeights(pretrainedWeights)
      }

      console.log(`U-Net model for ${this.modelType} initialized`)
    } catch (error) {
      console.error('Error initializing U-Net trainer:', error)
      throw error
    }
  }

  /**
   * Create a U-Net model with the same architecture as the Python code
   * @returns A promise that resolves to a TensorFlow.js model
   */
  private async createUNetModel(): Promise<tf.LayersModel> {
    // Create the model
    const inputs = tf.input({shape: this.inputShape})

    // Encoder (Contracting Path)
    const conv1 = this.convBlock(inputs, 64)
    const pool1 = tf.layers.maxPooling2d({poolSize: [2, 2]}).apply(conv1) as tf.SymbolicTensor

    const conv2 = this.convBlock(pool1, 128)
    const pool2 = tf.layers.maxPooling2d({poolSize: [2, 2]}).apply(conv2) as tf.SymbolicTensor

    const conv3 = this.convBlock(pool2, 256)
    const pool3 = tf.layers.maxPooling2d({poolSize: [2, 2]}).apply(conv3) as tf.SymbolicTensor

    const conv4 = this.convBlock(pool3, 512)
    const drop4 = tf.layers.dropout({rate: 0.5}).apply(conv4) as tf.SymbolicTensor
    const pool4 = tf.layers.maxPooling2d({poolSize: [2, 2]}).apply(drop4) as tf.SymbolicTensor

    // Bridge
    const conv5 = this.convBlock(pool4, 1024)
    const drop5 = tf.layers.dropout({rate: 0.5}).apply(conv5) as tf.SymbolicTensor

    // Decoder (Expansive Path)
    const up6 = tf.layers.upSampling2d({size: [2, 2]}).apply(drop5) as tf.SymbolicTensor
    const up6Conv = tf.layers.conv2d({
      filters: 512,
      kernelSize: 2,
      activation: 'relu',
      padding: 'same',
      kernelInitializer: 'heNormal'
    }).apply(up6) as tf.SymbolicTensor
    const merge6 = tf.layers.concatenate().apply([drop4, up6Conv]) as tf.SymbolicTensor
    const conv6 = this.convBlock(merge6, 512)

    const up7 = tf.layers.upSampling2d({size: [2, 2]}).apply(conv6) as tf.SymbolicTensor
    const up7Conv = tf.layers.conv2d({
      filters: 256,
      kernelSize: 2,
      activation: 'relu',
      padding: 'same',
      kernelInitializer: 'heNormal'
    }).apply(up7) as tf.SymbolicTensor
    const merge7 = tf.layers.concatenate().apply([conv3, up7Conv]) as tf.SymbolicTensor
    const conv7 = this.convBlock(merge7, 256)

    const up8 = tf.layers.upSampling2d({size: [2, 2]}).apply(conv7) as tf.SymbolicTensor
    const up8Conv = tf.layers.conv2d({
      filters: 128,
      kernelSize: 2,
      activation: 'relu',
      padding: 'same',
      kernelInitializer: 'heNormal'
    }).apply(up8) as tf.SymbolicTensor
    const merge8 = tf.layers.concatenate().apply([conv2, up8Conv]) as tf.SymbolicTensor
    const conv8 = this.convBlock(merge8, 128)

    const up9 = tf.layers.upSampling2d({size: [2, 2]}).apply(conv8) as tf.SymbolicTensor
    const up9Conv = tf.layers.conv2d({
      filters: 64,
      kernelSize: 2,
      activation: 'relu',
      padding: 'same',
      kernelInitializer: 'heNormal'
    }).apply(up9) as tf.SymbolicTensor
    const merge9 = tf.layers.concatenate().apply([conv1, up9Conv]) as tf.SymbolicTensor
    const conv9 = this.convBlock(merge9, 64)
    const conv9_2 = tf.layers.conv2d({
      filters: 2,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
      kernelInitializer: 'heNormal'
    }).apply(conv9) as tf.SymbolicTensor

    // Output layer
    const outputs = tf.layers.conv2d({
      filters: 1,
      kernelSize: 1,
      activation: 'sigmoid',
      padding: 'same'
    }).apply(conv9_2) as tf.SymbolicTensor

    // Create and compile the model
    const model = tf.model({inputs, outputs})

    model.compile({
      optimizer: tf.train.adam(1e-4),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    })

    return model
  }

  /**
   * Create a convolutional block for the U-Net
   * @param inputs Input tensor
   * @param filters Number of filters
   * @returns Output tensor
   */
  private convBlock(inputs: tf.SymbolicTensor, filters: number): tf.SymbolicTensor {
    const conv = tf.layers.conv2d({
      filters,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
      kernelInitializer: 'heNormal'
    }).apply(inputs) as tf.SymbolicTensor

    return tf.layers.conv2d({
      filters,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same',
      kernelInitializer: 'heNormal'
    }).apply(conv) as tf.SymbolicTensor
  }

  /**
   * Load weights from a file
   * @param path Path to the weights file
   */
  public async loadWeights(path: string): Promise<void> {
    try {
      if (!this.model) {
        throw new Error('Model not initialized')
      }

      await this.model.loadWeights(path)
      console.log(`Weights loaded from ${path}`)
    } catch (error) {
      console.error('Error loading weights:', error)
      throw error
    }
  }

  /**
   * Save weights to a file
   * @param path Path to save the weights
   */
  public async saveWeights(path: string): Promise<void> {
    try {
      if (!this.model) {
        throw new Error('Model not initialized')
      }

      await this.model.save(path)
      console.log(`Weights saved to ${path}`)
    } catch (error) {
      console.error('Error saving weights:', error)
      throw error
    }
  }

  /**
   * Set the training data
   * @param t1Volumes Array of T1 volumes
   * @param t2Volumes Array of T2 volumes
   * @param labelVolumes Array of label volumes
   */
  public setTrainingData(t1Volumes: any[], t2Volumes: any[], labelVolumes: any[]): void {
    // Normalize the volumes
    const normalizedT1 = t1Volumes.map(vol => gaussianNormalization(vol))
    const normalizedT2 = t2Volumes.map(vol => gaussianNormalization(vol))

    this.trainingData = this.formatData(normalizedT1, normalizedT2, labelVolumes)
    console.log(`Training data set: ${this.trainingData.length} samples`)
  }

  /**
   * Set the validation data
   * @param t1Volumes Array of T1 volumes
   * @param t2Volumes Array of T2 volumes
   * @param labelVolumes Array of label volumes
   */
  public setValidationData(t1Volumes: any[], t2Volumes: any[], labelVolumes: any[]): void {
    // Normalize the volumes
    const normalizedT1 = t1Volumes.map(vol => gaussianNormalization(vol))
    const normalizedT2 = t2Volumes.map(vol => gaussianNormalization(vol))

    this.validationData = this.formatData(normalizedT1, normalizedT2, labelVolumes)
    console.log(`Validation data set: ${this.validationData.length} samples`)
  }

  /**
   * Set the test data
   * @param t1Volumes Array of T1 volumes
   * @param t2Volumes Array of T2 volumes
   * @param labelVolumes Array of label volumes
   */
  public setTestData(t1Volumes: any[], t2Volumes: any[], labelVolumes: any[]): void {
    // Normalize the volumes
    const normalizedT1 = t1Volumes.map(vol => gaussianNormalization(vol))
    const normalizedT2 = t2Volumes.map(vol => gaussianNormalization(vol))

    this.testData = this.formatData(normalizedT1, normalizedT2, labelVolumes)
    console.log(`Test data set: ${this.testData.length} samples`)
  }

  /**
   * Format the data for training
   * @param t1Volumes Array of normalized T1 volumes
   * @param t2Volumes Array of normalized T2 volumes
   * @param labelVolumes Array of label volumes
   * @returns Formatted data
   */
  private formatData(t1Volumes: any[], t2Volumes: any[], labelVolumes: any[]): any[] {
    const formattedData: any[] = []

    // Process each volume
    for (let i = 0; i < t1Volumes.length; i++) {
      const t1Vol = t1Volumes[i]
      const t2Vol = t2Volumes[i]
      const labelVol = labelVolumes[i]

      // Get the dimensions
      const width = t1Vol.shape[0]
      const height = t1Vol.shape[1]
      const depth = t1Vol.shape[2]

      // Process each slice
      for (let z = 0; z < depth; z++) {
        // Check if the slice has enough labeled pixels
        const labelSlice = tf.slice(labelVol, [0, 0, z], [width, height, 1]).reshape([width, height])
        const validCut = filterValidCuts(labelSlice)

        if (validCut) {
          // Extract the slices
          const t1Slice = tf.slice(t1Vol, [0, 0, z], [width, height, 1]).reshape([width, height])
          const t2Slice = tf.slice(t2Vol, [0, 0, z], [width, height, 1]).reshape([width, height])

          // Create the input tensor
          let inputTensor: tf.Tensor

          if (this.modelType === 'step1') {
            // For step1, we use T1 and T2
            inputTensor = tf.stack([t1Slice, t2Slice], 2)
          } else if (this.modelType === 'step2') {
            // For step2, we use T1, T2, and the output of step1
            // We need to run the step1 model on the input
            const step1Input = tf.stack([t1Slice, t2Slice], 2).expandDims(0)
            const step1Output = this.runStep1Model(step1Input)
            inputTensor = tf.concat([t1Slice, t2Slice, step1Output.squeeze()], 2)
          } else {
            // For step3, we use T1, T2, step1 output, and step2 output
            // We need to run both step1 and step2 models
            const step1Input = tf.stack([t1Slice, t2Slice], 2).expandDims(0)
            const step1Output = this.runStep1Model(step1Input)

            const step2Input = tf.concat([
              t1Slice.expandDims(2),
              t2Slice.expandDims(2),
              step1Output.squeeze().expandDims(2)
            ], 2).expandDims(0)

            const step2Output = this.runStep2Model(step2Input)

            inputTensor = tf.concat([
              t1Slice,
              t2Slice,
              step1Output.squeeze(),
              step2Output.squeeze()
            ], 2)
          }

          // Create the target tensor
          const targetTensor = this.createTargetTensor(labelSlice)

          // Add to the formatted data
          formattedData.push({
            input: inputTensor,
            target: targetTensor
          })
        }
      }
    }

    return formattedData
  }

  /**
   * Run the step1 model on an input
   * @param input Input tensor
   * @returns Output tensor
   */
  private runStep1Model(input: tf.Tensor): tf.Tensor {
    // In a real implementation, we would run the step1 model
    // For now, we'll just return a placeholder
    return tf.zeros([input.shape[0], input.shape[1], input.shape[2], 1])
  }

  /**
   * Run the step2 model on an input
   * @param input Input tensor
   * @returns Output tensor
   */
  private runStep2Model(input: tf.Tensor): tf.Tensor {
    // In a real implementation, we would run the step2 model
    // For now, we'll just return a placeholder
    return tf.zeros([input.shape[0], input.shape[1], input.shape[2], 1])
  }

  /**
   * Create a target tensor from a label slice
   * @param labelSlice Label slice tensor
   * @returns Target tensor
   */
  private createTargetTensor(labelSlice: tf.Tensor): tf.Tensor {
    // For step1, we use a binary mask (>0)
    if (this.modelType === 'step1') {
      return tf.greater(labelSlice, 0).toFloat()
    }

    // For step2, we use a binary mask (>10)
    if (this.modelType === 'step2') {
      return tf.greater(labelSlice, 10).toFloat()
    }

    // For step3, we use a multi-class mask
    // This is a simplified version - in a real implementation, we would use the actual class values
    return tf.oneHot(tf.cast(labelSlice, 'int32'), 4)
  }

  /**
   * Train the model
   * @param epochs Number of epochs
   * @param batchSize Batch size
   * @param callbacks Callbacks for training
   * @returns Training history
   */
  public async train(epochs: number = 100, batchSize: number = 1, callbacks: tf.Callback[] = []): Promise<tf.History> {
    try {
      if (!this.model) {
        throw new Error('Model not initialized')
      }

      if (this.trainingData.length === 0) {
        throw new Error('No training data')
      }

      if (this.validationData.length === 0) {
        throw new Error('No validation data')
      }

      this.isTraining = true
      this.epochs = epochs
      this.batchSize = batchSize
      this.callbacks = callbacks

      // Prepare the data
      const trainX = tf.concat(this.trainingData.map(d => d.input.expandDims(0)), 0)
      const trainY = tf.concat(this.trainingData.map(d => d.target.expandDims(0)), 0)

      const valX = tf.concat(this.validationData.map(d => d.input.expandDims(0)), 0)
      const valY = tf.concat(this.validationData.map(d => d.target.expandDims(0)), 0)

      // Train the model
      const history = await this.model.fit(trainX, trainY, {
        epochs,
        batchSize,
        validationData: [valX, valY],
        callbacks,
        shuffle: true
      })

      this.isTraining = false

      return history
    } catch (error) {
      this.isTraining = false
      console.error('Error training model:', error)
      throw error
    }
  }

  /**
   * Predict on a volume
   * @param t1Volume T1 volume
   * @param t2Volume T2 volume
   * @param step1Model Step1 model (optional)
   * @param step2Model Step2 model (optional)
   * @returns Prediction volume
   */
  public async predict(t1Volume: any, t2Volume: any, step1Model?: tf.LayersModel, step2Model?: tf.LayersModel): Promise<any> {
    try {
      if (!this.model) {
        throw new Error('Model not initialized')
      }

      // Normalize the volumes
      const normalizedT1 = gaussianNormalization(t1Volume)
      const normalizedT2 = gaussianNormalization(t2Volume)

      // Get the dimensions
      const width = normalizedT1.shape[0]
      const height = normalizedT1.shape[1]
      const depth = normalizedT1.shape[2]

      // Create the prediction volume
      const predictionVolume = tf.zeros([width, height, depth])

      // Process each slice
      for (let z = 0; z < depth; z++) {
        // Extract the slices
        const t1Slice = tf.slice(normalizedT1, [0, 0, z], [width, height, 1]).reshape([width, height])
        const t2Slice = tf.slice(normalizedT2, [0, 0, z], [width, height, 1]).reshape([width, height])

        // Create the input tensor
        let inputTensor: tf.Tensor

        if (this.modelType === 'step1') {
          // For step1, we use T1 and T2
          inputTensor = tf.stack([t1Slice, t2Slice], 2).expandDims(0)
        } else if (this.modelType === 'step2') {
          // For step2, we use T1, T2, and the output of step1
          // We need to run the step1 model on the input
          const step1Input = tf.stack([t1Slice, t2Slice], 2).expandDims(0)
          const step1Output = step1Model ? step1Model.predict(step1Input) as tf.Tensor : this.runStep1Model(step1Input)

          inputTensor = tf.concat([
            t1Slice.expandDims(2),
            t2Slice.expandDims(2),
            step1Output.squeeze().expandDims(2)
          ], 2).expandDims(0)
        } else {
          // For step3, we use T1, T2, step1 output, and step2 output
          // We need to run both step1 and step2 models
          const step1Input = tf.stack([t1Slice, t2Slice], 2).expandDims(0)
          const step1Output = step1Model ? step1Model.predict(step1Input) as tf.Tensor : this.runStep1Model(step1Input)

          const step2Input = tf.concat([
            t1Slice.expandDims(2),
            t2Slice.expandDims(2),
            step1Output.squeeze().expandDims(2)
          ], 2).expandDims(0)

          const step2Output = step2Model ? step2Model.predict(step2Input) as tf.Tensor : this.runStep2Model(step2Input)

          inputTensor = tf.concat([
            t1Slice.expandDims(2),
            t2Slice.expandDims(2),
            step1Output.squeeze().expandDims(2),
            step2Output.squeeze().expandDims(2)
          ], 2).expandDims(0)
        }

        // Run the prediction
        const prediction = this.model.predict(inputTensor) as tf.Tensor

        // Threshold the prediction
        const thresholdedPrediction = tf.greater(prediction, 0.5).toFloat()

        // Add to the prediction volume
        const slicePrediction = thresholdedPrediction.squeeze()
        predictionVolume.slice([0, 0, z], [width, height, 1]).assign(slicePrediction.expandDims(2))
      }

      return predictionVolume
    } catch (error) {
      console.error('Error predicting:', error)
      throw error
    }
  }

  /**
   * Compute the Dice coefficient between two volumes
   * @param prediction Prediction volume
   * @param groundTruth Ground truth volume
   * @returns Dice coefficient
   */
  public computeDice(prediction: tf.Tensor, groundTruth: tf.Tensor): number {
    try {
      // Convert to binary masks
      const predictionBin = tf.greater(prediction, 0).toFloat()
      const groundTruthBin = tf.greater(groundTruth, 0).toFloat()

      // Compute the intersection
      const intersection = tf.logicalAnd(predictionBin, groundTruthBin).sum().dataSync()[0]

      // Compute the cardinalities
      const predictionCard = predictionBin.sum().dataSync()[0]
      const groundTruthCard = groundTruthBin.sum().dataSync()[0]

      // Compute the Dice coefficient
      if (predictionCard + groundTruthCard > 0) {
        return (2.0 * intersection) / (predictionCard + groundTruthCard)
      } else {
        return -1
      }
    } catch (error) {
      console.error('Error computing Dice coefficient:', error)
      throw error
    }
  }

  /**
   * Get the model
   * @returns The model
   */
  public getModel(): tf.LayersModel | null {
    return this.model
  }

  /**
   * Get the model type
   * @returns The model type
   */
  public getModelType(): string {
    return this.modelType
  }

  /**
   * Check if the model is training
   * @returns True if the model is training, false otherwise
   */
  public isModelTraining(): boolean {
    return this.isTraining
  }
}
