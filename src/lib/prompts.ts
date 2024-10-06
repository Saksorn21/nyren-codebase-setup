import { 
  select, 
  input as inputPrompt ,
  confirm as confirmPrompt,
} from '@inquirer/prompts';

import chalk from 'chalk';
export async function build(){
  return await select({
    message: chalk.hex('#8787ff').bold('Select a template'),
    choices: [{
      name: `${chalk.hex('#87afff').bold('TypeScript')}`,
      value: 'typescript',
      description: 'TypeScript template\n',
    },{
      name: `${chalk.hex('#d7af00').bold('JavaScript')}`,
      value: 'javascript',
      description: 'JavaScript template\n',
    }]
  })
}
export async function setModule(){
  return await select({
    message: chalk.hex('#d7af87').bold('Select a module'),
    choices: [{
      name: `${chalk.hex('#d7af00').bold('CommonJs')}`,
      value: 'commonjs',
      description: ' "type": "commonJs" - CommonJs',
      
    },{
      name: `${chalk.hex('#d75f00').bold('Module')}`,
        value: 'module',
        description: ' "type": "module" - Esmodule',
    }
             ]
  })
}
export async function input(target: string): Promise<string> {
  return await inputPrompt({
    message: ` ${chalk.hex('#87d75f').bold(target)}:`
  })
}
export async function confirm(message: string): Promise<boolean>{
  return await confirmPrompt({
    message: `${chalk.hex('#ff00af').bold(message)}`
  })
}