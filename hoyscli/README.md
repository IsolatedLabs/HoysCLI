# HoysCLI

HoysCLI is a small interactive Node.js CLI that loads commands automatically from the `cmds/` folder.

## Features

- Interactive shell mode
- Auto-loaded commands from categorized folders
- `help` command grouped by category
- `help <command>` for command details
- `update` command for global package updates
- Simple structure that is easy to extend

## Project Structure

```txt
hoyscli/
├─ package.json
├─ index.js
├─ loader.js
├─ LICENSE
├─ README.md
└─ cmds/
   ├─ general/
   │  ├─ help.js
   │  └─ update.js
   ├─ project/
   │  ├─ create.js
   │  └─ build.js
   └─ utils/
      ├─ clear.js
      └─ info.js
```

## Requirements

- Node.js 18 or newer
- npm

## Install

```bash
npm install
npm link
```

## Run

```bash
hoyscli
```

## Example

```txt
HoysCLI - 1.0.0
Run "help" if you need to learn the available commands.

> help
```

## Adding a command

Create a file inside one of the category folders in `cmds/`.

Example:

```js
export default {
  name: "ping",
  category: "general",
  description: "Test the CLI.",
  usage: "ping",
  async run() {
    console.log("pong");
  }
};
```

It will be loaded automatically the next time HoysCLI starts.

## License

MIT License. See `LICENSE`.
