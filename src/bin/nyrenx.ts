#!/usr/bin/env node
import { Command } from 'commander'
const program = new Command()
import { readPackageJson } from '../lib/packageJsonUtils.js'
import { createProject } from '../createProject.js'
import { runAction } from '../runAction.js'
import { installAction } from '../installAction.js'
import { executeScriptDynamic } from '../executeScriptDynamic.js'
import examples from './examples.js'
import {
  createProjectWithOptions,
  fastCreateProject,
  type InitOpts,
} from '../createProjectWithOptions.js'
import { checkForUpdate, chackNodeVersion } from '../lib/checkVersion.js'
import { updateLatestVersion } from '../updateVersion.js'
import cursor from '../lib/cursor.js'
import process from 'node:process'

program
  .name('nyrenx')
  .version(
    readPackageJson().version,
    '-v, --version',
    'Output the current version.'
  )
  .helpOption('-h, --help', 'Output usage information.')
  .allowUnknownOption()
  .enablePositionalOptions()

// global
program
  .hook('preAction', () => {
    chackNodeVersion(readPackageJson().engines.node, readPackageJson().name)
    cursor.hide()
    
  })
  .hook('postAction', async () => {

    await checkForUpdate()
    cursor.show()
    
  })

program
  .usage('<command> [options]' + '\n' + examples.dynamicCommand)
  .option('-s, --silent', 'silent mode')
  .option('-p, --prefix [directory]', 'directory to run the project in')
  .option('-w, --watch', 'Watch for changes')
  .argument('[script]', 'The script to run for the project')
  .argument('[args...]', 'dynamic command arguments')
  .action(async (script: string) => {
    const rawArgs = process.argv.slice(3) // adjust the index based on where actual args start
    await executeScriptDynamic(program, script, rawArgs)
  })
program
  .command('run')
  .description('Project at runtime')
  .usage('[options] -- [yourcommand]')
  .action(async function (this: Command, ...args: any) {
    runAction.apply(this, args)
  })
// init
const initCommand = program
  .command('init')
  .description('Create a new project with a template')
  .usage('[options] [sub-command] -- [project-name target | module]')
  .addHelpText('after', examples.init)
  .option('-n, --project-name [project-name]', 'Project name')
  .option('-t, --target [target]', 'Target language')
  .option('-m, --module [module]', 'Module name')
  .option('-d, --directory [directory]', 'Directory name')
  .action(async (opts: InitOpts) => {
    Object.keys(opts).length !== 0
      ? await createProjectWithOptions(opts)
      : await createProject()
  })

initCommand.command('quick')
  .alias('fast')
  .usage('[options] -- [project-name target | module]')
  .summary('Quick Start project')
  .description(
    'Quick Start the project without being guided through a series of prompts.'
  )

  .addHelpText('after', examples.init)
  .action(async function (this: Command) {
    await fastCreateProject( this.args,{
      ...initCommand.parent?.opts(),
        ...this.parent?.opts(),
        ...this.opts()
    })
  })

program
  .command('install')
  .alias('i')
  .alias('add')
  .usage('[options] -- [library]')
  .allowUnknownOption()
  .description('Installation libraries for the project on npm ')
  .addHelpText('after', examples.install)
  // .option('-p, --prefix [directory]', 'directory to run the project in')
  .action(function (this: Command, ...args: any) {
    installAction.apply(this, args)
  })
program
  .command('update')
  .description('Update the project to the latest version')
  .action(async () => {
    await updateLatestVersion()
  })

program
  .command('help [command]')
  .description('Display help for [command]')
  .action((command) => command ? program.commands.find(c => c.name() === command)?.outputHelp() : program.outputHelp())

function removeDynamicHelpSection (lines: string[]) {
  let argumentsHelpIndex
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'Arguments:') {
      argumentsHelpIndex = i
      break
    }
  }
  if (argumentsHelpIndex) {
    lines.splice(argumentsHelpIndex, 4) // remove Arguments and the following 3 lines
  }

}
program.addHelpText('after', ' ')
program.addHelpText('before', 'Advanced: ')
program.addHelpText('after', '  pro                          🏆 pro')
program.addHelpText('after', '  ext                          🔌 extensions')

// dotenvx ext
program.helpInformation = function () {
  const originalHelp = Command.prototype.helpInformation.call(this)
  const lines = originalHelp.split('\n')

  removeDynamicHelpSection(lines)

  // Filter out the hidden command from the help output
  const filteredLines = lines.filter(line =>
    !line.includes('help [command]') 
  )

  return filteredLines.join('\n')
}
await program.parseAsync(process.argv)
