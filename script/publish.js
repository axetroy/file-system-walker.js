/**
 * Usage:
 *
 * NODE_AUTH_TOKEN=npm_xxxxx node npm/publish.js
 */

const spawn = require("child_process").spawn;

async function main() {
  const cwd = __dirname;

  await new Promise((resolve, reject) => {
    const ps = spawn(
      "npm",
      [
        "publish",
        "--access",
        "public",
        "--registry",
        "https://registry.npmjs.org",
      ],
      {
        cwd: cwd,
        stdio: "inherit",
        env: process.env,
      }
    );

    ps.on("close", (code) => {
      code === 0 ? resolve() : reject(new Error(`Process exist with ${code}`));
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
