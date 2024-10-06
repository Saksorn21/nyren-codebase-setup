import {
  cp as fsCopyDirectory,
  readFile as fsReadFile,
  writeFile as fsWriteFile,
  mkdir as fsMkdir,
} from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve, join } from 'node:path'
export interface ResultFs { 
  success: boolean; 
  error?: Error
}
const readFile = async (path: string) => await fsReadFile(path, 'utf-8')
const createFile = async (src: string, data: string) => await fsWriteFile(src, data, 'utf-8')

async function createDirectory(path: string): Promise<ResultFs> {
  try {
    await fsMkdir(path, { recursive: true });
    return { success: true }
  } catch (error) {
    
    return { success: false, error: error as Error }
  }
}
async function createJsonFile(
  filePath: string,
  data: object
): Promise<ResultFs> {
  try {
    const src = resolve(filePath, 'package.json')
    const jsonData = JSON.stringify(data, null, 2) 
    await fsWriteFile(src, jsonData, 'utf-8') 

    return { success: true }
  } catch (err) {
    return { success: false, error: err as Error }
  }
}

async function copyRepo(src: string, dest: string): Promise<boolean> {
  try {
    await fsCopyDirectory(src, dest, {
      recursive: true,
    })
    return true
  } catch (error: unknown) {
    return false
  }


}
/**
 * Resolves and normalizes a file path.
 * If the path starts with `~`, it is replaced with the user's home directory.
 *
 * @param {...string[]} paths - The parts of the file path.
 * @returns {string} The resolved file path.
 */
function resolvePath(...paths: string[]): string {
  let fullPath = join(...paths)

  // If path starts with ~, replace it with home directory
  if (fullPath.startsWith('~')) {
    fullPath = join(homedir(), fullPath.slice(1)) // Remove ~ and join with home directory
  }

  return fullPath
}

export { copyRepo, readFile, readFileSync, createJsonFile, createFile, createDirectory, resolvePath }

