import { Readable, Duplex } from 'stream';

// Extend Node.js streams with a fluent pipeThrough() method
declare module 'stream' {
  interface Readable {
    /**
     * Pipe this stream through the provided Transform/Duplex, returning the transform for chaining.
     */
    pipeThrough<T extends Duplex>(transform: T): T;
  }
  interface Duplex {
    /**
     * Pipe this stream through the provided Transform/Duplex, returning the transform for chaining.
     */
    pipeThrough<T extends Duplex>(transform: T): T;
  }
}

/**
 * Implementation of pipeThrough: pipes into the next stream and returns it.
 */
function pipeThrough<T extends Duplex>(this: Readable | Duplex, transform: T): T {
  this.pipe(transform);
  return transform;
}

// Attach to prototypes
(Readable.prototype as any).pipeThrough = pipeThrough;
(Duplex.prototype as any).pipeThrough = pipeThrough;
