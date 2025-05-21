import '../src/disco-extensions';
import { describe, it, expect } from 'vitest';
import {
  fromArray,
  filter,
  flatMap,
  reduce,
  merge,
  mapConcurrent
} from '../src/helpers';

import { discoPipeline } from '../src/disco-pipeline';
import { DiscoWritable } from '../src/disco-writable';

describe('helpers', () => {
  it('filter even numbers', async () => {
    const out: number[] = [];
    await discoPipeline(
      fromArray([1, 2, 3, 4]),
      filter((n: number) => n % 2 === 0),
      new DiscoWritable<number>({ write: (n) => { out.push(n); } })
    );
    expect(out).toEqual([2, 4]);
  });

  it('flatMap strings to chars', async () => {
    const out: string[] = [];
    await discoPipeline(
      fromArray(['ab']),
      flatMap((s: string) => s),               // a string is iterable of its chars
      new DiscoWritable<string>({ write: (c) => { out.push(c); } })
    );
    expect(out).toEqual(['a', 'b']);
  });

  it('reduce sum', async () => {
    const out: number[] = [];
    await discoPipeline(
      fromArray([1, 2, 3]),
      reduce((acc: any, n: number) => acc + n, 0),
      new DiscoWritable<number>({ write: (v) => { out.push(v); } })
    );
    expect(out).toEqual([6]);
  });

  it('merge streams', async () => {
    const out: number[] = [];
    const a = fromArray([1, 2]);
    const b = fromArray([3, 4]);
    // merge returns a DiscoReadable
    await discoPipeline(
      merge(a, b),
      new DiscoWritable<number>({ write: (v) => { out.push(v); } })
    );
    // order may interleave, so sort before asserting
    expect(out.sort()).toEqual([1, 2, 3, 4]);
  });

  it('mapConcurrent respects order', async () => {
    const out: number[] = [];
    await discoPipeline(
      fromArray([3, 1, 2]),
      mapConcurrent(async (n: number) => n * 2, 2),
      new DiscoWritable<number>({ write: (v) => { out.push(v); } })
    );
    expect(out).toEqual([6, 2, 4]);
  });
});
