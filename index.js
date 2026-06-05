#!/usr/bin/env node
import readline from "node:readline";
import { loadCommands } from "./loader.js";

const commands = await loadCommands();
const managedShortcuts = new Map(); // alias -> target command name

function uniqueAliasesFor(command, registry) {
  const aliases = new Set(Array.isArray(command.aliases) ? command.aliases : []);

  for (const [key, value] of registry.entries()) {
    if (value === command && key !== command.name) {
      aliases.add(key);
    }
  }

  return [...aliases].sort((a, b) => a.localeCompare(b));
}

function registerShortcut(alias, targetName, { managed = true } = {}) {
  if (!alias || !targetName) return false;
  if (commands.has(alias) && commands.get(alias)?.name === alias) return false;

  const targetCommand = commands.get(targetName);
  if (!targetCommand) return false;

  commands.set(alias, targetCommand);

  if (managed) {
    managedShortcuts.set(alias, targetCommand.name);
  }

  return true;
}

function removeShortcut(alias) {
  if (!managedShortcuts.has(alias)) return false;
  commands.delete(alias);
  managedShortcuts.delete(alias);
  return true;
}

function formatCommandDetails(command, registry) {
  const aliases = uniqueAliasesFor(command, registry);

  console.log(`Name: ${command.name}`);
  console.log(`Category: ${command.category ?? "uncategorized"}`);
  console.log(`Description: ${command.description ?? "No description provided."}`);
  console.log(`Usage: ${command.usage ?? command.name}`);
  if (aliases.length > 0) {
    console.log(`Aliases: ${aliases.join(", ")}`);
  }
}

const builtInCommands = [
  {
    name: "help",
    aliases: ["h"],
    category: "general",
    description: "Show all available commands grouped by category.",
    usage: "help [command]",
    async run({ args, commands }) {
      const target = args?.[0];
      const uniqueCommands = new Map();

      for (const [key, command] of commands.entries()) {
        if (!command?.name) continue;

        if (!uniqueCommands.has(command.name)) {
          uniqueCommands.set(command.name, { command, aliases: new Set() });
        }

        if (key !== command.name) {
          uniqueCommands.get(command.name).aliases.add(key);
        }
      }

      if (target) {
        const command = commands.get(target);

        if (!command) {
          console.log(`Command not found: ${target}`);
          return;
        }

        formatCommandDetails(command, commands);
        return;
      }

      const grouped = new Map();

      for (const { command, aliases } of uniqueCommands.values()) {
        const category = command.category ?? "uncategorized";
        if (!grouped.has(category)) grouped.set(category, []);
        grouped.get(category).push({ command, aliases: [...aliases].sort((a, b) => a.localeCompare(b)) });
      }

      console.log("Available commands:");

      for (const [category, list] of grouped) {
        console.log(`\n[${category}]`);
        list
          .sort((a, b) => a.command.name.localeCompare(b.command.name))
          .forEach(({ command, aliases }) => {
            const aliasText = aliases.length > 0 ? ` (${aliases.join(", ")})` : "";
            console.log(`  ${command.name}${aliasText} - ${command.description ?? "No description provided."}`);
          });
      }

      console.log("");
      console.log('Use "help <command>" to inspect one command.');
    }
  },
  {
    name: "shortcut",
    aliases: ["alias"],
    category: "general",
    description: "Manage session shortcuts.",
    usage: "shortcut <add|remove|list|clear> ...",
    async run({ args, commands }) {
      const action = (args?.[0] ?? "").toLowerCase();

      if (!action || action === "help") {
        console.log("Shortcut manager:");
        console.log("  shortcut add <alias> <command>   Create a new shortcut");
        console.log("  shortcut remove <alias>          Delete a shortcut created in this session");
        console.log("  shortcut list                    Show shortcuts created in this session");
        console.log("  shortcut clear                   Remove all session shortcuts");
        return;
      }

      if (action === "list") {
        if (managedShortcuts.size === 0) {
          console.log("No session shortcuts created yet.");
          return;
        }

        console.log("Session shortcuts:");
        for (const [alias, target] of managedShortcuts.entries()) {
          console.log(`  ${alias} -> ${target}`);
        }
        return;
      }

      if (action === "clear") {
        for (const alias of [...managedShortcuts.keys()]) {
          commands.delete(alias);
        }
        const count = managedShortcuts.size;
        managedShortcuts.clear();
        console.log(count > 0 ? `Removed ${count} shortcut(s).` : "No session shortcuts to remove.");
        return;
      }

      if (action === "remove" || action === "delete" || action === "del") {
        const alias = args?.[1];

        if (!alias) {
          console.log('Usage: shortcut remove <alias>');
          return;
        }

        if (!removeShortcut(alias)) {
          console.log(`Shortcut not found or not managed by this session: ${alias}`);
          return;
        }

        console.log(`Shortcut removed: ${alias}`);
        return;
      }

      if (action === "add" || action === "set") {
        const alias = args?.[1];
        const targetName = args?.[2];

        if (!alias || !targetName) {
          console.log('Usage: shortcut add <alias> <command>');
          return;
        }

        if (commands.has(alias) && commands.get(alias)?.name === alias) {
          console.log(`"${alias}" is already a command name and cannot be used as a shortcut.`);
          return;
        }

        if (!commands.has(targetName)) {
          console.log(`Target command not found: ${targetName}`);
          return;
        }

        if (commands.has(alias) && commands.get(alias)?.name !== alias && !managedShortcuts.has(alias)) {
          console.log(`"${alias}" already exists as a built-in or static shortcut.`);
          return;
        }

        const ok = registerShortcut(alias, targetName, { managed: true });

        if (!ok) {
          console.log(`Could not create shortcut: ${alias}`);
          return;
        }

        console.log(`Shortcut added: ${alias} -> ${targetName}`);
        return;
      }

      console.log(`Unknown shortcut action: ${action}`);
      console.log('Use "shortcut help" to see available actions.');
    }
  },
  {
    name: "exit",
    aliases: ["quit", "close"],
    category: "general",
    description: "Close the CLI.",
    usage: "exit",
    async run() {
      console.log("Bye.");
      process.exit(0);
    }
  }
];

for (const command of builtInCommands) {
  commands.set(command.name, command);

  if (Array.isArray(command.aliases)) {
    for (const alias of command.aliases) {
      commands.set(alias, command);
    }
  }
}

// Built-in shortcut requested by the user: ls -> help
registerShortcut("ls", "help", { managed: true });

console.log("HoysCLI - 1.0.0");
console.log('Run "help" if you need to learn the available commands.');
console.log("");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

function printPrompt() {
  rl.prompt();
}

rl.prompt();

rl.on("line", async (line) => {
  const input = line.trim();

  if (!input) {
    printPrompt();
    return;
  }

  const [name, ...args] = input.split(/\s+/);
  const command = commands.get(name);

  if (!command) {
    console.log(`Unknown command: ${name}`);
    printPrompt();
    return;
  }

  try {
    await command.run({
      args,
      raw: input,
      commands,
      commandName: name
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
  }

  printPrompt();
});

rl.on("SIGINT", () => {
  console.log("\nBye.");
  process.exit(0);
});
