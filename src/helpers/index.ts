// src/helpers.ts
import { Transform, Readable, TransformCallback } from 'stream';
import { DiscoReadable } from '../disco-readable';

type Callback = (err?: Error | null) => void;

/**
 * fromArray: turn a plain array into a DiscoReadable.
 */
export function fromArray<T>(items: T[]): DiscoReadable<T> {
  return new DiscoReadable<T>({
    generator: async function* () {
      for (const x of items) yield x;
    },
  });
}

/**
 * toArray: drain any Readable into an array.
 */
export async function toArray<T>(stream: Readable): Promise<T[]> {
  const out: T[] = [];
  for await (const x of stream as AsyncIterable<T>) {
    out.push(x);
  }
  return out;
}

/**
 * filter(fn): only pass chunks where fn(chunk) is truthy.
 */
export function filter<T>(
  fn: (chunk: T) => boolean | Promise<boolean>
): Transform {
  return new Transform({
    objectMode: true,
    transform(chunk: T, _enc, cb: Callback) {
      Promise.resolve(fn(chunk))
        .then((keep) => {
          if (keep) this.push(chunk);
          cb();
        })
        .catch((err) => cb(err as Error));
    },
    flush(cb: Callback) {
      console.log("filter flush")
      cb();
    },
  });
}

/**
 * flatMap(fn): map each chunk to 0..N outputs in order.
 */
export function flatMap<I, O>(
  fn: (chunk: I) => Iterable<O> | AsyncIterable<O>
): Transform {
  return new Transform({
    objectMode: true,
    async transform(chunk: I, _enc, cb: Callback) {
      try {
        for await (const y of fn(chunk) as AsyncIterable<O>) {
          this.push(y);
        }
        cb();
      } catch (err) {
        cb(err as Error);
      }
    },
    flush(cb: Callback) {
      console.log("flatMap flush")
      cb();
    },
  });
}

/**
 * reduce(fn, seed): accumulate all chunks, emit final value once.
 */
export function reduce<I, O>(
  fn: (acc: O, chunk: I) => O | Promise<O>,
  seed: O
): Transform {
  let acc = seed;
  return new Transform({
    objectMode: true,
    transform(chunk: I, _enc, cb: Callback) {
      Promise.resolve(fn(acc, chunk))
        .then((next) => {
          acc = next;
          cb();
        })
        .catch((err) => cb(err as Error));
    },
    flush(cb: Callback) {
      console.log("reduce flush")
      this.push(acc as any);
      cb();
    },
  });
}

/**
 * merge(...streams): interleave multiple Readables into one DiscoReadable<T>.
 */
export function merge<T>(
  ...streams: Array<Readable & AsyncIterable<T>>
): DiscoReadable<T> {
  async function* merger() {
    const iters = streams.map((s) => s[Symbol.asyncIterator]());
    const pending = new Map(iters.map((it) => [it, it.next()]));

    while (pending.size) {
      const [it, res] = await Promise.race(
        Array.from(pending.entries()).map(([it, p]) =>
          p.then((r) => [it, r] as const)
        )
      );
      if (res.done) {
        pending.delete(it);
      } else {
        pending.set(it, it.next());
        yield res.value;
      }
    }
  }
  return new DiscoReadable<T>({ generator: merger });
}

/**
 * mapConcurrent(fn, concurrency): (currently serial, preserves order)
 */

export function mapConcurrent<I, O>(
  fn: (chunk: I) => O | Promise<O>,
  concurrency: number
): Transform {
  let idx = 0;                 // assign increasing IDs to incoming chunks
  let nextToEmit = 0;          // next ID we’re allowed to emit
  let active = 0;              // number of in-flight promises
  let ended = false;           // upstream has signaled end
  let flushCb: Callback | null = null;

  const results = new Map<number, O>();
  const queue: Array<{ id: number; chunk: I }> = [];

  const stream = new Transform({
    objectMode: true,

    transform(chunk: I, _enc, cb: TransformCallback) {
      // enqueue the chunk with its index
      queue.push({ id: idx++, chunk });
      processQueue();
      cb();
    },

    flush(cb: Callback) {
      // upstream has ended; save callback for later
      ended = true;
      flushCb = cb;
      checkComplete();
    }
  });

  const processQueue = () => {
    // while we have capacity and work, start new conversions
    while (active < concurrency && queue.length) {
      const { id, chunk } = queue.shift()!;
      active++;
      Promise.resolve(fn(chunk))
        .then((res) => {
          results.set(id, res);
        })
        .catch((err) => {
          stream.destroy(err as Error);
        })
        .finally(() => {
          active--;
          emitAvailable();
          processQueue();
          checkComplete();
        });
    }
  }

  const emitAvailable = () => {
    // emit in-order results as far as we can
    while (results.has(nextToEmit)) {
      const val = results.get(nextToEmit)!;
      results.delete(nextToEmit);
      stream.push(val);
      nextToEmit++;
    }
  }

  const checkComplete = () => {
    // if upstream ended, no active or queued work remains, we can finish
    if (ended && active === 0 && queue.length === 0) {
      emitAvailable();
      if (flushCb) flushCb();
    }
  }

  return stream;
}