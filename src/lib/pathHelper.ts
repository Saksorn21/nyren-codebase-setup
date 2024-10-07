import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

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
  let fullPath = join(...paths)

  // If path starts with ~, replace it with home directory
  if (fullPath.startsWith('~')) {
    fullPath = join(homedir(), fullPath.slice(1)) // Remove ~ and join with home directory
  }

  return fullPath
}

export { resolvePath, getDirname }
