/**
 * MPLAD SENTINEL — Phase 8 Pure TypeScript Isolation Forest
 * Unsupervised multidimensional anomaly detection implementing Liu, Ting & Zhou (2008).
 *
 * Algorithm Specifications:
 * - Deterministic Mulberry32 Pseudo-Random Number Generator (PRNG) with seed 26102.
 * - Zero external native or numerical library dependencies.
 * - Subsample size: 128, Number of trees: 100, Score threshold: 0.60.
 * - Average path length correction c(n) with Euler-Mascheroni constant.
 * - Anomaly score formula: s(x, n) = 2^(-E(h(x)) / c(n)).
 */

import type { AnomalySignal, AnomalyEvidence, Severity } from "../types.ts";
import type { FeatureMatrixDataset, FeatureMatrixRow } from "./featureMatrix.ts";
import { ML_CONFIG } from "../config.ts";

/**
 * Deterministic Mulberry32 32-bit PRNG
 */
export function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Average path length of unsuccessful searches in a Binary Search Tree (BST).
 * c(n) = 2 * (ln(n - 1) + 0.5772156649) - (2 * (n - 1) / n)
 */
export function averagePathLengthBST(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  const eulerMascheroni = 0.5772156649;
  return 2 * (Math.log(n - 1) + eulerMascheroni) - (2 * (n - 1)) / n;
}

export interface IsolationNode {
  isLeaf: boolean;
  size: number;
  splitFeatureIndex?: number;
  splitValue?: number;
  left?: IsolationNode;
  right?: IsolationNode;
}

export class IsolationTree {
  public root: IsolationNode;

  constructor(data: number[][], maxDepth: number, rng: () => number) {
    this.root = this.buildTree(data, 0, maxDepth, rng);
  }

  private buildTree(
    data: number[][],
    currentDepth: number,
    maxDepth: number,
    rng: () => number
  ): IsolationNode {
    const n = data.length;

    if (currentDepth >= maxDepth || n <= 1) {
      return { isLeaf: true, size: n };
    }

    const numFeatures = data[0].length;
    // Random feature selection
    const featureIdx = Math.floor(rng() * numFeatures);

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < n; i++) {
      const v = data[i][featureIdx];
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }

    if (minVal === maxVal) {
      return { isLeaf: true, size: n };
    }

    // Random split value between min and max
    const splitVal = minVal + rng() * (maxVal - minVal);

    const leftData: number[][] = [];
    const rightData: number[][] = [];

    for (let i = 0; i < n; i++) {
      if (data[i][featureIdx] < splitVal) {
        leftData.push(data[i]);
      } else {
        rightData.push(data[i]);
      }
    }

    return {
      isLeaf: false,
      size: n,
      splitFeatureIndex: featureIdx,
      splitValue: splitVal,
      left: this.buildTree(leftData, currentDepth + 1, maxDepth, rng),
      right: this.buildTree(rightData, currentDepth + 1, maxDepth, rng),
    };
  }

  public computePathLength(point: number[], node: IsolationNode, currentDepth: number): number {
    if (node.isLeaf) {
      return currentDepth + averagePathLengthBST(node.size);
    }

    const fIdx = node.splitFeatureIndex!;
    const sVal = node.splitValue!;

    if (point[fIdx] < sVal) {
      return this.computePathLength(point, node.left!, currentDepth + 1);
    } else {
      return this.computePathLength(point, node.right!, currentDepth + 1);
    }
  }
}

export class IsolationForest {
  private trees: IsolationTree[] = [];
  private subsampleSize: number;
  private cN: number;

  constructor(
    dataset: number[][],
    nTrees: number = ML_CONFIG.nTrees,
    subsampleSize: number = ML_CONFIG.subsampleSize,
    seed: number = ML_CONFIG.seed
  ) {
    this.subsampleSize = Math.min(dataset.length, subsampleSize);
    this.cN = averagePathLengthBST(this.subsampleSize);
    const rng = createMulberry32(seed);
    const maxDepth = Math.ceil(Math.log2(Math.max(this.subsampleSize, 2)));

    for (let t = 0; t < nTrees; t++) {
      const sample = this.drawSubsample(dataset, this.subsampleSize, rng);
      const tree = new IsolationTree(sample, maxDepth, rng);
      this.trees.push(tree);
    }
  }

  private drawSubsample(dataset: number[][], size: number, rng: () => number): number[][] {
    const indices = Array.from({ length: dataset.length }, (_, i) => i);
    // Fisher-Yates shuffle with seeded rng
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }
    const sampleIndices = indices.slice(0, size);
    return sampleIndices.map((idx) => dataset[idx]);
  }

  /**
   * Computes the ensemble anomaly score for an observation vector.
   * Score is bounded strictly in [0, 1].
   * s(x, n) = 2^(-E(h(x)) / c(n))
   */
  public score(point: number[]): number {
    if (this.trees.length === 0 || this.cN === 0) return 0.5;

    let totalPathLength = 0;
    for (const tree of this.trees) {
      totalPathLength += tree.computePathLength(point, tree.root, 0);
    }

    const avgPathLength = totalPathLength / this.trees.length;
    const exponent = -avgPathLength / this.cN;
    const rawScore = Math.pow(2, exponent);

    // Safeguard bounds to [0, 1]
    return Math.max(0, Math.min(1, Number(rawScore.toFixed(4))));
  }
}

/**
 * Executes Isolation Forest over the feature matrix dataset and generates
 * AnomalySignals for multidimensional outliers exceeding ML_CONFIG.scoreThreshold.
 */
export function runIsolationForestDetection(
  dataset: FeatureMatrixDataset
): Map<string, AnomalySignal[]> {
  const points = dataset.rows.map((r) => r.vector);
  const forest = new IsolationForest(
    points,
    ML_CONFIG.nTrees,
    ML_CONFIG.subsampleSize,
    ML_CONFIG.seed
  );

  const results = new Map<string, AnomalySignal[]>();

  for (const row of dataset.rows) {
    const anomalyScore = forest.score(row.vector);

    if (anomalyScore >= ML_CONFIG.scoreThreshold) {
      const isCritical = anomalyScore >= 0.70;
      const severity: Severity = isCritical ? "CRITICAL" : "HIGH";

      // Find features with high magnitude relative to typical ranges
      const evidence: AnomalyEvidence[] = [
        {
          feature: "isolation_forest.ensemble_score",
          observedValue: anomalyScore,
          referenceValue: ML_CONFIG.scoreThreshold,
          direction: "above_expected",
          explanation: `High multi-dimensional isolation score of ${anomalyScore.toFixed(4)} across ${ML_CONFIG.nTrees} recursive isolation trees.`,
        },
      ];

      const signal: AnomalySignal = {
        projectCode: row.projectCode,
        detectorId: "ML_ISOLATION_FOREST",
        detectorVersion: "1.0.0",
        signalType: "ISOLATION_FOREST_OUTLIER",
        severity,
        score: anomalyScore,
        confidence: `Mulberry32 seeded forest (nTrees=${ML_CONFIG.nTrees}, subSample=${ML_CONFIG.subsampleSize})`,
        evidence,
        affectedFeatures: ["isolation_forest.ensemble_score"],
        explanation: `Multi-dimensional outlier isolated rapidly in feature space (Isolation score: ${anomalyScore.toFixed(4)} >= threshold ${ML_CONFIG.scoreThreshold}). Comprehensive cross-variable audit recommended.`,
        generatedAt: "2026-09-04T00:00:00.000Z",
      };

      results.set(row.projectCode, [signal]);
    }
  }

  return results;
}
