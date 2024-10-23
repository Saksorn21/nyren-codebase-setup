import { tools } from './help.js'
import { resolvePath } from './pathHelper.js'
import ansiRegex from 'ansi-regex'
export async function fetchToJson(
  url: string
): Promise<Record<string, string>> {
  try {
    const response = await fetch(url)
    const templateCode = await response.json()
    return templateCode as Record<string, string>
  } catch (e) {
    tools.log(
      tools.error,
      tools.textRed(
        `Failed to unable to connect: ${tools.textWhit((e as Error).message)}`
      )
    )
    return {}
  }
}

export const validUserDirectoryPath = (
  path: string = process.cwd(),
  directoryName?: string
): string => (directoryName ? resolvePath(path, directoryName) : path)

/**
 * @param {string} str - Project name to be transformed.
 * @returns {string} - Returns a valid folder name.
 * @description - Transforms a project name into a folder-friendly format. If the input starts with '@' and contains '/',
 *                the '@' is removed and all '/' characters are replaced with '-'. The result is suitable for use as a folder name.
 * @example
 * // @nyren/codebase-setup => nyren-codebase-setup
 * // example/project => example-project
 */
export const formatProjectFolderName = (str: string): string =>
  str.startsWith('@') && str.includes('/')
    ? str.replace(/^@/, '').replace(/\//g, '-')
    : str

export const clearAnsiCodes = (str: string): string =>
  typeof str === 'string'
    ? (() => str.replace(ansiRegex(), ''))()
    : (() => {
        throw new TypeError(`Expected a 'string', got '${typeof str}'`)
      })()
