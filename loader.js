#!/usr/bin/env node

import readline from "node:readline";
import { loadCommands } from "./loader.js";

let commands = await loadCommands();
let busy = false;

console.log("HoysCLI - 1.0.3");
console.log('Run "help" if you need to learn the available commands.');
console.log("");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

global.hoyscli = {
  get commands() {
    return commands;
  },

  async reloadCommands() {
    commands = await loadCommands();
  },

  lock() {
    busy = true;
    rl.pause();
  },

  unlock() {
    busy = false;
    rl.resume();
    rl.prompt();
  }
};

rl.prompt();

rl.on("line", async (line) => {
  if (busy) return;

  const input = line.trim();

  if (!input) {
    rl.prompt();
    return;
  }

  const [name, ...args] = input.split(/\s+/);

  const command = commands.get(name);

  if (!command) {
    console.log(`Unknown command: ${name}`);
    rl.prompt();
    return;
  }

  try {
    await command.run({
      args,
      raw: input,
      commands,
      commandName: name,
      reloadCommands: global.hoyscli.reloadCommands
    });
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );
  }

  if (!busy) {
    rl.prompt();
  }
});

rl.on("SIGINT", () => {
  if (busy) return;

  console.log("\nBye.");
  process.exit(0);
});
