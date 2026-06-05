export default {
  name: "clear",
  aliases: ["cls"],
  category: "utils",
  description: "Clear the terminal screen.",
  usage: "clear",
  async run() {
    process.stdout.write("\u001Bc");
  }
};
