import {
  select,
  input as inputPrompt,
  confirm as confirmPrompt,
  checkbox,
  Separator,
} from '@inquirer/prompts'
import chalk from 'chalk'

async function checkBoxForLibraries(librariesName: string[]) {
  
  // for (const lib of librariesName){
  //    name: 'npm', value: 'npm' 
  // }
 return await checkbox({
    message: 'Select the libraries you want to include:',
     theme: { spinner: {
              interval: 80,
              frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
              
            }},
      choices: librariesName.map(lib => ({
        name: lib,
        value: lib
      })) 
 })
}

async function build() {
  return await select({
    message: chalk.hex('#8787ff').bold('Select a template'),
    choices: [
      {
        name: `${chalk.hex('#87afff').bold('TypeScript')}`,
        value: 'typescript',
        description: 'TypeScript template\n',
      },
      {
        name: `${chalk.hex('#d7af00').bold('JavaScript')}`,
        value: 'javascript',
        description: 'JavaScript template\n',
      },
      {
        name: `${chalk.rgb(0, 125, 156).bold('Go')}`,
        value: 'go',
        description: 'Go template\n',
      },
    ],
  })
}
async function setModule() {
  return await select({
    message: chalk.hex('#d7af87').bold('Select a module'),
    choices: [
      {
        name: `${chalk.hex('#d7af00').bold('CommonJs')}`,
        value: 'commonjs',
        description: ' "type": "commonJs" - CommonJs\n',
      },
      {
        name: `${chalk.hex('#d75f00').bold('Module')}`,
        value: 'module',
        description: ' "type": "module" - Esmodule\n',
      },
    ],
  })
}
async function input(
  title: string,
  defaultValue: string | string[]
): Promise<string> {
  const msg = { message: ` ${chalk.hex('#87d75f').bold(title)}:` }
  let preset
  if (typeof defaultValue === 'string' && defaultValue !== '') {
    preset = { ...msg, default: defaultValue }
  } else if (Array.isArray(defaultValue) && defaultValue.length >= 0) {
    preset = { ...msg }
  } else {
    preset = { ...msg }
  }
  return await inputPrompt(preset)
}
async function confirm(message: string): Promise<boolean> {
  return await confirmPrompt({
    message: `${chalk.hex('#ff00af').bold(message)}`,
  })
}

export { build, setModule, input, confirm, checkBoxForLibraries }
