import {
  select,
  input as inputPrompt,
  confirm as confirmPrompt,
} from '@inquirer/prompts'
import chalk from 'chalk'
import { tools } from './help.js'
async function setTarget() {
  return await select({
    message: tools.text('#8787ff')('Select the target language'),
    choices: [
      {
        name: tools.text('#007ACC')('TypeScript'),
        value: 'typescript',
        description: tools.textWhit.dim(`- Use ${tools.text('#007ACC')('TypeScript')} for type safety and modern features.\n`),
      },
      {
        name: tools.text('#F7DF1E')('JavaScript'),
        value: 'javascript',
        description: tools.textWhit.dim(`- Use ${tools.text('#F7DF1E')('JavaScript')} for flexibility and widespread compatibility.\n`),
      }
    ],
  })
}
async function setModule() {
  return await select({
    message: tools.text('#af8700')('Select the module system'),
    choices: [
      {
        name: tools.text('#F7DF1E')('CommonJs'),
        value: 'commonjs',
        description: tools.textWhit.dim(`Use "type": ${tools.text('#F7DF1E')('\"commonJs\"')} for traditional ${tools.text('#8CC84B')('Node.js')} module support.\n`),
      },
      {
        name: tools.text('#8CCB3D')('Module'),
        value: 'module',
        description: tools.textWhit.dim(`Use "type": ${tools.text('#8CCB3D')('\"module\"')} for modern ${tools.text('#8CCB3D')('ES module')} syntax.\n`),
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

export { setTarget, setModule, input, confirm }
