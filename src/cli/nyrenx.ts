#!/usr/bin/env node
import { Command } from 'commander'
const program = new Command()
import { readPackageJson } from '../lib/packageJsonUtils.js'
import { createProject } from '../main.js'
import { checkForUpdate } from '../lib/checkVersion.js'
import { runCommand } from '../lib/exec.js'
const loadPackage = readPackageJson()

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
    await runCommand(command)
  })

program.parse()
