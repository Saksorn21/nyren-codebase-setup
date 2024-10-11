#!/usr/bin/env node
import { Command } from 'commander'
const program = new Command()
import { readPackageJson } from '../lib/packageJsonUtils.js'
import { createProject } from '../main.js'

const loadPackage = readPackageJson()

program
  .name('nyrenx-codeup')
  .description(loadPackage.description as string)
  .version(loadPackage.version as string)

program
  .command('init')
  .description('Create a new project with a template')
  .action(async () => await createProject())

program.parse()
