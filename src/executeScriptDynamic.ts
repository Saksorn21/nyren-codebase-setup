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
  directory?: string
): Promise<{ result: MatchResult; commandArgs: string[] }> => {
  try {
    const directoryPackageJson = directory
      ? resolvePath(directory, 'package.json')
      : 'package.json'
    const scripts: Record<string, string> = readPackageJson(
      resolvePath(process.cwd(), directoryPackageJson)
    ).scripts 

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
const prepareScriptCommand = async (commandArgs: string[]): Promise<void> => {
  const command = commandArgs[0]

  // ตรวจสอบว่าเป็นคำสั่งที่ถูกต้องหรือไม่
  const isValidCommand =
    command.endsWith('ts') ||
    command.endsWith('js') ||
    command.endsWith('cjs') ||
    command.endsWith('mjs')

  if (!isValidCommand) {
   throw TypeError('Invalid prepareScriptCommand', {cause: command})
  }

  const execCommand = command.endsWith('ts') ? 'bun' : 'node'
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
    program.commands.map(command => ((command) as any)._name)
    process.exit(1)
  }
  
  const options = program.opts()
  const commandArgsResult = []
  // construct the full command line manually including flags
  const commandIndex = rawArgs.indexOf(script)
  const forwardedArgs = rawArgs.slice(commandIndex + 1)
console.log(forwardedArgs)
  const { result: scriptMatchResult, commandArgs } = await findMatchingScript(
    [script],
    options.prefix
  )
  try {
     
  
  // nyrenx [script for package.json] Suppose there is nyrenx test
  if (scriptMatchResult === MatchResult.MATCH_FOUND) {
    await findOrFallbackToNpx(commandArgs)
    if (options.watch) await processWatchCommand(commandArgs)
    commandArgsResult.push(...commandArgs, ...forwardedArgs)
    // nyrenx ./path/to/file.<ts,js | cjs | mjs>
  } else {
    await prepareScriptCommand(commandArgs)
    // nyrenx --watch ./path/to/file.<ts,js | cjs | mjs>
    if (options.watch) await processWatchCommand(commandArgs)

    await findOrFallbackToNpx(commandArgs)
    
    commandArgsResult.push(...commandArgs, ...forwardedArgs)
  }
} catch (error) {
    
    handleCommandError(error, commandArgs)
    process.exit(1)
}
  t.log(
    t.prefixCli,
    t.text('#8390FA')(
      `${t.toolIcon} run ${t.textWhit(script)} ${t.text('#6B1D70')('$')} ${t.textWhit.dim(commandArgsResult.join(' '))}`
    )
  )
  await executeCommand(commandArgsResult,options)
}
function handleCommandError(error: Error | unknown, commandArgs: string[]) {
  const err = error instanceof Error ? error.message : error instanceof TypeError ? error.message : 'Unknown error'
  const command = commandArgs.join(' ')
  if (err === 'Invalid prepareScriptCommand'){
    t.log(
       t.prefixCli,
       t.error,
       t.text('#EF3054')(
         `The command: ${command} is not a valid script. Please provide a valid script file: ${t.textWhit(`path/to/file.<ts | js | cjs | mjs>`)}`
       )
     )
     t.log(
       t.prefixCli,
       t.toolIcon,
       t.textWhit.dim(` Unknown command: ${t.textWhit(command)}`))
     t.log(
       t.prefixCli,
       t.idea,
       t.textWhit.dim(`Try it:`))
    t.log(examples.dynamicCommand)
  }
  process.exit(1)
   
}

