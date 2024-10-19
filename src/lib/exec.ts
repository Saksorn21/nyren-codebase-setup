import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import {
  execa as execa_,
  ExecaError,
  type ResultPromise,
  type Options,
} from 'execa'
interface OutPutResult {
  output: string
  error?: string
}
const execAsync = promisify(exec)

/**
 * Runs a command in the shell and returns the result.
 * This function uses `exec` from Node.js to run the command.
 *
 * @param {string} command - The shell command to execute, e.g., 'npm i'.
 * @returns {Promise<OutPutResult>} - Resolves when the command is executed, or rejects if there's an error.
 *
 * Example:
 * ```ts
 * await runCommand('npm i');
 * ```
 */
export async function runCommand(command: string): Promise<OutPutResult> {
  try {
    // Rename stdout to 'output' for easier understanding
    const { stdout: output, stderr: errorOutput } = await execAsync(command)

    if (errorOutput) {
      return { output: '', error: errorOutput }
    }
    return { output }
  } catch (error) {
    return { output: '', error: (error as Error).message }
  }
}
const execa = (
  file: string | URL,
  args: string[],
  options?: Options
): ResultPromise => execa_(file, args, options)

export { ExecaError }
export type {  ResultPromise, }
export default execa
