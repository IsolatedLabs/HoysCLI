import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function loadCommands() {
  const commands = new Map();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // loader.js lives in the project root, so cmds is a sibling directory.
  const cmdsDir = path.join(__dirname, "cmds");

  let categories = [];
  try {
    categories = await fs.readdir(cmdsDir, { withFileTypes: true });
  } catch (error) {
    console.error("No se pudo leer la carpeta cmds:", error.message);
    return commands;
  }

  for (const categoryDir of categories) {
    if (!categoryDir.isDirectory()) continue;

    const category = categoryDir.name;
    const categoryPath = path.join(cmdsDir, category);

    let files = [];
    try {
      files = await fs.readdir(categoryPath, { withFileTypes: true });
    } catch (error) {
      console.error(`No se pudo leer la categoría ${category}:`, error.message);
      continue;
    }

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith(".js")) continue;

      const filePath = path.join(categoryPath, file.name);

      try {
        const mod = await import(pathToFileURL(filePath).href);
        const command = mod.default;

        if (!command || typeof command.name !== "string" || typeof command.run !== "function") {
          continue;
        }

        command.category ??= category;
        commands.set(command.name, command);

        if (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            if (typeof alias === "string" && alias.trim()) {
              commands.set(alias, command);
            }
          }
        }
      } catch (error) {
        console.error(`Error cargando ${filePath}:`, error.message);
      }
    }
  }

  return commands;
}
