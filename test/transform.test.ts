import '../src/disco-extensions';
import { fromArray } from '../src/helpers';
import { describe, it, expect } from 'vitest';
import { DiscoTransform } from '../src/disco-transform';
import { discoPipeline } from '../src/disco-pipeline';
import { DiscoWritable } from '../src/disco-writable';

describe('DiscoTransform', () => {
  it('maps chunks asynchronously', async () => {
    const out: string[] = [];
    const t = new DiscoTransform<number, string>({
      transform: (n) => `#${n}`,
    });

    await discoPipeline(
      fromArray([1, 2, 3]),
      t,
      new DiscoWritable<string>({ write: (s) => void out.push(s) })
    );

    expect(out).toEqual(['#1', '#2', '#3']);
  });
});
