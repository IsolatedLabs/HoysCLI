import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function loadCommands() {
  const commands = new Map();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const cmdsDir = path.join(__dirname, "cmds");

  let categories = [];

  try {
    categories = await fs.readdir(cmdsDir, {
      withFileTypes: true
    });
  } catch (error) {
    console.error(
      "No se pudo leer la carpeta cmds:",
      error.message
    );
    return commands;
  }

  for (const categoryDir of categories) {
    if (!categoryDir.isDirectory()) continue;

    const categoryPath = path.join(
      cmdsDir,
      categoryDir.name
    );

    let files = [];

    try {
      files = await fs.readdir(categoryPath, {
        withFileTypes: true
      });
    } catch (error) {
      console.error(
        `No se pudo leer ${categoryDir.name}:`,
        error.message
      );
      continue;
    }

    for (const file of files) {
      if (!file.isFile()) continue;
      if (!file.name.endsWith(".js")) continue;

      const filePath = path.join(
        categoryPath,
        file.name
      );

      try {
        const moduleUrl =
          pathToFileURL(filePath).href +
          `?update=${Date.now()}`;

        const mod = await import(moduleUrl);

        const command = mod.default;

        if (
          !command ||
          typeof command.name !== "string" ||
          typeof command.run !== "function"
        ) {
          continue;
        }

        command.category ??= categoryDir.name;

        commands.set(command.name, command);

        if (Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            commands.set(alias, command);
          }
        }
      } catch (error) {
        console.error(
          `Error cargando ${filePath}:`,
          error.message
        );
      }
    }
  }

  return commands;
}
