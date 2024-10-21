import { resolvePath } from './lib/pathHelper.js'
import { readPackageJson } from './lib/packageJsonUtils.js'
import { executeCommand } from './lib/executeCommand.js'
import { tools as t } from './lib/help.js'
import { type Command } from 'commander'
export async function runDynamic(
  program: Command,
  script: string,
  rawArgs: string[]
) {
  if (!script) {
    program.outputHelp()
    process.exit(1)
  }
  const scripts = readPackageJson(
    resolvePath(process.cwd(), 'package.json')
  ).scripts
  // construct the full command line manually including flags
  const commandIndex = rawArgs.indexOf(script)
  const forwardedArgs = rawArgs.slice(commandIndex + 1)
  let matchScriptCommand: string | undefined = undefined
  console.debug('forwardedArgs', forwardedArgs)
  console.debug('scripts', scripts)

  for (const [key, value] of Object.entries(scripts)) {
    if (script === key) {
      matchScriptCommand = value
      break
    }
  }
  if (!matchScriptCommand) {
    t.log(
      t.textRed(`${t.error} script: ${t.textWhit.dim(`[${script}] not found`)}`)
    )
    process.exit(1)
  }
  const commandArgs = [...matchScriptCommand.split(' '), ...forwardedArgs]
  console.debug('commandArgs', commandArgs)
  await executeCommand(commandArgs)
  console.debug('forwardedArgs', forwardedArgs)
}
