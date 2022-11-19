import assert from "node:assert";
import test from "node:test";
import path from "node:path";
import url from "node:url";

import { FileSystemWalker } from "../dist/index.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

test("walk asynchronously", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk");

  const walker = new FileSystemWalker(dir);

  const files: string[] = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [
    path.join(dir),
    path.join(dir, "01"),
    path.join(dir, "02"),
  ]);
});

test("walk asynchronously and breakable", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and breakable");

  const walker = new FileSystemWalker(dir);

  const files: string[] = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
    if (/01/.test(entity.filepath)) {
      break;
    }
  }

  assert.deepEqual(files, [path.join(dir), path.join(dir, "01")]);
});

test("walk asynchronously and exclude with regexp", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and exclude");

  const walker = new FileSystemWalker(dir, { exclude: /1/ });

  const files: string[] = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [path.join(dir), path.join(dir, "02")]);
});

test("walk asynchronously and exclude with function", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and exclude");

  const walker = new FileSystemWalker(dir, {
    exclude: (filepath) => /1/.test(filepath),
  });

  const files: string[] = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [path.join(dir), path.join(dir, "02")]);
});
