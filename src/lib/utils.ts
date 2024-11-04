import { tools } from './help.js'
import utils from './utils/main.js'
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
export const validExtensionsFile = (
  file: string,
  ext: string[] = ['ts', 'js', 'cjs', 'mjs']
): boolean => ext.some(ext => file.endsWith(ext))
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
const isBrowser = (globalThis as any).window?.document !== undefined
const isWindows = !isBrowser && process.platform === 'win32'
export const clearConsole = async (title: string) => {
  const ESC = '\u001B['
  const clearScreen = '\u001Bc'
  const eraseScreen = ESC + '2J'
  const terminal = process.stdout
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows)
    //console.log(blank)
    //

    //readline.cursorTo(process.stdout, 0, 0)
    //readline.clearScreenDown(process.stdout)
    //process.stdout.write(blank)
    //
    const clearTerminal = isWindows
      ? `${eraseScreen}${ESC}0f`
      : // 1. Erases the screen (Only done in case `2` is not supported)
        // 2. Erases the whole screen including scrollback buffer
        // 3. Moves cursor to the top-left position
        // More info: https://www.real-world-systems.com/docs/ANSIcode.html
        `${eraseScreen}${ESC}3J${ESC}H`
    if (title) {
      console.log(title)
      //process.stdout.write(clearScreen);
      terminal.write(title)
    }
    process.on('beforeExit', code => {
      terminal.write(clearTerminal)
      console.log(code)
    })
  }
}
