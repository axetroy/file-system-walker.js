import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

export interface FileSystemWalkerEntity {
  /**
   * The file path of walk entity
   */
  filepath: string;
  /**
   * The file status of walk entity
   */
  stats: fs.Stats;
}

export interface FileSystemWalkerOptions {
  /**
   * Define the exclude when walk in
   */
  exclude?: RegExp | ((filepath: string, stat: fs.Stats) => boolean);
}

/**
 * Traverse into file system
 * @example
 *
 * Walk file system synchronously
 *
 * ```ts
 * const walker = FileSystemWalker('/path/to/folder')
 * for await (const entity of walker) {
 *   console.log(entity.filepath, entity.stats)
 * }
 * ```
 *
 * Walk file system asynchronously
 *
 * ```js
 * const walker = FileSystemWalker('/path/to/folder')
 * for await (const entity of walker) {
 *   console.log(entity.filepath, entity.stats)
 * }
 * ```
 */
export class FileSystemWalker {
  #filepath: string;
  #options?: FileSystemWalkerOptions;

  constructor(filepath: string, options?: FileSystemWalkerOptions) {
    this.#filepath = filepath;
    this.#options = options;
  }

  #isExclude(filepath: string, stats: fs.Stats): boolean {
    const options = this.#options;

    if (!options) {
      return false;
    }

    if (options.exclude) {
      if (options.exclude instanceof RegExp) {
        if (options.exclude.test(filepath)) {
          return true;
        }
      } else {
        if (options.exclude(filepath, stats)) {
          return true;
        }
      }
    }

    return false;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<FileSystemWalkerEntity> {
    const dir = this.#filepath;
    const options = this.#options;

    const folderStat = await fsPromises.stat(dir);

    if (this.#isExclude(dir, folderStat)) {
      return;
    }

    yield { filepath: dir, stats: folderStat };

    const dirs = await fsPromises.readdir(dir);

    for (const fileName of dirs) {
      const filepath = path.resolve(dir, fileName);
      const fileStats = await fsPromises.stat(filepath);

      if (this.#isExclude(filepath, fileStats)) {
        continue;
      }

      if (fileStats.isDirectory()) {
        for await (const item of new FileSystemWalker(filepath, options)) {
          yield item;
        }
      } else {
        yield { filepath: filepath, stats: fileStats };
      }
    }
  }

  *[Symbol.iterator](): Generator<FileSystemWalkerEntity> {
    const dir = this.#filepath;
    const options = this.#options;

    const folderStat = fs.statSync(dir);

    if (this.#isExclude(dir, folderStat)) {
      return;
    }

    yield { filepath: dir, stats: folderStat };

    const dirs = fs.readdirSync(dir);

    for (const fileName of dirs) {
      const filepath = path.resolve(dir, fileName);
      const fileStats = fs.statSync(filepath);

      if (this.#isExclude(filepath, fileStats)) {
        continue;
      }

      if (fileStats.isDirectory()) {
        for (const item of new FileSystemWalker(filepath, options)) {
          yield item;
        }
      } else {
        yield { filepath: filepath, stats: fileStats };
      }
    }
  }
}
