// src/disco-transform.ts
import { Transform, TransformCallback, TransformOptions } from 'stream';
import { DiscoTransformOptions } from './types';

export class DiscoTransform<I = any, O = I> extends Transform {
  private _transformFn: (chunk: I) => Promise<O> | O;
  private _flushFn?: () => Promise<void> | void;

  constructor(options: DiscoTransformOptions<I, O>) {
    // strip our custom props before super
    const { transform, flush, ...streamOpts } = options;
    super({ objectMode: true, autoDestroy: true, ...streamOpts as TransformOptions });

    this._transformFn = transform;
    this._flushFn = flush;
  }

  override async _transform(chunk: I, _enc: BufferEncoding, cb: TransformCallback) {
    try {
      const result = await this._transformFn(chunk);
      this.push(result);
      cb();
    } catch (err) {
      cb(err as Error);
    }
  }

  override async _flush(cb: TransformCallback) {
    if (this._flushFn) {
      try {
        await this._flushFn();
        cb();
      } catch (err) {
        cb(err as Error);
      }
    } else {
      cb();
    }
  }
}
