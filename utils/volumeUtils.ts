import * as tf from "@tensorflow/tfjs"

/**
 * Gaussian normalization function - matches the Python implementation
 * @param volume Volume tensor to normalize
 * @returns Normalized volume tensor
 */
export function gaussianNormalization(volume: tf.Tensor): tf.Tensor {
  return tf.tidy(() => {
    // Create a mask of non-zero values
    const mask = volume.greater(0)

    // Get non-zero values
    const nonZeroValues = volume.mul(mask.cast("float32"))

    // Calculate mean of non-zero values
    const sum = nonZeroValues.sum()
    const count = mask.sum().cast("float32")

    // Avoid division by zero
    if (count.dataSync()[0] === 0) {
      return volume.clone(); // Return original volume if all values are zero
    }

    const mean = sum.div(count)

    // Calculate squared differences for std of non-zero values
    const squaredDiff = nonZeroValues.sub(mean).square().mul(mask.cast("float32"))
    const variance = squaredDiff.sum().div(count)
    const std = variance.sqrt()

    // Avoid division by zero
    if (std.dataSync()[0] === 0) {
      return volume.sub(mean); // Just center the data if std is zero
    }

    // Normalize: (volume - mean) / (5 * std)
    return volume.sub(mean).div(std.mul(5))
  })
}

/**
 * Filter valid cuts - matches the Python implementation
 * @param volume Volume tensor to filter
 * @returns Object containing count and array of valid cuts
 */
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

/**
 * Format volumes for training - following the Python implementation
 * @param t1Vols Array of T1 volume tensors
 * @param t2Vols Array of T2 volume tensors
 * @param labelVols Array of label volume tensors
 * @returns Object containing training data and count of valid cuts
 */
export function formatVolumesForTraining(
    t1Vols: tf.Tensor[],
    t2Vols: tf.Tensor[],
    labelVols: tf.Tensor[],
): {
  xTrain: tf.Tensor
  yTrain: tf.Tensor
  validCutsCount: number
} {
  return tf.tidy(() => {
    // Count valid cuts first (following Python's filter_vt_cut function)
    let totalValidCuts = 0
    const validCutsPerVolume = []

    for (let i = 0; i < labelVols.length; i++) {
      const labelVol = labelVols[i]
      let validCutsCount = 0

      for (let z = 0; z < labelVol.shape[2]; z++) {
        const isValid = tf.tidy(() => {
          const labelCut = labelVol
              .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
              .reshape([labelVol.shape[0], labelVol.shape[1]])
          const nonZeroCount = labelCut.greater(0).sum().dataSync()[0]
          return nonZeroCount > 100
        })

        if (isValid) {
          validCutsCount++
        }
      }

      totalValidCuts += validCutsCount
      validCutsPerVolume.push(validCutsCount)
    }

    if (totalValidCuts === 0) {
      throw new Error("No valid cuts found!")
    }

    // Create tensors to hold all valid cuts
    const xSlices = []
    const ySlices = []

    for (let i = 0; i < labelVols.length; i++) {
      const t1Vol = t1Vols[i]
      const t2Vol = t2Vols[i]
      const labelVol = labelVols[i]

      for (let z = 0; z < labelVol.shape[2]; z++) {
        const isValid = tf.tidy(() => {
          const labelCut = labelVol
              .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
              .reshape([labelVol.shape[0], labelVol.shape[1]])
          const nonZeroCount = labelCut.greater(0).sum().dataSync()[0]
          return nonZeroCount > 100
        })

        if (isValid) {
          const t1Cut = t1Vol
              .slice([0, 0, z], [t1Vol.shape[0], t1Vol.shape[1], 1])
              .reshape([t1Vol.shape[0], t1Vol.shape[1]])

          const t2Cut = t2Vol
              .slice([0, 0, z], [t2Vol.shape[0], t2Vol.shape[1], 1])
              .reshape([t2Vol.shape[0], t2Vol.shape[1]])

          const labelCut = labelVol
              .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
              .reshape([labelVol.shape[0], labelVol.shape[1]])

          // Stack t1 and t2 for input
          const xSlice = tf.stack([t1Cut, t2Cut], 2)
          xSlices.push(xSlice)
          ySlices.push(labelCut)
        }
      }
    }

    // Stack all slices
    const xTrain = tf.stack(xSlices)
    const yTrain = tf.stack(ySlices)

    return { xTrain, yTrain, validCutsCount: totalValidCuts }
  })
}

/**
 * Format volumes for the second stage of training (cascaded approach)
 * @param t1Vols Array of T1 volume tensors
 * @param t2Vols Array of T2 volume tensors
 * @param labelVols Array of label volume tensors
 * @param firstStageModel First stage model
 * @returns Object containing training data and count of valid cuts
 */
export function formatVolumesForSecondStage(
    t1Vols: tf.Tensor[],
    t2Vols: tf.Tensor[],
    labelVols: tf.Tensor[],
    firstStageModel: tf.LayersModel,
): {
  xTrain: tf.Tensor
  yTrain: tf.Tensor
  validCutsCount: number
} {
  return tf.tidy(() => {
    // Count valid cuts first
    let totalValidCuts = 0
    const validCutsPerVolume = []

    for (let i = 0; i < labelVols.length; i++) {
      const labelVol = labelVols[i]
      let validCutsCount = 0

      for (let z = 0; z < labelVol.shape[2]; z++) {
        const isValid = tf.tidy(() => {
          const labelCut = labelVol
              .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
              .reshape([labelVol.shape[0], labelVol.shape[1]])
          const nonZeroCount = labelCut.greater(0).sum().dataSync()[0]
          return nonZeroCount > 100
        })

        if (isValid) {
          validCutsCount++
        }
      }

      totalValidCuts += validCutsCount
      validCutsPerVolume.push(validCutsCount)
    }

    if (totalValidCuts === 0) {
      throw new Error("No valid cuts found for second stage!")
    }

    // Create tensors to hold all valid cuts
    const xSlices = []
    const ySlices = []

    for (let i = 0; i < labelVols.length; i++) {
      const t1Vol = t1Vols[i]
      const t2Vol = t2Vols[i]
      const labelVol = labelVols[i]

      for (let z = 0; z < labelVol.shape[2]; z++) {
        const isValid = tf.tidy(() => {
          const labelCut = labelVol
              .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
              .reshape([labelVol.shape[0], labelVol.shape[1]])
          const nonZeroCount = labelCut.greater(0).sum().dataSync()[0]
          return nonZeroCount > 100
        })

        if (isValid) {
          // Get first stage prediction
          const firstStagePrediction = tf.tidy(() => {
            const t1Cut = t1Vol
                .slice([0, 0, z], [t1Vol.shape[0], t1Vol.shape[1], 1])
                .reshape([t1Vol.shape[0], t1Vol.shape[1]])

            const t2Cut = t2Vol
                .slice([0, 0, z], [t2Vol.shape[0], t2Vol.shape[1], 1])
                .reshape([t2Vol.shape[0], t2Vol.shape[1]])

            // Stack t1 and t2 for input to first stage model
            const xSlice = tf.stack([t1Cut, t2Cut], 2).expandDims(0)
            const prediction = firstStageModel.predict(xSlice) as tf.Tensor
            return prediction.squeeze().greater(0.5).cast("float32")
          })

          const t1Cut = t1Vol
              .slice([0, 0, z], [t1Vol.shape[0], t1Vol.shape[1], 1])
              .reshape([t1Vol.shape[0], t1Vol.shape[1]])

          const t2Cut = t2Vol
              .slice([0, 0, z], [t2Vol.shape[0], t2Vol.shape[1], 1])
              .reshape([t2Vol.shape[0], t2Vol.shape[1]])

          const labelCut = labelVol
              .slice([0, 0, z], [labelVol.shape[0], labelVol.shape[1], 1])
              .reshape([labelVol.shape[0], labelVol.shape[1]])

          // Stack t1, t2, and first stage prediction for input to second stage
          const xSlice = tf.stack([t1Cut, t2Cut, firstStagePrediction], 2)
          xSlices.push(xSlice)
          ySlices.push(labelCut)
        }
      }
    }

    // Stack all slices
    const xTrain = tf.stack(xSlices)
    const yTrain = tf.stack(ySlices)

    return { xTrain, yTrain, validCutsCount: totalValidCuts }
  })
}

/**
 * Calculate Dice coefficient
 * @param prediction Prediction tensor
 * @param groundTruth Ground truth tensor
 * @returns Dice coefficient
 */
export function calculateDice(prediction: tf.Tensor, groundTruth: tf.Tensor): number {
  return tf.tidy(() => {
    const predictionBinary = prediction.greater(0.5)
    const groundTruthBinary = groundTruth.greater(0)

    const intersection = predictionBinary.logicalAnd(groundTruthBinary).sum()
    const predictionSum = predictionBinary.sum()
    const groundTruthSum = groundTruthBinary.sum()

    // Avoid division by zero
    const denominator = predictionSum.add(groundTruthSum);
    if (denominator.dataSync()[0] === 0) {
      return 1.0; // If both prediction and ground truth are empty, consider it perfect match
    }

    const dice = intersection.mul(2).div(denominator)
    return dice.dataSync()[0]
  })
}

/**
 * Compute median slices for visualization
 * @param volume Volume tensor
 * @returns Object containing axial, coronal, and sagittal slices
 */
export function computeMedianSlices(volume: tf.Tensor): {
  axial: tf.Tensor
  coronal: tf.Tensor
  sagittal: tf.Tensor
} {
  return tf.tidy(() => {
    const axialIdx = Math.floor(volume.shape[2] / 2)
    const coronalIdx = Math.floor(volume.shape[1] / 2)
    const sagittalIdx = Math.floor(volume.shape[0] / 2)

    const axial = volume
        .slice([0, 0, axialIdx], [volume.shape[0], volume.shape[1], 1])
        .reshape([volume.shape[0], volume.shape[1]])

    const coronal = volume
        .slice([0, coronalIdx, 0], [volume.shape[0], 1, volume.shape[2]])
        .reshape([volume.shape[0], volume.shape[2]])

    const sagittal = volume
        .slice([sagittalIdx, 0, 0], [1, volume.shape[1], volume.shape[2]])
        .reshape([volume.shape[1], volume.shape[2]])

    return { axial, coronal, sagittal }
  })
}