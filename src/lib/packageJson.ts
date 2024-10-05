import { readFile } from 'fileSystem'
import { resolve } from 'path';

export async function readPackageJson() {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  const data = await readFile(packageJsonPath,);
  const packageJson = JSON.parse(data);
          console.log(packageJson);
}