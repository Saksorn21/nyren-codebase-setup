import {
  writeFile as fsWriteFile,
  mkdir as fsMkdir,
} from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
export interface ResultFs {
  success: boolean
  error?: Error
}

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

export { readFileSync, createJsonFile, createFile, createDirectory }
