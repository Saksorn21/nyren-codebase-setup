import { type ResultFs } from './lib/fileSystem.js'
import { setModule, setTarget, input, confirm } from './lib/prompts.js'
import { processSpinner, presetSpinnerCreateFiles } from './lib/spinner.js'
import { buildTemplateFiles, type ParseObj } from './lib/templateUtils.js'
import { runCommand } from './lib/exec.js'
import { processPackageJson } from './lib/processPackageJson.js'
import { help, tools } from './lib/help.js'
import { type InitOpts } from './createProjectWithOptions.js'
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
  help.notification(row.template as string, row.type as string)
  help.warnOverWrite()

  if (await confirm('Do you want to continue?')) {
    const copied = await processBuildTemplateFiles(
      templateCode,
      templateCode.baseFilesName
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
  baseFilesName: string[]
): Promise<ResultFs> {
  try {
    for (const diretoryName of baseFilesName) {
      await presetSpinnerCreateFiles(
        buildTemplateFiles(templateCode),
        diretoryName
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
  const baseCommand = `cd ./${directoryName} && npm install`
  const devDepsCommand = ` && npm install --save-dev `
  if (isLibrary) {
    help.libraryEx()
    const lib = await input('libraries', '')
    const { deps, devDeps } = await analyzeLibraries(lib)
    await processSpinner({
      start: `Installing libraries: ${tools.textWhit(deps)}${devDeps ? ` and dev libraries: ${tools.textWhit(devDeps)}` : ''}`,
      success: `Libraries: ${tools.textWhit(deps)}${devDeps ? ` and dev libraries: ${tools.textWhit(devDeps)}` : ''} installed successfully!`,
      fail: 'Library installation failed!',
      callAction: async () => {
        const commandDev = devDeps && devDepsCommand + devDeps
        await processExce(baseCommand, deps + (commandDev ?? ''))
      },
    })
  } else {
    await processSpinner({
      start: 'npm install',
      success: 'npm installation completed successfully!',
      fail: 'npm installation failed!',
      callAction: processExce(baseCommand),
    })
  }
}
async function analyzeLibraries(libraries: string) {
  let deps = ''
  let devDeps: string | undefined = undefined
  const args = libraries.trim().split(' ')

  const isDevArgument = (arg: string) =>
    arg.toLowerCase() === '--d' ||
    arg.toLowerCase() === '--dev' ||
    arg.toLowerCase() === '--save-dev'

  const devFlagIndex = args.findIndex(arg => isDevArgument(arg))

  const normalLibs =
    devFlagIndex === -1
      ? args.filter(arg => !arg.startsWith('-'))
      : args.slice(0, devFlagIndex).filter(arg => !arg.startsWith('-'))

  if (devFlagIndex !== -1) {
    const devLibs = args.slice(devFlagIndex + 1)

    deps = normalLibs.length > 0 ? normalLibs.join(' ') : deps
    devDeps = devLibs.length > 0 ? devLibs.join(' ') : devDeps
  } else {
    deps = normalLibs.join(' ')
  }
  return { deps, devDeps }
}

async function processExce(command: string, library?: string): Promise<void> {
  const commandToExecute = library ? `${command} ${library}` : command

  const { output, error } = await runCommand(commandToExecute)

  if (error) {
    tools.log(
      `\n${tools.error} ${tools.textRed(`Execution failed: ${tools.textGrey(error)}`)}`
    )
  }
  tools.log(`${tools.textGrey(output)}\n`)
}

export {
  createProject,
  handleLibraryInstallation,
  setUpModule,
  setupTemplates,
  processBuildTemplateFiles,
  processExce,
  processSpinner,
}
