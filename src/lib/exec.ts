import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Runs a command in the shell and returns the result.
 * This function uses `exec` from Node.js to run the command.
 * 
 * @param {string} command - The shell command to execute, e.g., 'npm i'.
 * @returns {Promise<void>} - Resolves when the command is executed, or rejects if there's an error.
 * 
 * Example:
 * ```ts
 * await runCommand('npm i');
 * ```
 */
export async function runCommand(command: string): Promise<void> {
  try {
    // Rename stdout to 'output' for easier understanding
    const { stdout: output, stderr: errorOutput } = await execAsync(command);

    if (errorOutput) {
      console.error(`Error Output: ${errorOutput}`);
    }

    console.log(`Output: ${output}`);
  } catch (error) {
    console.error(`Execution failed: ${(error as Error).message}`);
  }
}

