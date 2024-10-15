# 🛠️ nyren-codebase-setup <sup>(version 0.3.0)<sup>

**Easy** project startup 💭 With **nyren-codebase-setup**, a CLI tool that lets you quickly create new projects 🚀 with the base language and configuration you want!

> [!IMPORTANT]
> 🚨 We found the command to be too long and changed it from **nyrenx-codeup** -> **nyrenx**
> 🚨 In version 0.3.0 you can still use the old command with the new command, but in future versions you will only be able to use **nyrenx**

## Features 🚀

- **🚀 Easy and quick project start-up**
- **📍Supports both JavaScript and TypeScript**: Choose between JavaScript or TypeScript during setup.
- **📚 Pre-configured libraries**: Automatically adds useful libraries based on the chosen language.
- **🎓 Simple project structure**: Sets up a basic but powerful project structure, allowing you to get started quickly.
- **🛠️ Configurable options**: Offers flexibility to modify the setup process according to your preferences.

> [!NOTE]
> This project does not provide any API for direct usage. It is solely a CLI tool designed for project setup.

## 🚀 Installation

You can install the CLI globally via npm:

```bash
npm install -g @nyren/codebase-setup
```

## 🔍 Example Usage

### 1. Creating a New Project

To create a new project, simply run the following command:

```bash
nyrenx init [options]
```

<p align="center">
  <br>
  <img src="demo/demo.gif" width="500">
  <br>
  <img src="demo/demoopts.gif" width="500">
  <br>
</p>

> [!TIP]
> Use the `--fix <project-name>`: Fast Setup of the project without any interactive prompts 🚀

> [!NOTE]
> Once you run nyrenx init, will guide you through a series of prompts, where you can choose the project language and other options.

## 📌 Available Commands

- `init`: Initializes a new project with the selected language and configuration.
  - Options:
    - `-n, --project-name [project-name]`: Specify the name of the project. If not provided, the project will be created with a default name.
    - `-t, --target [target]`: Select the target programming language for the project (e.g., JavaScript, TypeScript). This is required to generate the appropriate project structure and setup.
    - `-m, --module [module]`: Specify the module format to use for the project (e.g., CommonJS or ESModule). This helps set the appropriate module configuration in the project.
    - `-d, --directory [directory]`: Specify the directory where the project will be created. If not provided, the project will be created in the current directory.
    - `--fix <project-name>`: Quick Start the project without being guided through a series of prompts.

- `update`: Update the CLI tool to the latest version available. This ensures the tool stays up to date with the newest features and fixes.
  - No additional options are required for this command.


## Dev Dependencies

### For TypeScript Projects

When you choose TypeScript, the following `devDependencies` will be added automatically:

```json
{
  "dependencies": {
    "tslib": "^2.7.0"
  },
  "devDependencies": {
    "@nyren/codebase-setup": "^0.2.2",
    "@jest/globals": "^29.7.0",
    "@types/jest": "^29.5.13",
    "@types/node": "^22.7.4",
    "jest": "^29.7.0",
    "prettier": "^3.3.3",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.2"
  }
}
```

### For JavaScript Projects

If you choose JavaScript, the following minimal `devDependencies` will be installed:

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "prettier": "^3.3.3",
    "nodemon": "^2.0.22"
  }
}
```

Both setups ensure you have the necessary tools to start developing with either JavaScript or TypeScript.

## TypeScript Configuration

When setting up a TypeScript project, `@nyren/codebase-setup` provides two options for `tsconfig` based on the module system you choose:

1. **CommonJS**: If you choose CommonJS, the tool will use the following configuration:
   - `@nyren/codebase-setup/tsconfigs/cjs.json`

2. **ESModule**: If you choose ES Module, the tool will use the following configuration:
   - `@nyren/codebase-setup/tsconfigs/esm.json`

### Base Configuration

Both configurations extend from a base setup with the following settings:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "Node16",
    "declarationDir": "lib/types",
    "moduleResolution": "Node16",
    "lib": [
      "es2022"
    ],
    "baseUrl": ".",
    "strict": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "importHelpers": true,
    "allowSyntheticDefaultImports": false,
    "allowUnreachableCode": false,
    "esModuleInterop": false,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "useDefineForClassFields": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src", "src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## License

MIT License. See [LICENSE](./LICENSE) for more details.