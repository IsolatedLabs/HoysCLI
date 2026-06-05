export default {
  name: "create",
  category: "project",
  description: "Create a new project scaffold.",
  usage: "create <name>",
  async run({ args }) {
    const name = args?.[0];
    if (!name) {
      console.log("Usage: create <name>");
      return;
    }
    console.log(`Project scaffold for "${name}" would be created here.`);
  }
};
