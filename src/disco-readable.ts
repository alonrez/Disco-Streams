// src/disco-readable.ts
import { Readable } from 'stream';
import { DiscoReadableOptions } from './types';

export class DiscoReadable<T> extends Readable {
  private _genFactory: () => AsyncIterable<T>;

  constructor(options: DiscoReadableOptions<T>) {
    // pull out our custom prop, leave only real ReadableOptions
    const { generator, ...readableOpts } = options;
    super({ objectMode: true, ...readableOpts });

    this._genFactory =
      typeof generator === 'function'
        ? (generator as () => AsyncIterable<T>)
        : () => generator;

    this._pump().catch((err) => this.destroy(err as Error));
  }

  private async _pump() {
    try {
      for await (const item of this._genFactory()) {
        if (!this.push(item)) break;
      }
    } catch (err) {
      this.destroy(err as Error);
      return;
    }
    this.push(null);
  }

  override _read(): void {
    // no-op
  }
}
