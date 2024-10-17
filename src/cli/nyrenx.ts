#!/usr/bin/env node
import { Command } from 'commander'
const program = new Command()
import { readPackageJson } from '../lib/packageJsonUtils.js'
import { createProject, processSpinner } from '../createProject.js'
import { runAction } from '../runAction.js'
import examples from './examples.js'
import {
  createProjectWithOptions,
  fastCreateProject,
  type InitOpts,
} from '../createProjectWithOptions.js'
import { checkForUpdate } from '../lib/checkVersion.js'
import { runCommand } from '../lib/exec.js'
import cursor from '../lib/cursor.js'
import process from 'node:process'
const loadPackage = readPackageJson()

program
  .name('nyrenx')
  .description(loadPackage.description as string)
  .version(loadPackage.version as string)

// global Action hook
program
  .hook('preAction', () => {
    cursor.hide()
  })
  .hook('postAction', async () => {
    await checkForUpdate()
    cursor.show()
  })
program.command('run')
  .description('Project at runtime [nyrenx run -- yourcommand]')
  .arguments('[args...]')
  .action(function (...args) {
     runAction.apply(this, args)
  }
  )
// init
const initCommand = program.command('init')
  .description('Create a new project with a template')
  .usage('[options] [sub-command] -- [project-name target | module]')
  .addHelpText('after', examples.init())
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
  .description('Quick Start the project without being guided through a series of prompts.')
  .addHelpText('after', examples.init())
  .arguments('[args...]')
  .action(async (args: string[]) => {
await fastCreateProject(args)
  })

program
  .command('update')
  .description('Update the project to the latest version')
  .action(async () => {
    const command = await checkForUpdate()
    command === '' && process.exit(1)
    await processSpinner({
      start: 'Updating project...',
      success: 'Project updated successfully',
      fail: 'Failed to update project',
      callAction: runCommand(command),
    })
  })


await program.parseAsync(process.argv)
