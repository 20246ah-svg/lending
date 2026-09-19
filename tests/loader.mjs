import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }

  // Handle @/ aliases
  if (specifier.startsWith("@/")) {
    const subPath = specifier.slice(2);
    const basePath = path.resolve(process.cwd(), subPath);

    const candidates = [
      basePath + ".ts",
      basePath + ".tsx",
      basePath + ".js",
      path.join(basePath, "index.ts"),
      path.join(basePath, "index.js"),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return nextResolve("file://" + c, context);
      }
    }
  }

  // Handle relative imports without extension (e.g. "./logger")
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : process.cwd();
    const parentDir = path.dirname(parentPath);
    const targetPath = path.resolve(parentDir, specifier);

    const candidates = [
      targetPath + ".ts",
      targetPath + ".tsx",
      targetPath + ".js",
      path.join(targetPath, "index.ts"),
      path.join(targetPath, "index.js"),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return nextResolve("file://" + c, context);
      }
    }
  }

  return nextResolve(specifier, context);
}
