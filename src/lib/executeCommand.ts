import which from 'which'
import execa, { ExecaError } from './exec.js'
import { resolvePath } from './pathHelper.js'
import { tools as t } from './help.js'

export async function executeCommand(commandArgs: string[], options?: any) {
  const directoryProject =
    Object.keys(options).length !== 0 && options.directory
      ? resolvePath(process.cwd(), options.directory)
      : process.cwd()

  try {
    try {
      commandArgs[0] = resolvePath(await which(`${commandArgs[0]}`))
    } catch (_) {
      t.log(
        `could not expand process command. using [${commandArgs.join(' ')}]`
      )
    }
    // expand any other commands that follow a --
    let expandNext = false
    for (let i = 0; i < commandArgs.length; i++) {
      if (commandArgs[i] === '--') {
        expandNext = true
      } else if (expandNext) {
        try {
          commandArgs[i] = resolvePath(await which(`${commandArgs[i]}`))
          t.log(`expanding process command to [${commandArgs.join(' ')}]`)
        } catch (_) {
          t.log(
            `could not expand process command. using [${commandArgs.join(' ')}]`
          )
        }
        expandNext = false
      }
    }
   t.log(`executing command [${commandArgs.join(' ')}]`)
    const { exitCode } = await execa(commandArgs[0], commandArgs.slice(1), {
     stdio: 'inherit',
      cwd: directoryProject,
    })

    if (exitCode !== 0) {
      t.log(`received exitCode ${exitCode}`)
      throw new Error(`Command exited with exit code ${exitCode}`)
    }
  } catch (e: unknown) {
    const error = e as ExecaError
    if (error.signal !== 'SIGINT' && error.signal !== 'SIGTERM') {
      if (error.code === 'ENOENT') {
        t.log(t.textRed(`Unknown command: ${t.textWhit(error.command)}`))
      } else if (error.message.includes('Command failed with exit code 1')) {
        t.log(
          t.textRed(
            `Command exited with exit code 1: ${t.textWhit.dim(error.command)}`
          )
        )
      } else {
        t.log(error.message)
      }
    }
    process.exit(error.exitCode || 1)
  }
}
