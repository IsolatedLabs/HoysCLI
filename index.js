#!/usr/bin/env node

import readline from "node:readline";
import { loadCommands } from "./loader.js";

let commands = await loadCommands();

console.log("HoysCLI - 1.0.2");
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

global.reloadCommands = async () => {
  commands = await loadCommands();
};

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
      commandName: name,
      reloadCommands: global.reloadCommands
    });
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );
  }

  printPrompt();
});

rl.on("SIGINT", () => {
  console.log("\nBye.");
  process.exit(0);
});
