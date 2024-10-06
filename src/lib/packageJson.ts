import { readFileSync } from './fileSystem'
import { resolve } from 'path'

export function readPackageJson(
  src?: string
): Record<string, string | string[]> {
  let packageJsonPath: string
  if (src) {
    packageJsonPath = resolve(src, 'package.json')
  } else {
    packageJsonPath = resolve(process.cwd(), 'package.json')
  }
  return JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
}
