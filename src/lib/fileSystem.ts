import {
  writeFile as fsWriteFile,
  mkdir as fsMkdir,
} from 'node:fs/promises'
import { 
  readFile as rf,
  readFileSync as rfSync } from 'node:fs'
import { dirname } from 'node:path'
export interface ResultFs {
  success: boolean
  error?: Error
}
const readFile = (path: string) => new Promise((res,rej): void => rf(path, { encoding: 'utf8', flag: 'r' } ,(err,data): void => err ? rej(err) : res(data)))
//const readFile = async (path: string) => await fsReadFile(path, 'utf-8')
const createFile = async (src: string, data: string) =>
  await fsWriteFile(src, data, { encoding: 'utf-8', flag: 'w' })

async function createDirectory(path: string): Promise<ResultFs> {
  try {
    await fsMkdir(dirname(path), { recursive: true })
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

    await createFile(filePath, jsonData)

    return { success: true }
  } catch (err) {
    return { success: false, error: err as Error }
  }
}

export { readFile, rfSync, createJsonFile, createFile, createDirectory }
