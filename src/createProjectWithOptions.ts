import { type ResultFs } from './lib/fileSystem.js'
import { setModule, setTarget, input, confirm } from './lib/prompts.js'
import { presetSpinnerCreateFiles } from './lib/utils.js'
import { buildTemplateFiles, type ParseObj } from './lib/templateUtils.js'
import { runCommand } from './lib/exec.js'
import { processPackageJson } from './lib/processPackageJson.js'
import { help, tools, prefixCli } from './lib/help.js'
import cursor from './lib/cursor.js'
import { oraPromise, type Ora } from 'ora'
import process from 'node:process'

export interface OptsInits {
  projectName?: string
  target?: string
  module?: string
  directory?: string
}
async function createProjectWithOptions(options: OptsInits) {
   tools.log(
    `${prefixCli} ${tools.info} Setting up the project: ${tools.textOrange(JSON.stringify(options))}`)
}

export { createProjectWithOptions }
