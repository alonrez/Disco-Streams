import { Duplex } from 'stream';

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
