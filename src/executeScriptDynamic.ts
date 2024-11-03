import { resolvePath, findLocalBinaryPath } from './lib/pathHelper.js'
import { readPackageJson } from './lib/packageJsonUtils.js'
import { executeCommand } from './lib/executeCommand.js'
import which from 'which'
import { tools as t } from './lib/help.js'
import examples from './bin/examples.js'
import { monitorChanges } from './lib/watch/fileWatcher.js'
import utils from './lib/utils/main.js'
import { type Command } from 'commander'

const enum MatchResult {
  MATCH_FOUND,
  NO_MATCH,
}
const whichRunner = async (runner: string) => {
  try {
    await which(runner)
    return runner
  } catch {
    return null
  }
}
const findMatchingScript = async (
  commandArgs: string[],
  scripts: string
): Promise<{ result: MatchResult; commandArgs: string[] }> => {
  try {
    for (const [key, value] of Object.entries(scripts)) {
      if (commandArgs[0] === key) {
        commandArgs.length = 0
        commandArgs.push(...value.split(' '))
        return { result: MatchResult.MATCH_FOUND, commandArgs }
      }
    }
    return { result: MatchResult.NO_MATCH, commandArgs }
  } catch (error) {
    utils.log.error((error as Error).message)
    process.exit(1)
  }
}
const prepareScriptCommand = async (
  commandArgs: string[],
  projectType: string = 'commonjs'
): Promise<void> => {
  const command = commandArgs[0]

  const validExtensions = ['ts', 'js', 'cjs', 'mjs']
  const isValidCommand = validExtensions.some(ext => command.endsWith(ext))

  if (!isValidCommand) {
    throw TypeError('Invalid prepareScriptCommand')
  }
  // Some users encountered 'ERR_UNKNOWN_FILE_EXTENSION' errors when using ts-node with ESModule projects.
  // To address this issue, we default to using 'bun' for ESModule projects as it handles both TypeScript and JavaScript smoothly.
  const runnersForType: string =
    projectType === 'module' ? 'bun' : ((await whichRunner('ts-node')) ?? 'bun')

  // If the file ends with .ts, use ts-node or bun based on the project type.
  // For other file extensions (.js, .cjs, .mjs), use node to execute the script.
  const execCommand = await findLocalBinaryPath('bun')
  commandArgs.unshift(execCommand)
}

// follwing is the main function Try it nyrenx dev or nyrenx --watch index.ts
export async function executeScriptDynamic(
  program: Command,
  script: string,
  rawArgs: string[]
) {
  if (!script) {
    program.outputHelp()
    program.commands.map(command => (command as any)._name)
    process.exit(1)
  }

  const options = program.opts()
  // construct the full command line manually including flags
  const commandIndex = rawArgs.indexOf(script)
  const forwardedArgs = rawArgs.slice(commandIndex + 1)
  if (forwardedArgs.includes('--watch')) {
    options.watch = true
  }
  const cwd = options.prefix
    ? resolvePath(process.cwd(), options.prefix)
    : process.cwd()
  const directoryPackageJson = options.prefix
    ? resolvePath(cwd, 'package.json')
    : resolvePath(cwd, 'package.json')

  const pkj: Record<string, string> = readPackageJson(directoryPackageJson)
  const commandArgsResult: Array<string> = []
  const messageRunners: Array<string> = []
  const { result: scriptMatchResult, commandArgs } = await findMatchingScript(
    [script],
    pkj.scripts
  )
  try {
    // nyrenx [script for package.json] Suppose there is nyrenx test
    if (scriptMatchResult === MatchResult.MATCH_FOUND) {
      if (options.watch) {
        return await monitorChanges({
          cwd: cwd,
          scriptPath: commandArgs[1],
          ...options,
        })
      }

      commandArgsResult.push(...commandArgs, ...forwardedArgs)
      commandArgs[0] = 'nyrenx'
      messageRunners.push(
        `${utils.color.hex('#800080')('$')} ${pkj.name}@${pkj.version} ${script}`,
        t.text('#800080')('\n$'),
        ...commandArgs
      )
      // nyrenx ./path/to/file.<ts,js | cjs | mjs>
    } else {
      await prepareScriptCommand(commandArgs, pkj.type)
      // nyrenx --watch ./path/to/file.<ts,js | cjs | mjs>
      if (options.watch) {
        return await monitorChanges({
          cwd: cwd,
          scriptPath: commandArgs[1],
          ...options,
        })
      }

      commandArgsResult.push(...commandArgs, ...forwardedArgs)
      messageRunners.push(
        t.text('#800080')('$'),
        'nyrenx',
        script,
        ...forwardedArgs
      )
    }
  } catch (error) {
    handleCommandError(error, commandArgs)
    process.exit(1)
  }

  utils.log.info(`${t.text('d7d7ff').dim(messageRunners.join(' '))}`)

  await executeCommand(commandArgsResult, options)
}
function handleCommandError(error: Error | unknown, commandArgs: string[]) {
  const err =
    error instanceof Error
      ? error.message
      : error instanceof TypeError
        ? error.message
        : 'Unknown error'
  const command = commandArgs.join(' ')
  if (err === 'Invalid prepareScriptCommand') {
    utils.log.fail(
      utils.icon.error +
        utils.color
          .hex('#EF3054')
          .visible(
            ` The command: ${command} is not a valid script. Please provide a valid script file: ${t.textWhit(`path/to/file.<ts | js | cjs | mjs>`)}`
          )
    )
    utils.log.fail(
      utils.icon.tool +
        t.textWhit.dim(` Script not found "${t.textWhit(command)}"`)
    )
    utils.log.fail(t.idea + t.textWhit.dim(` Try it:`))
    utils.log.fail(examples.dynamicCommand)
    process.exit(2)
  }
  process.exit(1)
}
