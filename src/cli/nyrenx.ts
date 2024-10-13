#!/usr/bin/env node
import { Command } from 'commander'
const program = new Command()
import { readPackageJson } from '../lib/packageJsonUtils.js'
import { createProject, processSpinner } from '../main.js'
import { checkForUpdate } from '../lib/checkVersion.js'
import { runCommand } from '../lib/exec.js'
import cursor from '../lib/cursor.js'
const loadPackage = readPackageJson()

cursor.hide()
cursor.show()
program
  .name('nyrenx-codeup')
  .description(loadPackage.description as string)
  .version(loadPackage.version as string)

program
  .command('init')
  .description('Create a new project with a template')
  .action(async () => {
    await createProject()
    await checkForUpdate()
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

program.parseAsync()
