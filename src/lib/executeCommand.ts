import which from 'which'
import execa, { ExecaError, type ResultPromise } from './exec.js' // lib execa for npm
// import onetime from 'onetime'
import type { SignalConstants } from 'node:os'
import { resolvePath, basename } from './pathHelper.js'
import { readPackageJson} from './packageJsonUtils.js'
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
    ? (() => {
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
      } catch {
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
  } catch {
    t.log(messages.notCommand(commandArgs))
  }
}

// Handles the main command execution logic
export async function executeCommand(
  commandArgs: string[],
  options: InputOptions
) {
  await handleCommandOptions(options)
  const directoryProject = options.prefix
    ? resolvePath(process.cwd(), options.prefix)
    : process.cwd()
  const silentMode = options.silent ? 'ignore' : 'inherit'
  let subProcess: ResultPromise, exitCode: number | undefined
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
    //nodemon
    process.on('SIGUSR2', () => signalHandler('SIGUSR2', subProcess))

    const { exitCode: subProcessExitCode } = await subProcess
    exitCode = subProcessExitCode ?? 0
    // Handle exit code
    if (exitCode !== 0) throw new Error(messages.exitCodeMessage(exitCode))
  } catch (e: unknown) {
    exitCode = (e as ExecaError).exitCode ?? 1
    handleCommandError(e as ExecaError, commandArgs)
  } finally {
    
    process.removeListener('SIGINT', () => signalHandler('SIGINT', subProcess))
    process.removeListener('SIGTERM', () =>
      signalHandler('SIGTERM', subProcess)
    )
t.log()
    process.on('exit', (code: number) => {
      const userScript = normalizedArgumentScript()
      const packageJsonScripts = readPackageJson(resolvePath(process.cwd(), 'package.json')).scripts
        const matchScript = packageJsonScripts[userScript] ? true : false
      console.log(code)
      if (matchScript !== undefined && code !== 0){
      t.log(`${t.textRed(`error`)}${t.textWhit.dim(`: script "${userScript}" exited with code ${code}`)}`)
   }
    })
    
  }
}

// Handles errors during execution
function handleCommandError(error: ExecaError, commandArgs: string[]) {
  if (error.signal !== 'SIGINT' && error.signal !== 'SIGTERM') {
    if (error.code === 'ENOENT') {
      t.log(t.textRed(`Unknown command: ${t.textWhit(error.command)}`))
    } else if (
      error.message.includes(`Command failed with exit code 1`)
    ) {
      t.log(
        t.textRed(`Command failed with exit code ${error.exitCode}: ${t.textWhit(normalizedCommand(commandArgs).join(' '))}
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
      t.log(t.error, t.text('D32F2F')(error.message))
    }
  }
}
// Change back to the original script: node_modules/.bin/nyrenx init => init
function normalizedArgumentScript(rawArgs: string[] = process.argv) {
  const command = normalizedCommand(rawArgs)
   const commandIndex = command.indexOf('nyrenx')
   const forwardedArgs = command.slice(commandIndex + 1)
  console.log('forwardedArgs',forwardedArgs,'command',command)
  return forwardedArgs[0]
}

// Change back to the original command: node_modules/.bin/cwd init  => cwd init
  function normalizedCommand(fileCommand: string[]): string[] {
    let expandNext = false;

    const removeExtensions = (files: string[]) => files.map(file => file.split('.')[0]);
    console.log(fileCommand)
    const firstCommand = basename(fileCommand[0]).split('.')[0]
    for (let i = 0; i < fileCommand.length; i++) {
      if (firstCommand === 'node' || firstCommand === 'nodemon' || firstCommand ==='bun') {
        
        fileCommand.shift();
      }
    if (i === 0 || expandNext) {
      fileCommand[i] = basename(fileCommand[i]);
      console.log(fileCommand)
    }

    // ตั้งค่าสถานะ expandNext เมื่อพบ "--"
    if (fileCommand[i] === '--') {
      expandNext = true;
    }
    }
    console.log(fileCommand)
    return removeExtensions(fileCommand);
}
async function handleCommandOptions(opts: InputOptions) {
   if (opts.silent){
     t.log(t.prefixCli, t.toolIcon, t.text('#F46036')(`Silent mode`))
   }
  if (opts.prefix){
    t.log(t.prefixCli, t.toolIcon, t.text('#F46036').dim(`The project will be run in the directory: ${t.textWhit(opts.prefix)}.`))
  }
}

