import * as tf from "@tensorflow/tfjs"
import { gaussianNormalization } from "@/utils/volumeUtils"

/**
 * Enhanced U-Net model for MRI brain segmentation
 * Implements a cascaded approach with three stages:
 * 1. Brain tissue segmentation (binary)
 * 2. White matter segmentation (binary)
 * 3. Multi-class tissue segmentation (4 classes)
 */
export class EnhancedUNet {
    private step1Model: tf.LayersModel | null = null;
    private step2Model: tf.LayersModel | null = null;
    private step3Model: tf.LayersModel | null = null;
    private isInitialized: boolean = false;

    /**
     * Initialize the model
     * @param inputChannels Optional number of input channels (default: 2 for T1+T2)
     */
    async initialize(inputChannels: number = 2): Promise<void> {
        if (this.isInitialized) return;

        try {
            await tf.ready();
            console.log("TensorFlow.js is ready");

            // Check for saved models
            const modelInfo = await tf.io.listModels();
            console.log("Available models:", modelInfo);

            // Try to load previously saved models
            try {
                if (modelInfo["indexeddb://unet-iseg-model-step1"]) {
                    this.step1Model = await tf.loadLayersModel("indexeddb://unet-iseg-model-step1");
                    console.log("Loaded step 1 model from IndexedDB");
                }

                if (modelInfo["indexeddb://unet-iseg-model-step2"]) {
                    this.step2Model = await tf.loadLayersModel("indexeddb://unet-iseg-model-step2");
                    console.log("Loaded step 2 model from IndexedDB");
                }

                if (modelInfo["indexeddb://unet-iseg-model-step3"]) {
                    this.step3Model = await tf.loadLayersModel("indexeddb://unet-iseg-model-step3");
                    console.log("Loaded step 3 model from IndexedDB");
                }
            } catch (e) {
                console.log("No previously saved models found in IndexedDB:", e);
            }

            // If models weren't loaded, create new ones
            if (!this.step1Model) {
                console.log("Creating new step 1 model");
                this.step1Model = this.createUNetModel([null, null, inputChannels], 1, "sigmoid");
            }

            if (!this.step2Model) {
                console.log("Creating new step 2 model");
                this.step2Model = this.createUNetModel([null, null, inputChannels + 1], 1, "sigmoid");
            }

            if (!this.step3Model) {
                console.log("Creating new step 3 model");
                this.step3Model = this.createUNetModel([null, null, inputChannels + 2], 4, "softmax");
            }

            this.isInitialized = true;
            console.log("Enhanced U-Net initialized successfully");
        } catch (error) {
            console.error("Error initializing EnhancedUNet:", error);
            throw error;
        }
    }

    /**
     * Create a U-Net model
     * @param inputShape Input shape [height, width, channels]
     * @param outputChannels Number of output channels
     * @param activation Activation function for the output layer
     * @returns U-Net model
     */
    private createUNetModel(inputShape: (number | null)[], outputChannels: number = 1, activation: string = "sigmoid"): tf.LayersModel {
        console.log(`Creating U-Net model with input shape ${JSON.stringify(inputShape)}, ${outputChannels} output channels, and ${activation} activation`);

        const inputs = tf.input({ shape: inputShape });
        console.log(`Created input layer: ${inputs.shape}`);

        // Encoder path
        console.log(`Building encoder path...`);
        const conv1 = this.convBlock(inputs, 64);
        console.log(`Conv1 shape: ${conv1.shape}`);
        const pool1 = tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(conv1);

        const conv2 = this.convBlock(pool1, 128);
        console.log(`Conv2 shape: ${conv2.shape}`);
        const pool2 = tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(conv2);

        const conv3 = this.convBlock(pool2, 256);
        console.log(`Conv3 shape: ${conv3.shape}`);
        const pool3 = tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(conv3);

        const conv4 = this.convBlock(pool3, 512);
        const drop4 = tf.layers.dropout({ rate: 0.5 }).apply(conv4);
        const pool4 = tf.layers.maxPooling2d({ poolSize: [2, 2] }).apply(drop4);

        // Bridge
        const conv5 = this.convBlock(pool4, 1024);
        const drop5 = tf.layers.dropout({ rate: 0.5 }).apply(conv5);

        // Decoder path
        const up6 = tf.layers.upSampling2d({ size: [2, 2] }).apply(drop5);
        const up6Conv = tf.layers
            .conv2d({
                filters: 512,
                kernelSize: 2,
                activation: "relu",
                padding: "same",
                kernelInitializer: "heNormal",
            })
            .apply(up6);
        const merge6 = tf.layers.concatenate().apply([drop4, up6Conv]);
        const conv6 = this.convBlock(merge6, 512);

        const up7 = tf.layers.upSampling2d({ size: [2, 2] }).apply(conv6);
        const up7Conv = tf.layers
            .conv2d({
                filters: 256,
                kernelSize: 2,
                activation: "relu",
                padding: "same",
                kernelInitializer: "heNormal",
            })
            .apply(up7);
        const merge7 = tf.layers.concatenate().apply([conv3, up7Conv]);
        const conv7 = this.convBlock(merge7, 256);

        const up8 = tf.layers.upSampling2d({ size: [2, 2] }).apply(conv7);
        const up8Conv = tf.layers
            .conv2d({
                filters: 128,
                kernelSize: 2,
                activation: "relu",
                padding: "same",
                kernelInitializer: "heNormal",
            })
            .apply(up8);
        const merge8 = tf.layers.concatenate().apply([conv2, up8Conv]);
        const conv8 = this.convBlock(merge8, 128);

        const up9 = tf.layers.upSampling2d({ size: [2, 2] }).apply(conv8);
        const up9Conv = tf.layers
            .conv2d({
                filters: 64,
                kernelSize: 2,
                activation: "relu",
                padding: "same",
                kernelInitializer: "heNormal",
            })
            .apply(up9);
        const merge9 = tf.layers.concatenate().apply([conv1, up9Conv]);
        const conv9 = this.convBlock(merge9, 64);
        const conv9_2 = tf.layers
            .conv2d({
                filters: 2,
                kernelSize: 3,
                activation: "relu",
                padding: "same",
                kernelInitializer: "heNormal",
            })
            .apply(conv9);

        // Output layer
        const outputs = tf.layers
            .conv2d({
                filters: outputChannels,
                kernelSize: 1,
                activation: activation,
                padding: "same",
            })
            .apply(conv9_2);

        const model = tf.model({ inputs, outputs });

        // Compile the model
        model.compile({
            optimizer: tf.train.adam(1e-4),
            loss: outputChannels > 1 ? "categoricalCrossentropy" : "binaryCrossentropy",
            metrics: ["accuracy"],
        });

        return model;
    }

    /**
     * Create a convolutional block
     * @param inputs Input tensor
     * @param filters Number of filters
     * @returns Output tensor
     */
    private convBlock(inputs: tf.SymbolicTensor, filters: number): tf.SymbolicTensor {
        const conv = tf.layers
            .conv2d({
                filters,
                kernelSize: 3,
                activation: "relu",
                padding: "same",
                kernelInitializer: "heNormal",
            })
            .apply(inputs);

        return tf.layers
            .conv2d({
                filters,
                kernelSize: 3,
                activation: "relu",
                padding: "same",
                kernelInitializer: "heNormal",
            })
            .apply(conv);
    }

    /**
     * Predict segmentation for a specific step
     * @param inputVolumes Array of input volumes [t1Volume, t2Volume]
     * @param step Step number (1, 2, or 3)
     * @returns Segmentation volume
     */
    async predictStep(inputVolumes: tf.Tensor[], step: number): Promise<tf.Tensor> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return tf.tidy(() => {
            try {
                const [t1Volume, t2Volume] = inputVolumes;

                // Get dimensions
                const [width, height, depth] = t1Volume.shape;

                // Create output volume
                const resultSlices = [];

                // Process each slice
                for (let z = 0; z < depth; z++) {
                    // Extract slices
                    const t1Slice = t1Volume.slice([0, 0, z], [width, height, 1]).reshape([width, height]);
                    const t2Slice = t2Volume.slice([0, 0, z], [width, height, 1]).reshape([width, height]);

                    // Normalize slices
                    const t1SliceNorm = gaussianNormalization(t1Slice);
                    const t2SliceNorm = gaussianNormalization(t2Slice);

                    if (step === 1) {
                        // Step 1: Brain tissue segmentation
                        const step1Input = tf.stack([t1SliceNorm, t2SliceNorm], 2).expandDims(0);
                        const step1Prediction = this.step1Model!.predict(step1Input) as tf.Tensor;
                        const step1Binary = step1Prediction.greater(0.5).toFloat().squeeze([0, 3]);
                        resultSlices.push(step1Binary.expandDims(2));
                    } else if (step === 2) {
                        // Step 2: White matter segmentation
                        // First get step 1 prediction
                        const step1Input = tf.stack([t1SliceNorm, t2SliceNorm], 2).expandDims(0);
                        const step1Prediction = this.step1Model!.predict(step1Input) as tf.Tensor;
                        const step1Binary = step1Prediction.greater(0.5).toFloat().squeeze([0, 3]);

                        // Then do step 2
                        const step2Input = tf.stack([t1SliceNorm, t2SliceNorm, step1Binary], 2).expandDims(0);
                        const step2Prediction = this.step2Model!.predict(step2Input) as tf.Tensor;
                        const step2Binary = step2Prediction.greater(0.5).toFloat().squeeze([0, 3]);
                        resultSlices.push(step2Binary.expandDims(2));
                    } else if (step === 3) {
                        // Step 3: Multi-class segmentation
                        // First get step 1 prediction
                        const step1Input = tf.stack([t1SliceNorm, t2SliceNorm], 2).expandDims(0);
                        const step1Prediction = this.step1Model!.predict(step1Input) as tf.Tensor;
                        const step1Binary = step1Prediction.greater(0.5).toFloat().squeeze([0, 3]);

                        // Then get step 2 prediction
                        const step2Input = tf.stack([t1SliceNorm, t2SliceNorm, step1Binary], 2).expandDims(0);
                        const step2Prediction = this.step2Model!.predict(step2Input) as tf.Tensor;
                        const step2Binary = step2Prediction.greater(0.5).toFloat().squeeze([0, 3]);

                        // Finally do step 3
                        const step3Input = tf.stack([t1SliceNorm, t2SliceNorm, step1Binary, step2Binary], 2).expandDims(0);
                        const step3Prediction = this.step3Model!.predict(step3Input) as tf.Tensor;
                        const segmentation = tf.argMax(step3Prediction, 3).squeeze([0]);
                        resultSlices.push(segmentation.expandDims(2));
                    }
                }

                // Concatenate all slices along the z-axis
                return tf.concat(resultSlices, 2);
            } catch (error) {
                console.error("Error during prediction:", error);
                throw error;
            }
        });
    }

    /**
     * Predict segmentation using all three steps
     * @param inputVolumes Array of input volumes [t1Volume, t2Volume]
     * @returns Segmentation volume
     */
    async predict(inputVolumes: tf.Tensor[]): Promise<tf.Tensor> {
        return this.predictStep(inputVolumes, 3);
    }

    /**
     * Train the model for a specific step
     * @param xTrain Training data
     * @param yTrain Training labels
     * @param step Step number (1, 2, or 3)
     * @param epochs Number of epochs
     * @param batchSize Batch size
     * @returns Training history
     */
    async train(xTrain: tf.Tensor, yTrain: tf.Tensor, step: number = 1, epochs: number = 10, batchSize: number = 8): Promise<tf.History> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        let model: tf.LayersModel;
        if (step === 1) {
            model = this.step1Model!;
        } else if (step === 2) {
            model = this.step2Model!;
        } else {
            model = this.step3Model!;
        }

        // Train the model
        const history = await model.fit(xTrain, yTrain, {
            epochs,
            batchSize,
            validationSplit: 0.1,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Step ${step}, Epoch ${epoch + 1}/${epochs} - loss: ${logs?.loss.toFixed(4)}, accuracy: ${logs?.acc.toFixed(4)}`);
                }
            }
        });

        // Save the model
        await model.save(`indexeddb://unet-iseg-model-step${step}`);
        console.log(`Step ${step} model saved to IndexedDB`);

        return history;
    }

    /**
     * Save all models
     */
    async saveModels(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error("Models not initialized");
        }

        if (this.step1Model) {
            await this.step1Model.save("indexeddb://unet-iseg-model-step1");
        }
        if (this.step2Model) {
            await this.step2Model.save("indexeddb://unet-iseg-model-step2");
        }
        if (this.step3Model) {
            await this.step3Model.save("indexeddb://unet-iseg-model-step3");
        }

        console.log("All models saved to IndexedDB");
    }
}

export default gaussianNormalization;