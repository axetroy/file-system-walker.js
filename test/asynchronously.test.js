const assert = require("assert");
const test = require("test");
const path = require("path");

const { FileSystemWalker } = require("../dist/cjs/index.js");

test("walk asynchronously", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk");

  const walker = new FileSystemWalker(dir);

  const files = [];

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

  const files = [];

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

  const files = [];

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

  const files = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [path.join(dir), path.join(dir, "02")]);
});

test("walk asynchronously and set maxDeep=0", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and set max deep");

  const walker = new FileSystemWalker(dir, {
    maxDeep: 0,
  });

  const files = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [path.join(dir)]);
});

test("walk asynchronously and set maxDeep=1", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and set max deep");

  const walker = new FileSystemWalker(dir, {
    maxDeep: 1,
  });

  const files = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [
    path.join(dir),
    path.join(dir, "01"),
    path.join(dir, "02"),
    path.join(dir, "11"),
  ]);
});

test("walk asynchronously and set maxDeep=2", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and set max deep");

  const walker = new FileSystemWalker(dir, {
    maxDeep: 2,
  });

  const files = [];

  for await (const entity of walker) {
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

test("walk asynchronously and set maxDeep=2 and assets deep", async () => {
  const dir = path.join(__dirname, "..", "fixtures", "walk and set max deep");

  const walker = new FileSystemWalker(dir, {
    maxDeep: 2,
  });

  const files = [];

  for await (const entity of walker) {
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

test("walk and follow symlinks file", async () => {
  const dir = path.join(
    __dirname,
    "..",
    "fixtures",
    "walk and follow symlinks file"
  );

  const walker = new FileSystemWalker(dir, { followSymlinks: true });

  const files = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [
    path.join(dir),
    path.join(dir, "01"),
    path.join(dir, "02"),
    path.join(dir, "03"),
    path.join(__dirname, "..", "fixtures", "walk", "01"),
  ]);
});

test("walk and follow symlinks folder", async () => {
  const dir = path.join(
    __dirname,
    "..",
    "fixtures",
    "walk and follow symlinks folder"
  );

  const walker = new FileSystemWalker(dir, { followSymlinks: true });

  const files = [];

  for await (const entity of walker) {
    files.push(entity.filepath);
  }

  assert.deepEqual(files, [
    path.join(dir),
    path.join(dir, "01"),
    path.join(dir, "02"),
    path.join(dir, "03"),
    path.join(__dirname, "..", "fixtures", "walk and exclude"),
    path.join(__dirname, "..", "fixtures", "walk and exclude", "01"),
    path.join(__dirname, "..", "fixtures", "walk and exclude", "02"),
    path.join(__dirname, "..", "fixtures", "walk and exclude", "11"),
    path.join(__dirname, "..", "fixtures", "walk and exclude", "11", "111"),
  ]);
});
