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
import { checkForUpdate } from '../lib/checkVersion.js'
import { updateLatestVersion } from '../updateVersion.js'
import cursor from '../lib/cursor.js'
import process from 'node:process'
const packageJson = readPackageJson()



program
  .name('nyrenx')
  .description(packageJson.description as string)
  .version(packageJson.version as string)
  .allowUnknownOption()

// global
program
  .hook('preAction', () => {
    cursor.hide()
  })
  .hook('postAction', async () => {
    await checkForUpdate()
    cursor.show()
  })
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
  .option('-p, --prefix [directory]', 'directory to run the project in')
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
initCommand
  .command('quick')
  .alias('fast')
  .usage('[options] -- [project-name target | module]')
  .summary('Quick Start project')
  .description(
    'Quick Start the project without being guided through a series of prompts.'
  )
  .addHelpText('after', examples.init)
  .action(async function (this: Command, ...args: any) {
    fastCreateProject.apply(this, args)
  })

program
  .command('install')
  .alias('i')
  .usage('[options] -- [library]')
  .allowUnknownOption()
  .description('Installation libraries for the project on npm ')
  .addHelpText('after', examples.install)
  .option('-p, --prefix [directory]', 'directory to run the project in')
  .action(function (this: Command, ...args: any) {
    installAction.apply(this, args)
  })
program
  .command('update')
  .description('Update the project to the latest version')
  .action(async () => {
    await updateLatestVersion()
  })

await program.parseAsync(process.argv)
