// src/disco-writable.ts
import { Writable, WritableOptions } from 'stream';
import { DiscoWritableOptions } from './types';

type CB = (error?: Error | null) => void;

export class DiscoWritable<T> extends Writable {
  private _writeFn: (chunk: T) => Promise<void> | void;
  private _finalFn?: () => Promise<void> | void;

  constructor(options: DiscoWritableOptions<T>) {
    // strip our custom props before super
    const { write, final, ...streamOpts } = options;
    super({ objectMode: true, ...streamOpts as WritableOptions });

    if (typeof write !== 'function') {
      throw new Error('`write` function is required');
    }
    this._writeFn = write;
    this._finalFn = final;
  }

  override async _write(chunk: T, _enc: BufferEncoding, cb: CB) {
    try {
      await this._writeFn(chunk);
      cb();
    } catch (err) {
      cb(err as Error);
    }
  }

  override async _final(cb: CB) {
    if (this._finalFn) {
      try {
        await this._finalFn();
        cb();
      } catch (err) {
        cb(err as Error);
      }
    } else {
      cb();
    }
  }
}
