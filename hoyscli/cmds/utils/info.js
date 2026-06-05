export default {
  name: "info",
  category: "utils",
  description: "Show basic information about HoysCLI.",
  usage: "info",
  async run() {
    console.log("HoysCLI - 1.0.0");
    console.log("A simple command launcher with auto-loaded commands.");
    console.log("Organization: IsolatedLabs");
  }
};
