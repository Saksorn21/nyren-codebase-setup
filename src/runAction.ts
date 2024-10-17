import { executeCommand } from './lib/executeCommand.js'
import { tools as t } from './lib/help.js'
export async function runAction(args: any) {
  console.log(args)
  const commandArgs = args
  const commandIndex = process.argv.indexOf('--')
  if (commandIndex === -1 || commandIndex === process.argv.length - 1) {
    t.log(t.textRed(`${t.idea} missing command after ${t.textWhit.dim(`[nyrenx run --]`)}`))
    t.log(t.textRed(` ${t.info}  get help: ${t.textWhit.dim(`[nyrenx run --help]`)}`))
    t.log(t.textRed(` ${t.info}    or try: ${t.textWhit.dim(`[nyrenx run --npm run dev]`)}`))
    process.exit(1)
  }else{
  await executeCommand(commandArgs)
  }
}