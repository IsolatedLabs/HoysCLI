import { execSync } from "node:child_process";

export default {
  name: "update",
  category: "general",
  description: "Update HoysCLI to the latest published version.",
  usage: "update",
  async run() {
    console.log("Checking for updates...");
    execSync("npm install -g hoyscli@latest", { stdio: "inherit" });
    console.log("HoysCLI updated successfully.");
  }
};
