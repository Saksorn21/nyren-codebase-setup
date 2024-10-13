import { type ResultFs } from './lib/fileSystem.js'
import { setModule, setTarget, input, confirm } from './lib/prompts.js'
import { processSpinner, presetSpinnerCreateFiles } from './lib/spinner.js'
import { buildTemplateFiles, type ParseObj } from './lib/templateUtils.js'
import { runCommand } from './lib/exec.js'
import { processPackageJson } from './lib/processPackageJson.js'
import { help, tools } from './lib/help.js'
import {type InitOpts} from './createProjectWithOptions.js'
import process from 'node:process'


export interface Row {
  // It's the same.
  // Record<string, string | string[]>
  [name: string]: string | string[] | object
}

async function createProject(opts?: InitOpts) {
  let target = ''
  opts !== undefined && (target = opts?.target || await setTarget())
  target = !target ? await setupTemplates() : target
  const row = await processPackageJson(target, setUpModule, opts)
  const { templateCode } = row

  const isLibrary: boolean = await confirm(
    'Would you like to add more libraries?'
  )
  help.notification(row.template as string, row.type as string)
  help.warnOverWrite()

  if (await confirm('Do you want to continue?')) {
    const copied = await processBuildTemplateFiles(
      templateCode,
      templateCode.baseFilesName
    )

    if (copied.success) {
      await handleLibraryInstallation(isLibrary, templateCode.userDirectory as string)
    } else {
      tools.log(
        tools.error,
        tools.textRed(
          `Failed to copy the repository: ${tools.textWhit((copied.error as Error).message)}`
        )
      )
    
      process.exit(1)
    }
  } else {
    tools.log(tools.error, tools.textRed('Process canceled by the user'))
    process.exit(1)
  }
}

async function setupTemplates() {
  return processSpinner({
    start: 'Setting up target language',
    success: 'Target language setup completed successfully!',
    fail: 'Target language setup failed!',
    callAction: async () => await setTarget(),
  })
}
async function setUpModule(): Promise<string> {
  return processSpinner({
    start: 'Setting module',
    success: 'Module setup completed successfully!',
    fail: 'Module setup failed!',
    callAction: setModule(),
  })
}

async function processBuildTemplateFiles(
  templateCode: ParseObj<string>,
  baseFilesName: string[]
): Promise<ResultFs> {
  try {
    for (const diretoryName of baseFilesName) {
      await presetSpinnerCreateFiles(buildTemplateFiles(templateCode), diretoryName)
      
    }
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: error as Error }
  }
}

async function handleLibraryInstallation(
  isLibrary: boolean,
  directoryName: string
): Promise<void> {
  const basecommand = `cd ./${directoryName} && npm install`
  if (isLibrary) {
    help.libraryEx()
    const lib = await input('libraries', '')
    await processSpinner({
      start: 'Installing library',
      success: 'Library installation completed successfully!',
      fail: 'Library installation failed!',
      callAction: processExce(basecommand, lib),
    })
  } else {
    await processSpinner({
      start: 'npm install',
      success: 'npm installation completed successfully!',
      fail: 'npm installation failed!',
      callAction: processExce(basecommand),
    })
  }
}

async function processExce(command: string, library?: string): Promise<void> {
  const commandToExecute = library ? `${command} ${library}` : command

  const { output, error } = await runCommand(commandToExecute)

  if (error) {
    const msgError = `\n${tools.error} ${tools.textRed(`Execution failed: ${tools.textGrey(error)}`)}`

    throw msgError
  }
  tools.log(`${tools.textGrey(output)}\n`)
}

export { createProject, handleLibraryInstallation, setUpModule, setupTemplates, processBuildTemplateFiles, processExce, processSpinner }
