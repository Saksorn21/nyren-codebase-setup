import { readFile } from './fs'
import { resolve } from 'path';

async function readPackageJson() {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  const data = await readFile(packageJsonPath,);
  const packageJson = JSON.parse(data);
          console.log(packageJson);
}