
import { readFileSync } from './fileSystem.js'

import { getDirname, resolvePath } from './pathHelper.js';

const __dirname = getDirname(import.meta.url);

export function readPackageJson(
  src?: string
): Record<string, string | string[]> {
  let packageJsonPath: string
  if (src) {
    packageJsonPath = resolvePath(src, 'package.json')
  } else {
    
    packageJsonPath = resolvePath(__dirname, '../..', 'package.json')
  }
  return JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
}
