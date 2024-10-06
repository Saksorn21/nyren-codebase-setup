# Changelog

## [v0.1.2] - 2024-10-07

### Fixed
- Added missing files necessary for publishing to npm.
- Corrected the `package.json` `files` field to ensure the correct files are included in the npm package.

### Changed
- Updated the `main` export to expose utility functions for users who want to use the internal utils as a library.

## [v0.1.1] - 2024-10-07

### Fixed
- Corrected build output path from `./lib/lib` to `./lib`.
- Ensured build files are located in the root of the project.

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