# @nyren/repo-templates

The `@nyren/repo-templates` package provides predefined repository templates for JavaScript and TypeScript projects. These templates are delivered as JSON files and are meant to be fetched using [unpkg](https://unpkg.com) to facilitate quick setup of project structures.

## Installation

This package is not intended for direct installation. Instead, it is designed to be fetched via unpkg in your automation tools or scripts. For example:

```bash
curl https://unpkg.com/@nyren/repo-templates@latest/templates.json -o templates.json
```

### Example Usage

Here is a simple example where you can use template code from the @nyren/codebase-setup v0.3.0 and above library.

```
npm i -g @nyren/codebase-setup@0.3.0

nyrenx-codeup init
```


## Templates

Currently, this package includes templates for:

- JavaScript projects
- TypeScript projects
- Go projects

The templates contain configuration files such as:

- `tsconfig.json`
- `.prettierrc.json`
- `jest.config.ts`
- Other necessary configurations for modern development workflows

## Contributing

Contributions are welcome! If you want to suggest improvements or additional templates, feel free to submit an issue or a pull request.

## License
MIT License. See [LICENSE](./LICENSE) for more details.
- This project is licensed under the MIT License.
