#!/usr/bin/env node

import readline from "node:readline";
import { loadCommands } from "./loader.js";

let commands = await loadCommands();

console.log("HoysCLI - 1.0.4");
console.log('Run "help" if you need to learn the available commands.');
console.log("");

global.reloadCommands = async () => {
  commands = await loadCommands();
};

let isRunningCommand = false;

process.on("SIGINT", () => {
  if (!isRunningCommand) {
    console.log("\nBye.");
    process.exit(0);
  }
});

function startCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
  });

  rl.prompt();

  rl.on("line", async (line) => {
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

    isRunningCommand = true;
    rl.close();

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
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      isRunningCommand = false;
      startCLI();
    }
  });
}

startCLI();
