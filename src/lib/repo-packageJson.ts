

const packageJsonMain: Map<string, string | string[]> = new Map<
  string,
  string | string[]
>([
  ['name', 'my-project'],
  ['version', '1.0.0'],
  ['description', 'my-project'],
  ['keywords', []],
  ['author', 'Boat Saksorn  (Thailand)'],
  ['license', 'MIT'],
])
const packageJsonTs = {
  main: "lib/index.js",
  exports: {
    ".": {
      require: {
        types: "./lib/types/index.d.ts",
        default: "./lib/cjs/index.js"
      },
      import: {
        types: "./lib/types/index.d.ts",
        default: "./lib/esm/index.js"
      }
    }
  },
  private: true,
  scripts: {
  "build:cjs": "tsc -p tsconfigs/cjs.json",
  "build:esm": "tsc -p tsconfigs/esm.json",
  "build:clean": "rm -rf lib/cjs/* lib/esm/* 2> /dev/null",
  build: "npm run build:clean; npm run build:cjs && npm run build:esm",
  lint: "prettier --check 'src/**/*.{js,ts}' 'lib/esm/**/*.{js,ts}' 'lib/cjs/**/*.{js,ts}' 'lib/types/**/*.{js,ts}'",
  format: "prettier --write 'src/**/*.{js,ts}' 'lib/esm/**/*.{js,ts}' 'lib/cjs/**/*.{js,ts}' 'lib/types/**/*.{js,ts}'",
  test: "jest --coverage"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/Saksorn21/EDIT_ME.git"
  },
  devDependencies: {
    "@jest/globals": "^29.7.0",
    "@types/jest": "^29.5.13",
    "@types/node": "^22.7.4",
    jest: "^29.7.0",
    prettier: "^3.3.3",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    typescript: "^5.6.2"
  },
  dependencies: {
    tslib: "^2.7.0"
  }
}
const packageJsonJs = {
  main: "src/index.js",
  private: true,
  scripts: {
    build: "npx esbuild ./src/index.js --bundle --outfile=index.js",
  lint: "prettier --check 'src/**/*.{js}'",
  format: "prettier --write 'src/**/*.{js}'",
  "test": "jest --coverage"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/Saksorn21/EDIT_ME.git"
  },
  devDependencies: {
    jest: "^29.7.0",
    prettier: "^3.3.3",
    nodemon: "^3.1.7",
    esbuild: "^0.24.0"
  }
}



export function baseRepoPackageJson(target: string): object {
  const repoPackage = target === "typescript" ? packageJsonTs : packageJsonJs
  let row: Record<string, string | string[]> = {}
  for (const [key, value] of packageJsonMain) {
      row[key] = value;
  }
  return {...row,...repoPackage}
}
async function fetchPackageJson() {
   try {
      const res = await fetch('https://raw.githubusercontent.com/Saksorn21/nyren-codebase-setup/refs/heads/main/repo-templates/js.json',{
        method: 'GET',
      })
     const packageJson = await res.json()
     return packageJson
   } catch (error: unknown) {
      return {}
   }
   
}
console.log(await fetchPackageJson())


