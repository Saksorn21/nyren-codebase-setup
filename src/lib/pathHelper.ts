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
const findLocalBinaryPath = async (bin: string): Promise<string> => {
  
  const __dirname = getDirname(import.meta.url);
  const localBinPath = resolvePath(__dirname, 'node_modules', '.bin');
  const PATH = `${localBinPath}:${process.env.PATH}`;

  try {
    const resolvedPath = await which(bin, { path: PATH });
    return resolvedPath;
  } catch {
    return resolvePath(localBinPath, bin);
  }
}
const trimCwd = (fullPaths: string | string[]): string => typeof fullPaths === 'string'? relative(process.cwd(), fullPaths) : fullPaths.map(path => relative(process.cwd(), path)).join(' ')

export { resolvePath, getDirname, dirname, basename, findLocalBinaryPath, trimCwd }
