import utils from './utils/main.js'
import {
  readFile as rf,
  writeFile as wf,
  readFileSync as rfSync,
} from 'node:fs'
import type fs from 'node:fs'
import { formatDataPackageJson } from './packageJsonUtils.js'
export interface ResultFs {
  success: boolean
  error?: Error
}
const FS = {
  ENCODEING: 'utf-8',
} as const
const readFile = (path: fs.PathOrFileDescriptor): Promise<string> =>
  new Promise((res, rej) =>
    utils.fs.readFile(
      path,
      { encoding: FS.ENCODEING, flag: 'r' },
      (err, data) => (err ? rej(err) : res(data))
    )
  )
const createFile = (
  path: fs.PathOrFileDescriptor,
  data: string | NodeJS.ArrayBufferView
): Promise<void> =>
  new Promise((res, rej) =>
    utils.fs.writeFile(
      path,
      data,
      { encoding: FS.ENCODEING, flag: 'w' },
      err => (err ? rej(err) : res())
    )
  )

const readdir = (path: fs.PathLike): Promise<fs.Dirent[]> =>
  new Promise((res, rej) =>
    utils.fs.readdir(path, { withFileTypes: true }, (err, data) =>
      err ? rej(err) : res(data)
    )
  )
const exists = (path: fs.PathLike): Promise<boolean> =>
  utils.fs
    .access(path)
    .then(() => true)
    .catch(() => false)
const mkdir = (
  path: fs.PathLike,
  options?:
    | fs.Mode
    | (fs.MakeDirectoryOptions & { recursive?: boolean | null })
    | undefined
    | null
): Promise<string | undefined> =>
  new Promise((res, rej) =>
    utils.fs.mkdir(path, options, (err, made) => (err ? rej(err) : res(made)))
  )

async function createDirectory(path: string): Promise<ResultFs> {
  try {
    await mkdir(utils.path.dirname(path), { recursive: true })
    return { success: true }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
async function createJsonFile(
  filePath: string,
  data: Record<string, string>
): Promise<ResultFs> {
  try {
    const formatJson = formatDataPackageJson(data)
    let jsonData = ''

    if (utils.path.basename(filePath) === 'package.json') {
      jsonData = JSON.stringify(formatJson, null, 2)
    } else {
      jsonData = JSON.stringify(data, null, 2)
    }
    await createFile(filePath, jsonData)

    return { success: true }
  } catch (err) {
    return { success: false, error: err as Error }
  }
}

export {
  readdir,
  readFile,
  rfSync,
  createJsonFile,
  createFile,
  createDirectory,
  exists,
}
