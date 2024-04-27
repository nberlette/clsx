#!/usr/bin/env -S deno run -A

import * as dnt from "https://deno.land/x/dnt@0.40.0/mod.ts";
import type { ts } from "npm:ts-morph@18.0.0";
import { resolve } from "node:path";

const { log, error } = console;

const $ok = (...s: unknown[]) => {
  const [label, ...rest] = String(s.shift() ?? "").split(/\s+/);
  return [
    log.bind(console, `\x1b[1;92m✔️ ${label}\x1b[0m`, ...rest, ...s),
    error.bind(console, `\x1b[1;91m❌ ${label}\x1b[0m`, ...rest, ...s),
  ] as const;
};

const defaultOutDir = "./dist";
let outDir = defaultOutDir;

const isTTY = Deno.stdin.isTerminal() && !Deno.env.get("CI");

export const preBuild = async (output?: string) => {
  outDir = output || outDir;
  if (isTTY && !output) {
    outDir = prompt("Output directory:", outDir) || outDir;
  }
  const emptyOutDir = !isTTY ||
    confirm("Empty the output directory before building?");
  if (emptyOutDir) await dnt.emptyDir(outDir);

  await Promise.allSettled([
    Deno.copyFile("README.md", `${outDir}/README.md`).then(
      ...$ok(`COPY README.md → ${outDir}`),
    ),
    Deno.copyFile("LICENSE", `${outDir}/LICENSE`).then(
      ...$ok(`COPY LICENSE → ${outDir}`),
    ),
    Deno.copyFile("./mod.ts", "./index.ts").then(
      ...$ok("COPY ./mod.ts → ./index.ts"),
    ),
  ]);
};

export const postBuild = async () => {
  await Deno.remove("./index.ts").then(
    ...$ok(`REMOVE ./index.ts (copy)`),
  );
  await Deno.rename(`${outDir}/script`, `${outDir}/cjs`)
    .then(...$ok(`RENAME ${outDir}/script TO ${outDir}/cjs`));

  const cjsPkg = JSON.stringify({ type: "commonjs" });
  await Deno.writeTextFile(`${outDir}/cjs/package.json`, cjsPkg)
    .then(...$ok(`WRITE ${outDir}/cjs/package.json`));

  const esmPkg = JSON.stringify({ type: "module" });
  await Deno.writeTextFile(`${outDir}/esm/package.json`, esmPkg)
    .then(...$ok(`WRITE ${outDir}/esm/package.json`));
};

const createPackageJson = ({
  name = "@nberlette/clsx",
  version,
  description =
    "Type-safe utility for constructing conditional class names in TypeScript or JavaScript.",
  keywords =
    "classnames,css,class,front-end utility,web development,deno,node,bun,jsx"
      .split(/\s*,\s*/),
  exports = { ".": "./mod.ts" },
}: {
  name: string;
  version: string;
  keywords?: string[];
  description?: string;
  exports?: string | { [key: string]: string };
  // deno-lint-ignore no-explicit-any
  [x: string]: any;
}): dnt.PackageJson => ({
  // fix scope for npm
  name: name.replace(/^@nick\//, "@nberlette/"),
  version,
  license: "MIT",
  author: {
    name: "Nicholas Berlette",
    email: "nick@berlette.com",
    url: "https://github.com/nberlette",
  },
  repository: "https://github.com/nberlette/clsx",
  homepage: `https://jsr.io/@nick/clsx`,
  bugs: "https://github.com/nberlette/clsx/issues",
  description,
  keywords: [
    ...new Set([
      ...keywords,
      "clsx",
      "jsr",
      "deno",
      "bun",
      "node",
      "typescript",
      "javascript",
      "utility",
      "classnames",
    ]),
  ],
  private: false,
  exports: Object.fromEntries(
    Object.entries(typeof exports === "string" ? { ".": exports } : exports)
      .map(([key, value]) => {
        value = value.replace(/^\.\//, "").replace(/\.[cm]?[jt]sx?$/, "");
        if (value === "mod") value = "index";
        return [key, {
          types: `./types/${value}.d.ts`,
          import: `./esm/${value}.js`,
          require: `./cjs/${value}.js`,
          default: `./esm/${value}.js`,
        }];
      }),
  ),
});

export const build = async (...args: string[]) => {
  let [path = ".", output] = args;
  const cwd = Deno.cwd();
  path = resolve(path);
  Deno.chdir(path);

  const ignoredCodes = [1470, 1343, 2304, 4060, 2552];
  const filterDiagnostic = (diagnostic: ts.Diagnostic) => {
    const { code, category } = diagnostic;
    return !ignoredCodes.includes(code) && !ignoredCodes.includes(category);
  };

  const configPath = resolve(path, "deno.json");

  const denoJson = await import(configPath, { with: { type: "json" } });
  const { name, version, description, keywords } = denoJson.default;

  log(`🔨 building ${name} v${version}`);

  await preBuild(output);

  const packageJson = createPackageJson({
    name,
    version,
    description,
    keywords,
  });

  await dnt.build({
    entryPoints: ["./index.ts"],
    outDir,
    importMap: configPath,
    compilerOptions: {
      target: "ES2022",
      sourceMap: true,
      skipLibCheck: true,
      lib: ["ESNext"],
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
    },
    declaration: "separate",
    esModule: true,
    filterDiagnostic,
    package: packageJson,
    packageManager: "npm",
    shims: {
      deno: "dev",
    },
    scriptModule: "cjs",
    skipNpmInstall: true,
    skipSourceOutput: true,
    test: false,
    postBuild,
  });

  Deno.chdir(cwd);
};

if (import.meta.main) await build(...Deno.args);
