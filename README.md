# file-system-walker

![License](https://img.shields.io/badge/license-MIT-green.svg)
[![Prettier](https://img.shields.io/badge/Code%20Style-Prettier-green.svg)](https://github.com/prettier/prettier)
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

// walk file system synchronously (Not recommend)
for (const entity of walker) {
  console.log(walker.filepath, walker.stats);
}

// walk file system synchronously (recommend)
for await (const entity of walker) {
  console.log(walker.filepath, walker.stats);
}
```

## License

The [MIT License](LICENSE)
