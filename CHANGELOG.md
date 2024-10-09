# Changelog

## [0.2.0] - 2024-10-08

### Major Changes
- **Restructured `repo-templates`:** Enhanced organization of the template files.
- **Project Architecture Update:**
  - Transitioned to a fully functional CLI tool; no API available.
  - Modified file structure:
    - **Before Build:** `src/cli`
    - **After Build:** `dist/cli` (previously `root/cli`), resolving inconsistencies.
- **Dependencies:**
  - Added `archiver` to `devDependencies` for file compression.
  - Added `unzipper` to `dependencies` for CLI operations.
- **Removed Unused Functions:**
  - Deleted `copyRepo`, `createPrettierJson`, `createFilesMain`, `setPrettierJson`, `createFileMain`.
  - Deleted the unused `setup-repo` file.
- **New Functionality:** Added `zipUtil` and `extractArchive` function to improve archive handling.

### Performance Improvements
- Reduce the work process steps.
- Expect minor increases in performance and reduction in project size due to compressed `repo-templates`.

## [v0.1.7] - 2024-10-07

### Changed
- Updated the handling of file paths by replacing `__dirname` with `import.meta.url` to ensure compatibility with ES modules. This change allows seamless usage in environments where `__dirname` is not available.
- Restructured project files by moving the build output to the `./dist` directory.
  
### Fixed
- Enabled CLI tools to be executed from anywhere on the machine, ensuring global access and usage.

---

This version note emphasizes both the path handling improvements and the CLI tools accessibility. Let me know if this works or needs any tweaks!

## [v0.1.6] - 2024-10-07

### Fixed
- Fixed a bug that caused `.prettierrc.json` to not be created properly during setup.
- Formatted the `package.json` file to ensure proper structure and readability.
- Various other minor bug fixes and improvements to enhance overall functionality.

## [v0.1.5] - 2024-10-07

### Changed
- Updated `tsconfig.json` to use `"module": "Node16"` and `"moduleResolution": "Node16"` to ensure compatibility with Node.js ES Modules.
- Added TypeScript `.d.ts` files during the build process to provide TypeScript typings for API utilities.
- Updated `tsconfig.json` in the `repo-templates` folder with the same `"module": "Node16"` and `"moduleResolution": "Node16"` settings for consistency.

## [v0.1.4] - 2024-10-07

### Fixed
- Fixed an issue where the CLI command didn't work because the `bin` path in the `package.json` file was incorrect.
- Updated the `bin` field in `package.json` to correctly point to `cli/nyrenx.js`.

## [v0.1.3] - 2024-10-07

### Fixed
- Added missing `repo-templates` folder to the npm package for proper distribution.
- Corrected the `package.json` `files` field to ensure the `repo-templates` directory is included during the npm publish process.

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