/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 *
 * Guarantees 100% reproducible synthetic dataset generation.
 * Running with the same seed produces identical sequences on any platform.
 */

export class DeterministicPRNG {
  private state: number;

  constructor(seed: number = 26102) {
    this.state = seed >>> 0;
  }

  /**
   * Generates a floating point number in [0, 1)
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates an integer in [min, max] inclusive
   */
  public nextInt(min: number, max: number): number {
    const r = this.next();
    return Math.floor(r * (max - min + 1)) + min;
  }

  /**
   * Selects a single random item from an array
   */
  public choice<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot choose from an empty array.");
    }
    const idx = this.nextInt(0, array.length - 1);
    return array[idx];
  }

  /**
   * Generates an integer rounded to a specified step/multiple (e.g. 50000)
   */
  public nextStep(min: number, max: number, step: number = 50000): number {
    const raw = this.nextInt(min, max);
    return Math.round(raw / step) * step;
  }

  /**
   * Deterministically shuffles an array in place (Fisher-Yates)
   */
  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
