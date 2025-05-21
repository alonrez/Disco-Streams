import { TransformOptions, ReadableOptions, WritableOptions } from 'stream';

export interface DiscoTransformOptions<I, O> extends TransformOptions {
  transform: (chunk: I) => Promise<O> | O;
  flush?: () => Promise<void> | void;
}

export interface DiscoReadableOptions<T> extends ReadableOptions {
  /**
   * Source of chunks:  
   * – any AsyncIterable<T> (including generators)  
   * – or a factory returning one  
   */
  generator: AsyncIterable<T> | (() => AsyncIterable<T>);
}


export interface DiscoWritableOptions<T> extends WritableOptions {
  write: (chunk: T) => Promise<void> | void;
  final?: () => Promise<void> | void;
}
