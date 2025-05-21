// src/disco-pipeline.ts
import { pipeline } from 'stream/promises';

/**
 * A Promise-based pipeline for Node.js streams.
 * Resolves when the last stream finishes, rejects on first error.
 */
export const discoPipeline = pipeline;
