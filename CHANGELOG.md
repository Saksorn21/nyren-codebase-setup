# Changelog

## [0.1.0] - 2024-10-06

### Added
- Initial release of `@nyren/codebase-setup`.
- CLI tool for setting up JavaScript and TypeScript projects.
- Added language selection prompts for JavaScript or TypeScript.
- Automatically installs essential libraries based on the chosen language.
- Created base project structure during setup.
- Integrated libraries such as `chalk`, `commander`, `inquirer`, `log-symbols`, and `ora` for CLI interaction.
- Provided Bun support alongside npm for installation.
- Added `nyrenx-codeup` command for setting up projects.
- `processSpinner` utility for managing loading spinners with `oraPromise`.