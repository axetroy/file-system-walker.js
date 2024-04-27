const fs = require("fs");
const path = require("path");

const dist = path.join(__dirname, "../dist/cjs");
const files = fs.readdirSync(dist);

for (const item of files) {
  const filePath = path.join(dist, item);

  switch (true) {
    case filePath.endsWith(".js"):
      {
        let fileContent = fs.readFileSync(filePath, "utf8");

        fileContent = fileContent.replace(
          "sourceMappingURL=index.js.map",
          "sourceMappingURL=index.cjs.map"
        );

        fs.writeFileSync(filePath, fileContent, { encoding: "utf8" });

        fs.renameSync(filePath, filePath.replace(/\.js$/, ".cjs"));
      }
      break;
    case filePath.endsWith(".d.ts"):
      break;
    case filePath.endsWith(".js.map"):
      {
        const sourcemap = JSON.parse(fs.readFileSync(filePath, "utf8"));

        sourcemap.file = sourcemap.file.replace(/\.js$/, ".cjs");

        fs.writeFileSync(filePath, JSON.stringify(sourcemap));

        fs.renameSync(filePath, filePath.replace(/\.js\.map$/, ".cjs.map"));
      }
      break;
  }
}
