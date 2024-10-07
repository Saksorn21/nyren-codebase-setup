import {
  cp as fsCopyDirectory,
  readFile as fsReadFile,
  writeFile as fsWriteFile,
  mkdir as fsMkdir,
} from 'node:fs/promises'
import { readFileSync } from 'node:fs'

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

    const jsonData = JSON.stringify(data, null, 2) 
    await fsWriteFile(filePath, jsonData, 'utf-8') 

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

export { copyRepo, readFile, readFileSync, createJsonFile, createFile, createDirectory }

