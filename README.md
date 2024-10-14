# @nyren/codebase-setup

A CLI tool that simplifies setting up codebases for JavaScript or TypeScript projects. It provides essential libraries and configurations for rapid project initialization.

## Features

- **Supports both JavaScript and TypeScript**: Choose between JavaScript or TypeScript during setup.
- **Pre-configured libraries**: Automatically adds useful libraries based on the chosen language.
- **Simple project structure**: Sets up a basic but powerful project structure, allowing you to get started quickly.
- **Configurable options**: Offers flexibility to modify the setup process according to your preferences.

> **Note**: This project does not provide any API for direct usage. It is solely a CLI tool designed for project setup.

## Installation

You can install the CLI globally via npm:

```bash
npm install -g @nyren/codebase-setup
```

Or with Bun:

```bash
bun add -g @nyren/codebase-setup
```

## Usage

After installation, you can use the CLI to set up a new project:

```bash
nyrenx-codeup init
nyrenx-codeup update
```

The CLI will guide you through a series of prompts, where you can choose the project language and other options.

## Commands:

- `init`: Initializes a new project with the selected language and configuration.
  - Options:
    - `-n, --project-name [project-name]`: Specify the name of the project. If not provided, the project will be created with a default name.
    - `-t, --target [target]`: Select the target programming language for the project (e.g., JavaScript, TypeScript). This is required to generate the appropriate project structure and setup.
    - `-m, --module [module]`: Specify the module format to use for the project (e.g., CommonJS or ESModule). This helps set the appropriate module configuration in the project.
    - `-d, --directory [directory]`: Specify the directory where the project will be created. If not provided, the project will be created in the current directory.

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

### Example Workflow

1. Choose the language for your project (JavaScript or TypeScript).
2. Automatically install essential libraries for the selected language.
3. Enjoy your new project, fully set up with the necessary tools!

## Options

The following options are available during project setup:

- **JavaScript/TypeScript**: Select the programming language.
- **Libraries**: Add useful libraries for the chosen language.
- **Project Structure**: Automatically create a basic structure optimized for your choice.

## License

MIT License. See [LICENSE](./LICENSE) for more details.