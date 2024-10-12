import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

// Load the library versions
const versions = JSON.parse(fs.readFileSync('repo-templates/versions.json', 'utf-8'));

// Define available libraries and their config files
const availableLibs = [
  { name: 'Prettier', packageName: 'prettier', configFile: 'prettier.json' },
  { name: 'ESLint', packageName: 'eslint', configFile: 'eslint.json' },
  { name: 'Jest', packageName: 'jest', configFile: 'jest.config.json' }
];

// Function to copy configuration files
function copyConfigFile(libConfigFile: string) {
  const sourcePath = path.resolve('repo-templates/libraries', libConfigFile);
  const destinationPath = path.resolve(process.cwd(), libConfigFile);

  // Copy the config file to the user's project directory
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destinationPath);
    console.log(`${libConfigFile} copied to your project.`);
  } else {
    console.error(`Configuration file for ${libConfigFile} not found.`);
  }
}

// Function to update package.json with fixed version
async function updatePackageJson(libsToAdd: string[]) {
  const packageJsonPath = path.resolve('path_to_your_package_json/package.json');

  // Read the current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Add selected libraries with fixed version to dependencies
  libsToAdd.forEach(lib => {
    const version = versions[lib] || 'latest';  // Use fixed version or latest as fallback
    packageJson.dependencies = {
      ...packageJson.dependencies,
      [lib]: version
    };
  });

  // Write the updated package.json back
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('package.json updated with selected libraries and their fixed versions.');
}

// CLI prompt for selecting libraries
async function promptForLibraries() {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'libs',
      message: 'Select the libraries you want to include:',
      choices: availableLibs.map(lib => ({
        name: lib.name,
        value: lib.packageName
      }))
    }
  ]);

  return answers.libs;
}

// Main function to handle the process
async function handleLibrarySelection() {
  const selectedLibs = await promptForLibraries();

  if (selectedLibs.length > 0) {
    console.log('Updating project with the following libraries and configs:');
    selectedLibs.forEach(lib => {
      console.log(`- ${lib}`);
      // Copy the configuration file for each selected library
      const libDetails = availableLibs.find(l => l.packageName === lib);
      if (libDetails) {
        copyConfigFile(libDetails.configFile);
      }
    });

    // Update package.json with fixed versions
    await updatePackageJson(selectedLibs);
  } else {
    console.log('No libraries selected.');
  }
}

handleLibrarySelection();