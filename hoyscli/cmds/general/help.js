export default {
  name: "help",
  aliases: ["h"],
  category: "general",
  description: "Show all available commands grouped by category.",
  usage: "help [command]",
  async run({ args, commands }) {
    const target = args?.[0];
    const uniqueCommands = new Map();

    for (const command of commands.values()) {
      if (!command?.name) continue;
      uniqueCommands.set(command.name, command);
    }

    if (target) {
      const command = commands.get(target);

      if (!command) {
        console.log(`Command not found: ${target}`);
        return;
      }

      console.log(`Name: ${command.name}`);
      console.log(`Category: ${command.category ?? "uncategorized"}`);
      console.log(`Description: ${command.description ?? "No description provided."}`);
      console.log(`Usage: ${command.usage ?? command.name}`);
      if (Array.isArray(command.aliases) && command.aliases.length > 0) {
        console.log(`Aliases: ${command.aliases.join(", ")}`);
      }
      return;
    }

    const grouped = new Map();

    for (const command of uniqueCommands.values()) {
      const category = command.category ?? "uncategorized";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(command);
    }

    console.log("Available commands:");

    for (const [category, list] of grouped) {
      console.log(`\n[${category}]`);
      list
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((command) => {
          const aliases = Array.isArray(command.aliases) && command.aliases.length > 0
            ? ` (${command.aliases.join(", ")})`
            : "";
          console.log(`  ${command.name}${aliases} - ${command.description ?? "No description provided."}`);
        });
    }

    console.log("");
    console.log('Use "help <command>" to inspect one command.');
  }
};
