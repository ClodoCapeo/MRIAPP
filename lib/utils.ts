import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import * as tf from "@tensorflow/tfjs"

/**
 * Utility function to create a simulated segmentation for visualization purposes
 * @param baseVolume The base volume to use for dimensions
 * @param step The current step in the cascaded U-Net (1, 2, or 3)
 * @returns A simulated segmentation volume
 */
export function createSimulatedSegmentation(baseVolume: any, step: number): any {
  if (!baseVolume) return null

  // Create a simulated segmentation result
  const segVolume = {
    header: { ...baseVolume.header },
    data: new Float32Array(baseVolume.data.length),
    min: 0,
    max: step === 3 ? 3 : 1, // Binary for steps 1-2, multi-class for step 3
  }

  // Fill with simulated segmentation data
  for (let i = 0; i < segVolume.data.length; i++) {
    // Create a simple pattern based on position
    const x = i % baseVolume.header.dimensions[0]
    const y = Math.floor(i / baseVolume.header.dimensions[0]) % baseVolume.header.dimensions[1]
    const z = Math.floor(i / (baseVolume.header.dimensions[0] * baseVolume.header.dimensions[1]))

    // Create a sphere-like pattern
    const centerX = baseVolume.header.dimensions[0] / 2
    const centerY = baseVolume.header.dimensions[1] / 2
    const centerZ = baseVolume.header.dimensions[2] / 2

    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2) + Math.pow(z - centerZ, 2))

    if (step === 1) {
      // Binary brain segmentation
      segVolume.data[i] = distance < 40 ? 1 : 0
    } else if (step === 2) {
      // White matter segmentation
      segVolume.data[i] = distance < 20 ? 1 : 0
    } else {
      // Multi-class segmentation
      if (distance < 20) {
        segVolume.data[i] = 3 // White matter
      } else if (distance < 30) {
        segVolume.data[i] = 2 // Gray matter
      } else if (distance < 40) {
        segVolume.data[i] = 1 // CSF
      } else {
        segVolume.data[i] = 0 // Background
      }
    }
  }

  return segVolume
}

/**
 * Utility function to process ground truth with different thresholds
 * @param volume The ground truth volume
 * @param threshold The threshold to apply (default: 10)
 * @returns A processed ground truth volume
 */
export function processGroundTruth(volume: any, threshold = 10): any {
  if (!volume) return null

  const processedVolume = {
    header: { ...volume.header },
    data: new Float32Array(volume.data.length),
    min: 0,
    max: 1,
  }

  for (let i = 0; i < volume.data.length; i++) {
    processedVolume.data[i] = volume.data[i] > threshold ? 1 : 0
  }

  return processedVolume
}

/**
 * Utility function to convert a volume to a tensor
 * @param volume The volume to convert
 * @returns A tensor representation of the volume
 */
export function volumeToTensor(volume: any): tf.Tensor3D {
  const { dimensions } = volume.header
  const [width, height, depth] = dimensions

  // Create a new tensor with the volume data
  const tensor = tf.tensor3d(Array.from(volume.data), [width, height, depth])

  // Normalize to [0, 1]
  const normalized = tf.div(tf.sub(tensor, tf.scalar(volume.min)), tf.scalar(volume.max - volume.min))

  return normalized
}

/**
 * Utility function to convert a tensor to a volume
 * @param tensor The tensor to convert
 * @param headerTemplate The header template to use
 * @returns A volume representation of the tensor
 */
export function tensorToVolume(tensor: tf.Tensor, headerTemplate: any): any {
  // Get tensor data
  const data = tensor.dataSync()

  // Create a new volume with the tensor data
  return {
    header: { ...headerTemplate.header },
    data: Float32Array.from(data),
    min: 0,
    max: tensor.max().dataSync()[0],
  }
}

/**
 * Utility function to get a description of a volume
 * @param volume The volume to describe
 * @returns A string description of the volume
 */
export function getVolumeDescription(volume: any): string {
  const hasT1 = !!volume.t1
  const hasT2 = !!volume.t2
  const hasGT = !!volume.groundTruth

  const description = []
  if (hasT1) description.push("T1")
  if (hasT2) description.push("T2")
  if (hasGT) description.push("Ground Truth")

  if (volume.t1 && volume.t1.header && volume.t1.header.dimensions) {
    const dims = volume.t1.header.dimensions
    description.push(`(${dims[0]}×${dims[1]}×${dims[2]})`)
  }

  return description.join(" + ")
}

/**
 * Utility function to check if we're running in a browser environment
 * @returns True if running in a browser, false otherwise
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

/**
 * Utility function to safely access localStorage
 * @param key The key to access
 * @param defaultValue The default value to return if the key doesn't exist
 * @returns The value from localStorage or the default value
 */
export function getLocalStorage(key: string, defaultValue: any): any {
  if (!isBrowser()) return defaultValue

  try {
    const value = localStorage.getItem(key)
    return value !== null ? JSON.parse(value) : defaultValue
  } catch (error) {
    console.error(`Error accessing localStorage for key ${key}:`, error)
    return defaultValue
  }
}

/**
 * Utility function to safely set localStorage
 * @param key The key to set
 * @param value The value to set
 */
export function setLocalStorage(key: string, value: any): void {
  if (!isBrowser()) return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting localStorage for key ${key}:`, error)
  }
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add these functions to the utils.ts file

/**
 * Gaussian normalization function matching the Python implementation
 * @param volume The volume tensor to normalize
 * @returns A normalized volume tensor
 */
export function gaussianNormalization(volume: tf.Tensor): tf.Tensor {
  return tf.tidy(() => {
    // Create a mask of non-zero values
    const mask = volume.greater(0)

    // Get non-zero values
    const nonZeroValues = volume.mul(mask.cast("float32"))

    // Calculate mean and std of non-zero values
    const mean = nonZeroValues.sum().div(mask.sum().cast("float32"))

    // Calculate squared differences for std
    const squaredDiff = nonZeroValues.sub(mean).square().mul(mask.cast("float32"))
    const variance = squaredDiff.sum().div(mask.sum().cast("float32"))
    const std = variance.sqrt()

    // Normalize: (volume - mean) / (5 * std)
    return volume.sub(mean).div(std.mul(5))
  })
}

/**
 * Filter valid cuts from a volume (cuts with more than 100 non-zero pixels)
 * @param volume The volume to filter
 * @returns An array of valid cuts
 */
export function filterValidCuts(volume: tf.Tensor3D): tf.Tensor2D[] {
  const validCuts: tf.Tensor2D[] = []
  const zSize = volume.shape[2]

  for (let i = 0; i < zSize; i++) {
    const cut = volume
        .slice([0, 0, i], [volume.shape[0], volume.shape[1], 1])
        .reshape([volume.shape[0], volume.shape[1]])
    const nonZeroCount = cut.greater(0).sum().dataSync()[0]

    if (nonZeroCount > 100) {
      validCuts.push(cut)
    }
  }

  return validCuts
}

/**
 * Format volumes for training
 * @param t1Volumes Array of T1 volumes
 * @param t2Volumes Array of T2 volumes
 * @param labelVolumes Array of ground truth volumes
 * @returns Formatted data for training
 */
export function formatVolumesForTraining(
    t1Volumes: tf.Tensor3D[],
    t2Volumes: tf.Tensor3D[],
    labelVolumes: tf.Tensor3D[],
): { xs: tf.Tensor4D; ys: tf.Tensor4D } {
  // Count total number of valid cuts
  let totalCuts = 0
  const validCutsPerVolume: tf.Tensor2D[][] = []

  for (let i = 0; i < labelVolumes.length; i++) {
    const validCuts = filterValidCuts(labelVolumes[i])
    validCutsPerVolume.push(validCuts)
    totalCuts += validCuts.length
  }

  // Create tensors for training data
  const xs = tf.zeros([totalCuts, t1Volumes[0].shape[0], t1Volumes[0].shape[1], 2])
  const ys = tf.zeros([totalCuts, t1Volumes[0].shape[0], t1Volumes[0].shape[1], 1])

  // Fill tensors with data
  let cutIndex = 0
  for (let i = 0; i < t1Volumes.length; i++) {
    const t1Vol = t1Volumes[i]
    const t2Vol = t2Volumes[i]
    const labelVol = labelVolumes[i]

    for (let z = 0; z < t1Vol.shape[2]; z++) {
      // Check if this cut is valid
      const labelCut = labelVol
          .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
          .reshape([labelVol.shape[0], labelVol.shape[1]])
      const nonZeroCount = labelCut.greater(0).sum().dataSync()[0]

      if (nonZeroCount > 100) {
        // Extract slices
        const t1Slice = t1Vol
            .slice([0, 0, z], [t1Vol.shape[0], t1Vol.shape[1], 1])
            .reshape([t1Vol.shape[0], t1Vol.shape[1]])
        const t2Slice = t2Vol
            .slice([0, 0, z], [t2Vol.shape[0], t2Vol.shape[1], 1])
            .reshape([t2Vol.shape[0], t2Vol.shape[1]])

        // Normalize slices
        const t1SliceNorm = gaussianNormalization(t1Slice)
        const t2SliceNorm = gaussianNormalization(t2Slice)

        // Add to training data
        xs.slice([cutIndex, 0, 0, 0], [1, t1Vol.shape[0], t1Vol.shape[1], 1]).assign(
            t1SliceNorm.expandDims(0).expandDims(3),
        )
        xs.slice([cutIndex, 0, 0, 1], [1, t1Vol.shape[0], t1Vol.shape[1], 1]).assign(
            t2SliceNorm.expandDims(0).expandDims(3),
        )
        ys.slice([cutIndex, 0, 0, 0], [1, t1Vol.shape[0], t1Vol.shape[1], 1]).assign(
            labelCut.expandDims(0).expandDims(3),
        )

        cutIndex++
      }
    }
  }

  return { xs, ys }
}

/**
 * Format volumes for step 2 training (including step 1 predictions)
 * @param t1Volumes Array of T1 volumes
 * @param t2Volumes Array of T2 volumes
 * @param labelVolumes Array of ground truth volumes
 * @param step1Model The step 1 model
 * @returns Formatted data for step 2 training
 */
export async function formatVolumesForStep2Training(
    t1Volumes: tf.Tensor3D[],
    t2Volumes: tf.Tensor3D[],
    labelVolumes: tf.Tensor3D[],
    step1Model: tf.LayersModel,
): Promise<{ xs: tf.Tensor4D; ys: tf.Tensor4D }> {
  // Count total number of valid cuts
  let totalCuts = 0
  const validCutsPerVolume: tf.Tensor2D[][] = []

  for (let i = 0; i < labelVolumes.length; i++) {
    const validCuts = filterValidCuts(labelVolumes[i])
    validCutsPerVolume.push(validCuts)
    totalCuts += validCuts.length
  }

  // Create tensors for training data
  const xs = tf.zeros([totalCuts, t1Volumes[0].shape[0], t1Volumes[0].shape[1], 3])
  const ys = tf.zeros([totalCuts, t1Volumes[0].shape[0], t1Volumes[0].shape[1], 1])

  // Fill tensors with data
  let cutIndex = 0
  for (let i = 0; i < t1Volumes.length; i++) {
    const t1Vol = t1Volumes[i]
    const t2Vol = t2Volumes[i]
    const labelVol = labelVolumes[i]

    for (let z = 0; z < t1Vol.shape[2]; z++) {
      // Check if this cut is valid
      const labelCut = labelVol
          .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
          .reshape([labelVol.shape[0], labelVol.shape[1]])
      const nonZeroCount = labelCut.greater(0).sum().dataSync()[0]

      if (nonZeroCount > 100) {
        // Extract slices
        const t1Slice = t1Vol
            .slice([0, 0, z], [t1Vol.shape[0], t1Vol.shape[1], 1])
            .reshape([t1Vol.shape[0], t1Vol.shape[1]])
        const t2Slice = t2Vol
            .slice([0, 0, z], [t2Vol.shape[0], t2Vol.shape[1], 1])
            .reshape([t2Vol.shape[0], t2Vol.shape[1]])

        // Normalize slices
        const t1SliceNorm = gaussianNormalization(t1Slice)
        const t2SliceNorm = gaussianNormalization(t2Slice)

        // Get step 1 prediction
        const step1Input = tf.stack([t1SliceNorm, t2SliceNorm], 2).expandDims(0)
        const step1Prediction = step1Model.predict(step1Input) as tf.Tensor4D
        const step1Binary = step1Prediction.greater(0.5).toFloat().squeeze([0, 3])

        // Add to training data
        xs.slice([cutIndex, 0, 0, 0], [1, t1Vol.shape[0], t1Vol.shape[1], 1]).assign(
            t1SliceNorm.expandDims(0).expandDims(3),
        )
        xs.slice([cutIndex, 0, 0, 1], [1, t1Vol.shape[0], t1Vol.shape[1], 1]).assign(
            t2SliceNorm.expandDims(0).expandDims(3),
        )
        xs.slice([cutIndex, 0, 0, 2], [1, t1Vol.shape[0], t1Vol.shape[1], 1]).assign(
            step1Binary.expandDims(0).expandDims(3),
        )

        // For step 2, we threshold the ground truth at 10 (white matter)
        const thresholdedLabel = labelCut.greater(10).toFloat()
        ys.slice([cutIndex, 0, 0, 0], [1, t1Vol.shape[0], t1Vol.shape[1], 1]).assign(
            thresholdedLabel.expandDims(0).expandDims(3),
        )

        cutIndex++
      }
    }
  }

  return { xs, ys }
}
