import { describe, it, expect } from 'vitest';
import { DiscoReadable } from '../src/disco-readable';

describe('DiscoReadable', () => {
  it('emits values from an async generator', async () => {
    const src = new DiscoReadable<number>({
      generator: async function* () {
        yield 1; yield 2; yield 3;
      }
    });
    const out: number[] = [];
    for await (const n of src) out.push(n);
    expect(out).toEqual([1,2,3]);
  });
});
