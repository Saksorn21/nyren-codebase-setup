import which from 'which'
import execa, { ExecaError, type ResultPromise } from './exec.js' // lib execa for npm
import onetime from 'onetime'
import type { SignalConstants } from 'node:os'
import { resolvePath, basename } from './pathHelper.js'

import { tools as t } from './help.js'
interface InputOptions {
  prefix?: string
  silent?: boolean
}
// Centralize messages to reduce duplication
const messages = {
  notCommand: (command: string[]) =>
    t.textRed(
      `Could not expand process command. Using ${t.textWhit(`[${command.join(' ')}]`)}`
    ),
  exitCodeMessage: (exitCode?: number) =>
    t.textRed(`Command exited with exit code ${t.textWhit(exitCode)}`),
}

// Handle signal-specific logic
const signalHandler = (
  signal: keyof SignalConstants | number,
  subProcess: ResultPromise
) =>
  subProcess
    ? onetime(() => {
        t.log(
          `\n${t.warning} ${t.textOrange(`Sending ${t.textWhit(signal)} to command process...`)}`
        )
        subProcess.kill(signal)
      })()
    : (() => {
        t.log(
          `\n${t.warning}${t.textOrange(`No valid process to kill for signal ${t.textWhit(signal)}`)}.`
        )
      })()

// Expands command if prefixed by `--`
async function expandCommands(commandArgs: string[]) {
  let expandNext = false
  for (let i = 0; i < commandArgs.length; i++) {
    if (commandArgs[i] === '--') {
      expandNext = true
    } else if (expandNext) {
      try {
        commandArgs[i] = resolvePath(await which(commandArgs[i]))
        t.log(
          t.textLightSteelBlue1(
            `Expanding process command to [${t.textWhit(commandArgs.join(' '))}]`
          )
        )
      } catch (_) {
        t.log(messages.notCommand(commandArgs))
      }
      expandNext = false
    }
  }
}
// Resolve command and expand if necessary
async function whichCommand(commandArgs: string[]) {
  try {
    const whichCommand = await which(commandArgs[0])
    commandArgs[0] = resolvePath(whichCommand)
  } catch (_) {
    t.log(messages.notCommand(commandArgs))
  }
}

// Handles the main command execution logic
export async function executeCommand(
  commandArgs: string[],
  options: InputOptions
) {
  const directoryProject = options.prefix
    ? resolvePath(process.cwd(), options.prefix)
    : process.cwd()
  const silentMode = options.silent ? 'ignore' : 'inherit'
  options.silent
    ? t.log(t.prefixCli, t.toolIcon, t.text('#F46036')(`Silent mode`))
    : null
  let subProcess: ResultPromise
  try {
    await whichCommand(commandArgs)
    await expandCommands(commandArgs)

    // Execute the command
    subProcess = execa(commandArgs[0], commandArgs.slice(1), {
      stdio: silentMode,
      detached: true,
      preferLocal: true,
      cwd: directoryProject,
    })

    process.on('SIGINT', () => signalHandler('SIGINT', subProcess))
    process.on('SIGTERM', () => signalHandler('SIGTERM', subProcess))

    const { exitCode } = await subProcess
    if (exitCode !== 0) throw new Error(messages.exitCodeMessage(exitCode))
  } catch (e: unknown) {
    handleCommandError(e as ExecaError, commandArgs)
  } finally {
    process.removeListener('SIGINT', () => signalHandler('SIGINT', subProcess))
    process.removeListener('SIGTERM', () =>
      signalHandler('SIGTERM', subProcess)
    )
  }
}
// Change back to the original command: node_modules/.bin/cwd -> cwd
function normalizedCommand(fileCommand: string[]): string {
  fileCommand[0] = basename(fileCommand[0])
  let expandNext = false
  for (let i = 0; i < fileCommand.length; i++) {
    if (fileCommand[i] === '--') {
      expandNext = true
    } else if (expandNext) {
      fileCommand[i] = basename(fileCommand[i])
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
      t.log(
        t.textRed(`Command failed with exit code 1: ${t.textWhit(normalizedCommand(commandArgs))}
      
      `)
      )
    } else if (error.message.includes('Command failed with exit code 0')) {
      t.log(
        t.textRed(`Command failed with exit code 0: ${t.textWhit(normalizedCommand(commandArgs))}
  ${t.textWhit('debugger: ')}${t.error} ${t.textWhit.dim(error.originalMessage ? error.originalMessage : error.message)}
      `)
      )
    } else if (
      error.message.includes('Attempted to assign to readonly property.')
    ) {
      t.log(
        t.warning,
        t.textRed(
          `Check command syntax
    ${t.textWhit('debugger: ')}${t.error} ${t.textWhit.dim(error.message)}
      `
        )
      )
    } else {
      t.log(t.error, t.text('#F46036')(error.message))
      t.log(t.text('#F46036')(error?.exitCode))
    }
  }
  process.exit(error.exitCode || 1)
}
