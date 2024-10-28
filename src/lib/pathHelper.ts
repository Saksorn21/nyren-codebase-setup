import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename, resolve, relative } from 'node:path'
import which from 'which'
function getDirname(metaUrl: string): string {
  const __filename = fileURLToPath(metaUrl)
  return dirname(__filename)
}

/**
 * Resolves and normalizes a file path.
 * If the path starts with `~`, it is replaced with the user's home directory.
 *
 * @param {...string[]} paths - The parts of the file path.
 * @returns {string} The resolved file path.
 */
function resolvePath(...paths: string[]): string {
  let fullPath = resolve(...paths)

  // If path starts with ~, replace it with home directory
  if (fullPath.startsWith('~')) {
    fullPath = join(homedir(), fullPath.slice(1)) // Remove ~ and join with home directory
  }

  return fullPath
}
/**
 * Normalize and validate path according to the operating system.
 * @param {string} inputPath - The path input to process.
 * @returns {string | null} - The normalized path if valid, or null if invalid.
 */
function processUserPath(inputPath: string): string | null {
  // Validate the path based on OS-specific restrictions
  if (!validatePath(inputPath)) {
    console.error(
      'Error: Path contains invalid characters for the current operating system.'
    )
    return null
  }
  // Normalize path to be OS-compatible
  return normalizePath(inputPath)
}

/**
 * Normalize path to be compatible with the operating system.
 * @param {string} inputPath - The input path to normalize.
 * @returns {string} - The normalized path.
 */
const normalizePath = (inputPath: string): string =>
  process.platform === 'win32'
    ? inputPath.replace(/\//g, '\\')
    : inputPath.replace(/\\/g, '/')

/**
 * Validate path for OS-specific invalid characters.
 * @param {string} inputPath - Path to validate.
 * @returns {boolean} - True if the path is valid, otherwise false.
 */
const validatePath = (inputPath: string): boolean | RegExp =>
  process.platform === 'win32'
    ? /[<>:"/\\|?*]/g // Windows restricted characters
    : /[\0]/g // Null character for Unix-based systems
        .test(inputPath) // Unix restricted characters

const findLocalBinaryPath = async (bin: string): Promise<string> => {
  const __dirname = getDirname(import.meta.url)
  const localBinPath = resolvePath(__dirname, 'node_modules', '.bin')
  const PATH = `${localBinPath}:${process.env.PATH}`

  try {
    const resolvedPath = await which(bin, { path: PATH })
    return resolvedPath
  } catch {
    return resolvePath(localBinPath, bin)
  }
}
const trimCwd = (fullPaths: string | string[]): string =>
  typeof fullPaths === 'string'
    ? relative(process.cwd(), fullPaths)
    : fullPaths.map(path => relative(process.cwd(), path)).join(' ')

export {
  resolvePath,
  getDirname,
  dirname,
  basename,
  findLocalBinaryPath,
  trimCwd,
  processUserPath,
}
