import which from 'which'
import execa, { ExecaError, type ResultPromise, } from './exec.js' // lib execa for npm 
import type {SignalConstants} from 'node:os';
import { resolvePath, basename } from './pathHelper.js'

import { tools as t } from './help.js'

// Centralize messages to reduce duplication
const messages = {
  notCommand: (command: string[]) =>
    t.textRed(`Could not expand process command. Using ${t.textWhit(`[${command.join(' ')}]`)}`),
  exitCodeMessage: (exitCode?: number) =>
    t.textRed(`Command exited with exit code ${exitCode}`)
}

// Handle signal-specific logic
async function signalHandler(signal: keyof  SignalConstants | number, subProcess: ResultPromise) {
  t.log(`Received ${signal}`)
    if (subProcess) {
      t.log(`Sending ${signal} to command process`)
          subProcess.kill(signal) 
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

  let subProcess: ResultPromise

  // Signal handlers
  
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
      subProcess =  execa(commandArgs[0], commandArgs.slice(1), {
      stdio: 'inherit',
        detached: true,
      preferLocal: true,
      cwd: directoryProject,
    })
    process.on('SIGINT', () => signalHandler('SIGINT', subProcess))
    process.on('SIGTERM', () => signalHandler('SIGTERM', subProcess))

    const { exitCode } = await subProcess
    if (exitCode !== 0) {
      t.log(messages.exitCodeMessage(exitCode))
      throw new Error(messages.exitCodeMessage(exitCode))
    }

  } catch (e: unknown) {
    handleCommandError(e as ExecaError, commandArgs)

  } finally {
    process.removeListener('SIGINT', () => signalHandler('SIGINT', subProcess))
    process.removeListener('SIGTERM', () => signalHandler('SIGTERM', subProcess))
  }
}
function normalizedCommand(fileCommand: string[]): string {
  
    fileCommand[0] = basename(fileCommand[0])
   let expandNext = false
   for (let i = 0; i < fileCommand.length; i++) {
     if (fileCommand[i] === '--') {
       expandNext = true
     } else if (expandNext) {
       try {
             fileCommand[i] = basename(fileCommand[i])
         t.log(`Expanding process command to [${fileCommand.join(' ')}]`)
       } catch (_) {
         t.log(messages.notCommand(fileCommand))
       }
       expandNext = false
     }
   }
  return fileCommand.join(' ')
}

// Handles errors during execution
function handleCommandError(error: ExecaError, commandArgs: string[]) {
  if (error.signal !== 'SIGINT' && error.signal !== 'SIGTERM') {
    if (error.code === 'ENOENT') {
      t.log(t.textRed(`Unknown command: ${t.textWhit(error.command)}`))
    } else if (error.message.includes('Command failed with exit code 1')) {
      t.log(t.textRed(`Command exited with exit code 1: ${t.textWhit.dim(normalizedCommand(commandArgs))}`))
    }else if (error.message.includes('Command failed with exit code 0')) {
      t.log(t.textRed(`Command failed with exit code 0: ${t.textWhit(normalizedCommand(commandArgs))}
  ${t.textWhit('debugger: ')}${t.error} ${t.textWhit.dim(error.originalMessage)}
      `))
    } else {
      t.log(error.message)
    }
  }
  process.exit(error.exitCode || 1)
}