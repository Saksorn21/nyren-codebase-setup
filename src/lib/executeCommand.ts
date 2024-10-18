import which from 'which'
import execa, { ExecaError, type ResultPromise, } from './exec.js' // lib execa for npm 

import { resolvePath } from './pathHelper.js'
import { tools as t } from './help.js'

// Centralize messages to reduce duplication
const messages = {
  notCommand: (command: string[]) =>
    t.textRed(`Could not expand process command. Using ${t.textWhit(`[${command.join(' ')}]`)}`),
  exitCodeMessage: (exitCode?: number) =>
    t.textRed(`Command exited with exit code ${exitCode}`)
}

// Handle signal-specific logic
async function signalHandler(signal: string, commandProcess: any) {
  t.log(`Received ${signal}`)
    if (commandProcess ) {
      t.log(`Sending ${signal} to command process`)
       commandProcess.kill(signal) // This should now work if commandProcess is the subprocess
    } else {
      t.log(`No valid process to kill for signal ${signal}`)
    }
}

// Expands command if prefixed by `--`
async function expandCommands(commandArgs: string[]) {
  let expandNext = false
  for (let i = 0; i < commandArgs.length; i++) {
    if (commandArgs[i] === '--') {
      expandNext = true
    } else if (expandNext) {
      try {
        commandArgs[i] = resolvePath(await which(commandArgs[i]))
        t.log(`Expanding process command to [${commandArgs.join(' ')}]`)
      } catch (_) {
        t.log(messages.notCommand(commandArgs))
      }
      expandNext = false
    }
  }
}

// Handles the main command execution logic
export async function executeCommand(commandArgs: string[], options: any = {}) {
  const directoryProject = options.directory
    ? resolvePath(process.cwd(), options.directory)
    : process.cwd()

  let commandProcess: Promise<ResultPromise>

  // Signal handlers
  const sigintHandler = () => signalHandler('SIGINT', commandProcess)
  const sigtermHandler = () => signalHandler('SIGTERM', commandProcess)

  try {
    // Resolve command and expand if necessary
    try {
      const whichCommand = await which(commandArgs[0])
      commandArgs[0] = resolvePath(whichCommand)
    } catch (_) {
      t.log(messages.notCommand(commandArgs))
    }

    await expandCommands(commandArgs)

    // Execute the command
    commandProcess =  execa(commandArgs[0], commandArgs.slice(1), {
      stdio: 'inherit',
      cwd: directoryProject,
    })
    process.on('SIGINT', async() =>  await signalHandler('SIGINT', commandProcess))
    process.on('SIGTERM', async() =>  signalHandler('SIGTERM', await commandProcess))

    const { exitCode } = await commandProcess
    if (exitCode !== 0) {
      t.log(messages.exitCodeMessage(exitCode))
      throw new Error(messages.exitCodeMessage(exitCode))
    }

  } catch (e: unknown) {
    handleCommandError(e as ExecaError, commandArgs)

  } finally {
    process.removeListener('SIGINT', async() =>  await signalHandler('SIGINT', await commandProcess))
    process.removeListener('SIGTERM',async () =>  await signalHandler('SIGTERM', await commandProcess))
  }
}

// Handles errors during execution
function handleCommandError(error: ExecaError, commandArgs: string[]) {
  if (error.signal !== 'SIGINT' && error.signal !== 'SIGTERM') {
    if (error.code === 'ENOENT') {
      t.log(t.textRed(`Unknown command: ${t.textWhit(error.command)}`))
    } else if (error.message.includes('Command failed with exit code 1')) {
      t.log(t.textRed(`Command exited with exit code 1: ${t.textWhit.dim(error.command)}`))
    } else {
      t.log(error.message)
    }
  }
  process.exit(error.exitCode || 1)
}