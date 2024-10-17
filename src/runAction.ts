import { executeCommand } from './lib/executeCommand.js'
import { tools as t } from './lib/help.js'
export async function runAction() {
  const commandArgs = this.args
  
  await executeCommand(commandArgs)
}
