import { resolvePath } from './lib/pathHelper.js'
import { readPackageJson } from './lib/packageJsonUtils.js'
import { executeCommand } from './lib/executeCommand.js'
import which from 'which'
import { tools as t } from './lib/help.js'
import examples from './bin/examples.js'
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
const findOrFallbackToNpx = async (commandArgs: string[]) => {
  try {
    await which(commandArgs[0])
  } catch {
    t.log(
      t.prefixCli,
      t.toolIcon,
      t.text('#EF3054')(
        `Since the package: ${t.textWhit(commandArgs[0])} is missing, we will ${t.textWhit('install')} it temporarily using ${t.textWhit('npx')} automatically.`
      )
    )
    commandArgs.unshift('npx', '--yes')
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
    throw new Error(
      `Failed to read or process the package.json file: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
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
  const execCommand = command.endsWith('ts') ? runnersForType : 'node'
    commandArgs.unshift(execCommand)
}
const combineSubcommand = async (commandArgs: string[]) => {
  await findOrFallbackToNpx(commandArgs)
  const commandToCombine = commandArgs.slice(0, 3).join(' ')
  const args = commandArgs.slice(3)

  if (commandArgs[0] === 'npx') {
    commandArgs.length = 0
    commandArgs.push(commandToCombine, ...args)
  }
}

const processWatchCommand = async (commandArgs: string[]): Promise<void> => {
  switch (commandArgs[0]) {
    case 'bun':
      await combineSubcommand(commandArgs)
      commandArgs.unshift('nodemon', '--exec')
      break
    case 'node':
      commandArgs[0] = 'nodemon'
      break
  }
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
  const directoryPackageJson = options.prefix
    ? resolvePath(options.prefix, 'package.json')
    : 'package.json'
  const pkj: Record<string, string> = readPackageJson(
    resolvePath(process.cwd(), directoryPackageJson)
  )
  const commandArgsResult: Array<string> = []
  const messageRunners: Array<string> = []
  const { result: scriptMatchResult, commandArgs } = await findMatchingScript(
    [script],
    pkj.scripts
  )
  try {
    // nyrenx [script for package.json] Suppose there is nyrenx test
    if (scriptMatchResult === MatchResult.MATCH_FOUND) {
      await findOrFallbackToNpx(commandArgs)
      if (options.watch) await processWatchCommand(commandArgs)
      commandArgsResult.push(...commandArgs, ...forwardedArgs)
      messageRunners.push(
        `${t.text('#800080')('$')} ${pkj.name}@${pkj.version} ${script}`,
        t.text('#800080')('\n$'),
        ...commandArgs
      )
      // nyrenx ./path/to/file.<ts,js | cjs | mjs>
    } else {
      await prepareScriptCommand(commandArgs, pkj.type)
      // nyrenx --watch ./path/to/file.<ts,js | cjs | mjs>
      if (options.watch) await processWatchCommand(commandArgs)

      await findOrFallbackToNpx(commandArgs)

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
  t.log(`${t.text('d7d7ff').dim(messageRunners.join(' '))}`)

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
    t.log(
      t.prefixCli,
      t.error,
      t
        .text('#EF3054')
        .visible(
          `The command: ${command} is not a valid script. Please provide a valid script file: ${t.textWhit(`path/to/file.<ts | js | cjs | mjs>`)}`
        )
    )
    t.log(
      t.prefixCli,
      t.toolIcon,
      t.textWhit.dim(` Unknown command: ${t.textWhit(command)}`)
    )
    t.log(t.prefixCli, t.idea, t.textWhit.dim(`Try it:`))
    t.log(examples.dynamicCommand)
  }
  process.exit(1)
}
