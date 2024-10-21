import { type ResultFs } from './lib/fileSystem.js'
import { setModule, setTarget, input, confirm } from './lib/prompts.js'
import { processSpinner, presetSpinnerCreateFiles } from './lib/spinner.js'
import { buildTemplateFiles, type ParseObj } from './lib/templateUtils.js'
import { resolvePath } from './lib/pathHelper.js'
import { processPackageJson } from './lib/processPackageJson.js'
import { help, tools } from './lib/help.js'
import { type InitOpts } from './createProjectWithOptions.js'
import { handleLibraryInstallation as install } from './installAction.js'

import process from 'node:process'

export interface Row {
  // It's the same.
  // Record<string, string | string[]>
  [name: string]: string | string[] | object
}

async function createProject(opts?: InitOpts) {
  let target = ''
  opts !== undefined && (target = opts?.target || (await setupTemplates()))

  target = !target ? await setupTemplates() : target

  const row = await processPackageJson(target, setUpModule, opts)
  const { templateCode } = row

  const isLibrary: boolean = await confirm(
    'Would you like to add more libraries?'
  )
  help.announcementOfResult(row.template, row.type, row.userDirectoryName)

  if (await confirm('Do you want to continue?')) {
    const copied = await processBuildTemplateFiles(
      templateCode,
      templateCode.baseFilesName,
      row.userDirectoryName
    )

    if (copied.success) {
      await handleLibraryInstallation(
        isLibrary,
        row.userDirectoryName as string
      )
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
  baseFilesName: string[],
  userDiretoryName: string
): Promise<ResultFs> {
  try {
    for (const diretoryName of baseFilesName) {
      await presetSpinnerCreateFiles(
        buildTemplateFiles(templateCode),
        resolvePath(userDiretoryName, diretoryName)
      )
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
  const directory = { directory: directoryName }
  if (isLibrary) {
    help.libraryEx()
    const libraries = await input('libraries', '')
    await install(libraries, directory)
    return
  } else {
    await install('--silent', directory)
    return
  }
}

export {
  createProject,
  handleLibraryInstallation,
  setUpModule,
  setupTemplates,
  processBuildTemplateFiles,
  processSpinner,
}
