import esbuild from "esbuild";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/** @type {import('esbuild').BuildOptions} */
const baseOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  target: "node22",
  sourcemap: !production,
  minify: production,
};

if (watch) {
  const ctx = await esbuild.context(baseOptions);
  await ctx.watch();
  console.log("Watching...");
} else {
  await esbuild.build(baseOptions);
  console.log("Build complete.");
}
