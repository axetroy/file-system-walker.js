import fs from "fs";
import path from "path";
import { promisify } from "util";

const deepSymbol = Symbol("[[Deep]]");
const readlink = promisify(fs.readlink)
const lstat = promisify(fs.lstat)
const readdir = promisify(fs.readdir)

export interface FileSystemWalkerEntity {
  /**
   * The file path of walk entity
   */
  filepath: string;
  /**
   * The file status of walk entity
   */
  stats: fs.Stats;
  /**
   * The deep of the traverse. The root is zero
   */
  deep: number;
}

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
  /**
   * Whether follow the Symlinks
   * @default false
   */
  followSymlinks?: boolean;
}

/**
 * Traverse into file system
 * @example
 *
 * Walk file system synchronously
 *
 * ```ts
 * const walker = FileSystemWalker('/path/to/folder')
 * for (const entity of walker) {
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
  #options: FileSystemWalkerOptions;

  private [deepSymbol] = 0;

  constructor(filepath: string, options: FileSystemWalkerOptions = {}) {
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

  #isOverflowMaxDeep() {
    if (typeof this.#options.maxDeep === "number") {
      return this[deepSymbol] >= this.#options.maxDeep;
    }

    return false;
  }

  async #readlink(linkPath: string): Promise<string> {
    const p = await readlink(linkPath);

    if (path.isAbsolute(p)) {
      return p;
    } else {
      return path.resolve(p);
    }
  }

  #readlinkSync(linkPath: string): string {
    const p = fs.readlinkSync(linkPath);

    if (path.isAbsolute(p)) {
      return p;
    } else {
      return path.resolve(p);
    }
  }

  /**
   * Get the next level walker
   * @param filename
   * @param dir
   * @returns
   */
  #next(filename: string, dir: string): FileSystemWalker {
    const nextWalker = new FileSystemWalker(
      path.join(dir, filename),
      this.#options
    );

    nextWalker[deepSymbol] = this[deepSymbol] + 1;

    return nextWalker;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<FileSystemWalkerEntity> {
    let dir = this.#filepath;
    const { followSymlinks } = this.#options;

    const folderStat = await lstat(dir);

    if (this.#isExclude(dir, folderStat)) {
      return;
    }

    yield { filepath: dir, stats: folderStat, deep: this[deepSymbol] };

    if (this.#isOverflowMaxDeep()) {
      return;
    }

    dir =
      followSymlinks && folderStat.isSymbolicLink()
        ? await this.#readlink(dir)
        : dir;

    const dirs = await readdir(dir);

    for (let fileName of dirs) {
      let filepath = path.resolve(dir, fileName);
      let fileStats = await lstat(filepath);

      if (this.#isExclude(filepath, fileStats)) {
        continue;
      }

      if (followSymlinks && fileStats.isSymbolicLink()) {
        const originFilePath = filepath;
        const originFileStats = fileStats;

        filepath = await this.#readlink(filepath);
        fileStats = await lstat(filepath);
        fileName = path.basename(filepath);

        yield {
          filepath: originFilePath,
          stats: originFileStats,
          deep: this[deepSymbol] + 1,
        };
      }

      if (fileStats.isDirectory()) {
        for await (const item of this.#next(fileName, path.dirname(filepath))) {
          yield item;
        }
      } else {
        yield {
          filepath: filepath,
          stats: fileStats,
          deep: this[deepSymbol] + 1,
        };
      }
    }
  }

  *[Symbol.iterator](): Generator<FileSystemWalkerEntity> {
    let dir = this.#filepath;
    const { followSymlinks } = this.#options;

    const stat = fs.lstatSync;

    const folderStat = stat(dir);

    if (this.#isExclude(dir, folderStat)) {
      return;
    }

    yield { filepath: dir, stats: folderStat, deep: this[deepSymbol] };

    if (this.#isOverflowMaxDeep()) {
      return;
    }

    dir =
      followSymlinks && folderStat.isSymbolicLink()
        ? this.#readlinkSync(dir)
        : dir;

    const dirs = fs.readdirSync(dir);

    for (let fileName of dirs) {
      let filepath = path.resolve(dir, fileName);
      let fileStats = stat(filepath);

      if (this.#isExclude(filepath, fileStats)) {
        continue;
      }

      if (followSymlinks && fileStats.isSymbolicLink()) {
        const originFilePath = filepath;
        const originFileStats = fileStats;

        filepath = this.#readlinkSync(filepath);
        fileStats = stat(filepath);
        fileName = path.basename(filepath);

        yield {
          filepath: originFilePath,
          stats: originFileStats,
          deep: this[deepSymbol] + 1,
        };
      }

      if (fileStats.isDirectory()) {
        for (const item of this.#next(fileName, path.dirname(filepath))) {
          yield item;
        }
      } else {
        yield {
          filepath: filepath,
          stats: fileStats,
          deep: this[deepSymbol] + 1,
        };
      }
    }
  }
}
