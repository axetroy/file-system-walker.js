import assert from "node:assert";
import test from "node:test";
import path from "node:path";
import url from "node:url";

import { FileSystemWalker } from "../dist/index.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

test("walk synchronously", () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk");

  const walker = new FileSystemWalker(dir);

  const files = [];

  for (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [
    path.join(dir),
    path.join(dir, "01"),
    path.join(dir, "02"),
  ]);
});

test("walk synchronously and breakable", () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and breakable");

  const walker = new FileSystemWalker(dir);

  const files = [];

  for (const entity of walker) {
    files.push(entity.filepath);
    if (/01/.test(entity.filepath)) {
      break;
    }
  }

  assert.deepEqual(files, [path.join(dir), path.join(dir, "01")]);
});

test("walk synchronously and exclude with regexp", () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and exclude");

  const walker = new FileSystemWalker(dir, { exclude: /1/ });

  const files = [];

  for (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [path.join(dir), path.join(dir, "02")]);
});

test("walk synchronously and exclude with function", () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and exclude");

  const walker = new FileSystemWalker(dir, {
    exclude: (filepath) => /1/.test(filepath),
  });

  const files = [];

  for (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [path.join(dir), path.join(dir, "02")]);
});

test("walk asynchronously and set maxDeep=0", () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and set max deep");

  const walker = new FileSystemWalker(dir, {
    maxDeep: 0,
  });

  const files = [];

  for (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [path.join(dir)]);
});

test("walk asynchronously and set maxDeep=1", () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and set max deep");

  const walker = new FileSystemWalker(dir, {
    maxDeep: 1,
  });

  const files = [];

  for (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [
    path.join(dir),
    path.join(dir, "01"),
    path.join(dir, "02"),
    path.join(dir, "11"),
  ]);
});

test("walk asynchronously and set maxDeep=2", () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and set max deep");

  const walker = new FileSystemWalker(dir, {
    maxDeep: 2,
  });

  const files = [];

  for (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [
    path.join(dir),
    path.join(dir, "01"),
    path.join(dir, "02"),
    path.join(dir, "11"),
    path.join(dir, "11", "111"),
    path.join(dir, "11", "22"),
  ]);
});

test("walk asynchronously and set maxDeep=2 and assets deep", () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and set max deep");

  const walker = new FileSystemWalker(dir, {
    maxDeep: 2,
  });

  const files = [];

  for (const entity of walker) {
    files.push([entity.filepath, entity.deep]);
  }

  assert.deepEqual(files, [
    [path.join(dir), 0],
    [path.join(dir, "01"), 1],
    [path.join(dir, "02"), 1],
    [path.join(dir, "11"), 1],
    [path.join(dir, "11", "111"), 2],
    [path.join(dir, "11", "22"), 2],
  ]);
});
