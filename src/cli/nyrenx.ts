#!/usr/bin/env node
import { Command } from 'commander'
const program = new Command()
import { readPackageJson } from '../lib/packageJsonUtils.js'
import { createProject, processSpinner } from '../createProject.js'
import examples from './examples.js'
import {
  createProjectWithOptions,
  type InitOpts,
} from '../createProjectWithOptions.js'
import { checkForUpdate } from '../lib/checkVersion.js'
import { runCommand } from '../lib/exec.js'
import cursor from '../lib/cursor.js'
import process from 'node:process'
const loadPackage = readPackageJson()

program
  .name('nyrenx-codeup')
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

program
  .command('init')
  .description('Create a new project with a template')
  .addHelpText('after', examples.init())
  .option('-n, --project-name [project-name]', 'Project name')
  .option('-t, --target [target]', 'Target language')
  .option('-m, --module [module]', 'Module name')
  .option('-d, --directory [directory]', 'Directory name')
  .option(
    '--fix [project-name]',
    'Quick Start the project without being guided through a series of prompts.'
  )
  .action(async options => {
    const opts = options as InitOpts
    Object.keys(opts).length !== 0
      ? await createProjectWithOptions(options)
      : await createProject()
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
