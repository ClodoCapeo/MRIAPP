import * as tf from "@tensorflow/tfjs"

// Gaussian normalization function - matches the Python implementation
export function gaussianNormalization(volume: tf.Tensor): tf.Tensor {
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

// Filter valid cuts - matches the Python implementation
export function filterValidCuts(volume: tf.Tensor): { count: number; cuts: tf.Tensor[] } {
  const validCuts: tf.Tensor[] = []
  let count = 0

  for (let z = 0; z < volume.shape[2]; z++) {
    const cut = tf.tidy(() => {
      return volume.slice([0, 0, z], [volume.shape[0], volume.shape[1], 1]).reshape([volume.shape[0], volume.shape[1]])
    })

    const nonZeroCount = tf.tidy(() => {
      return cut.greater(0).sum().dataSync()[0]
    })

    if (nonZeroCount > 100) {
      validCuts.push(cut)
      count++
    } else {
      cut.dispose()
    }
  }

  return { count, cuts: validCuts }
}

// Normalize volumes using Gaussian normalization
export function normalizeVolumes(volumes: tf.Tensor[]): tf.Tensor[] {
  console.log("Normalizing volumes...")

  const normalizedVolumes: tf.Tensor[] = []
  for (let i = 0; i < volumes.length; i++) {
    const normalizedVolume = gaussianNormalization(volumes[i])
    normalizedVolumes.push(normalizedVolume)
    console.log(`Normalized volume ${i + 1}`)
  }

  return normalizedVolumes
}

// Calculate Dice coefficient
export function calculateDice(prediction: tf.Tensor, groundTruth: tf.Tensor): number {
  return tf.tidy(() => {
    const predictionBinary = prediction.greater(0.5)
    const groundTruthBinary = groundTruth.greater(0)

    const intersection = predictionBinary.logicalAnd(groundTruthBinary).sum()
    const predictionSum = predictionBinary.sum()
    const groundTruthSum = groundTruthBinary.sum()

    const dice = intersection.mul(2).div(predictionSum.add(groundTruthSum))
    return dice.dataSync()[0]
  })
}
