# file-system-walker

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=18.7-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/file-system-walker.svg)](https://badge.fury.io/js/file-system-walker)

A modern file system walker lib for Nodejs.

## Installation

```bash
npm install file-system-walker --save
```

## Usage

```javascript
import { FileSystemWalker } from "file-system-walker";

const walker = new FileSystemWalker("/path/to/folder");

// walk file system asynchronously (Recommend)
for await (const entity of walker) {
  console.log(entity.filepath, entity.stats);

  // breakable for walker
  if (/node_modules/.test(entity.filepath)) {
    break;
  }
}

// walk file system synchronously (Not recommend)
for (const entity of walker) {
  console.log(entity.filepath, entity.stats);

  // breakable for walker
  if (/node_modules/.test(entity.filepath)) {
    break;
  }
}
```

### API

#### new FileSystemWalker(filepath, \[options\])

Generate a traversable object which can use with `for ... of` and `for await ... of`

Options:

```ts
export interface FileSystemWalkerOptions {
  /**
   * Define the exclude when walk in
   * @default undefined
   */
  exclude?: RegExp | ((filepath: string, stat: fs.Stats) => boolean);
  /**
   * only travel to max depth.
   * @example `maxDeep=0 mean emit root dir only`
   * @example `maxDeep=1 mean emit the file/folder of root`
   * @default undefined
   */
  maxDeep?: number;
}
```

## License

The [Anti 996 License](LICENSE)
