# ✨ disco-streams

A batteries-included, TypeScript-first wrapper around Node.js streams.  
Solves common pain points—error handling, backpressure, lifecycle, async/await—and adds ergonomic helpers and fluent chaining.

## 🚀 Features

- **Typed** `DiscoReadable<T>`, `DiscoTransform<I, O>`, `DiscoWritable<T>`  
- **Promise-based** `discoPipeline(...)` for safe chaining  
- **Fluent** `.pipeThrough()` on any `Readable`/`Duplex`  
- Helpers: `fromArray`, `toArray`, `map`, `filter`, `flatMap`, `reduce`, `merge`, `mapConcurrent`

## 💿 Installation

```bash
npm install disco-streams
# or
yarn add disco-streams
```


## 🏁 Quick Start
``` ts
import 'disco-streams/disco-extensions'  // runtime patch for pipeThrough()
import { fromArray, map, toArray } from 'disco-streams/helpers'
import { DiscoTransform } from 'disco-streams/disco-transform'

// Double each number, collect into an array
const doubled = fromArray([1,2,3])
  .pipeThrough(new DiscoTransform({ transform: n => n * 2 }))

console.log(await toArray<number>(doubled))  
// → [2,4,6]
```

## 📚 API

### DiscoReadable<T>
| Option          | Type                                         | Description                                                                 |
| --------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| `generator`     | `AsyncIterable<T> \| () => AsyncIterable<T>` | Source of chunks. Can be an async generator or a factory returning one.     |
| *other options* | `ReadableOptions`                            | Any standard Node.js `Readable` options (e.g. `highWaterMark`, `encoding`). |

``` ts
new DiscoReadable<T>({ 
  generator: AsyncIterable<T> | (() => AsyncIterable<T>), 
  /* any ReadableOptions */ 

** Backed by any AsyncIterable<T>

** Respects backpressure automatically
})
```
--------------------------------------------------------------------------

### DiscoTransform<I, O>
| Option          | Type                                      | Description                                                        |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `transform`     | `(chunk: I) => O \| Promise<O>`           | Synchronous or asynchronous mapping function for each input chunk. |
| `flush?`        | `() => void \| Promise<void>`             | Optional finalizer called once when upstream ends.                 |
| *other options* | `TransformOptions` (e.g. `highWaterMark`) | Standard transform options.                                        |

``` ts
new DiscoTransform<I,O>({
  transform: (chunk: I) => O | Promise<O>,
  flush?: () => void | Promise<void>,
  /* inherits TransformOptions */
})

** Async/await friendly
** Automatic error propagation
```
-------------------------------------------------------------------------------

### DiscoWritable<T>
| Option          | Type                                  | Description                                       |
| --------------- | ------------------------------------- | ------------------------------------------------- |
| `write`         | `(chunk: T) => void \| Promise<void>` | Called for each chunk written to the stream.      |
| `final?`        | `() => void \| Promise<void>`         | Optional hook invoked when upstream ends.         |
| *other options* | `WritableOptions`                     | Standard writable options (e.g. `highWaterMark`). |

``` ts
new DiscoWritable<T>({
  write: (chunk: T) => void | Promise<void>,
  final?: () => void | Promise<void>,
  /* inherits WritableOptions */
})

** Type-safe writes
** Optional final shutdown hook
```
----------------------------------------------------------------------------------

### discoPipeline(...)
``` ts
import { discoPipeline } from 'disco-streams/disco-pipeline'

await discoPipeline(
  source: Readable,
  ...transforms: (Duplex|Transform)[],
  dest: Writable
)

** Returns a Promise<void>
** All errors are caught and propagated
```

### .pipeThrough() extension
``` ts
readable
  .pipeThrough(transform1)
  .pipeThrough(transform2)
  .pipe(writable)

** Fluent alternative to readable.pipe(transform).pipe(…)
```

### Helpers
| Helper                      | Signature                                                              | Description                                                   |
| --------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| `fromArray<T>(a)`           | `(items: T[]) => DiscoReadable<T>`                                     | Create a readable stream from an array.                       |
| `toArray<T>(s)`             | `(stream: Readable) => Promise<T[]>`                                   | Drain a stream into an array.                                 |
| `map<I,O>(fn)`              | `(fn: (I)→O\|Promise<O>) => DiscoTransform<I,O>`                       | Map each chunk through `fn`.                                  |
| `filter<T>(fn)`             | `(fn: (T)→boolean\|Promise<boolean>) => Transform`                     | Only pass through chunks where `fn(chunk)` is truthy.         |
| `flatMap<I,O>(fn)`          | `(fn: (I)→Iterable<O>\|AsyncIterable<O>) => Transform`                 | Expand each chunk into zero or more output items.             |
| `reduce<I,O>(fn, seed)`     | `(fn: (O,I)→O\|Promise<O>, seed: O) => Transform`                      | Consume and accumulate all chunks, emitting final value once. |
| `merge<T>(...ss)`           | `(...streams: Array<Readable & AsyncIterable<T>>) => DiscoReadable<T>` | Interleave multiple sources.                                  |
| `mapConcurrent<I,O>(fn, c)` | `(fn: (I)→O\|Promise<O>, concurrency: number) => Transform`            | Parallelize up to `c` transforms, preserving order.           |

``` ts
import {
  fromArray, toArray,
  map, filter, flatMap,
  reduce, merge, mapConcurrent
} from 'disco-streams/helpers'

** fromArray<T>(items: T[]) → DiscoReadable<T>

** toArray<T>(stream: Readable) → Promise<T[]>

** map(fn), filter(fn), flatMap(fn), reduce(fn, seed)

** merge(...streams) interleaves multiple sources

** mapConcurrent(fn, concurrency) runs up to N transforms in parallel
```


## 🛠️ Recommended TS Setup
``` json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020"],
    "types": ["node"],
    "strict": true,
    "skipLibCheck": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true
  },
  "include": ["src", "test"]
}
```

## 📄 License
MIT © 2025 Alon Reznik

## Happy streaming! 🚀

