import { 
  select, 
  input as inputPrompt 
} from '@inquirer/prompts';

import chalk from 'chalk';
export async function build(){
  return await select({
    message: chalk.hex('#8787ff').bold('Select a template'),
    choices: [{
      name: `${chalk.blueBright.bold('Typescript')}`,
      value: 'typescript',
      description: 'Typescript template',
    }]
  })
}
export async function input(target: string) {
  return await inputPrompt({
    message: `Enter your package ${chalk.hex('#87d75f').bold(target)}: `
  })
}
