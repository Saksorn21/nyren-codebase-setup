#!/usr/bin/env node
import { Command } from 'commander';
const program = new Command();
import {readPackageJson} from '../lib/packageJson'
import { createProject, OptsInits } from '../main'
const loadPackage = readPackageJson('./');
program
  .name('nyrenx')
  .description((loadPackage.description) as string)
  .version((loadPackage.version) as string);
program
  .command('init')
  .description('Create a new project with a template')
  .option('-n, --project-name [project-name]', 'Project name')
  .option('-v, --version [version]', 'Project version')
  .action(async (options: OptsInits ) => await createProject(options))

program.parse();