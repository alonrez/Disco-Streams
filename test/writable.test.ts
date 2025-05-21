import '../src/disco-extensions';
import { fromArray } from '../src/helpers';
import { describe, it, expect } from 'vitest';
import { DiscoWritable } from '../src/disco-writable';
import { discoPipeline } from '../src/disco-pipeline';

describe('DiscoWritable', () => {
  it('collects written values', async () => {
    const collected: string[] = [];
    const w = new DiscoWritable<string>({
      write: (s) => {
        collected.push(s);
      },
    });
    await discoPipeline(fromArray(['a', 'b']), w);
    expect(collected).toEqual(['a', 'b']);
  });
});
