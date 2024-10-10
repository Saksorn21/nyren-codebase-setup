import { createJsonFile, type ResultFs } from './lib/fileSystem.js'
import { setModule, build, input, confirm } from './lib/prompts.js'
import {
  templateProcessor,
  buildTemplateFiles,
  presetSpinnerTemplate,
  type ParseObj,
} from './lib/templateUtils.js'
import { runCommand } from './lib/exec.js'
import { help, tools } from './lib/help.js'
import { oraPromise, type Ora } from 'ora'
import process from 'node:process'

export interface OptsInits {
  projectName?: string
  repoTemplate?: string
  version?: string
  path?: string
}
export interface Row {
  // It's the same.
  // Record<string, string | string[]>
  [name: string]: string | string[] | object
}
export interface SpinnerInput<T> {
  start: string
  success: string
  fail?: string
  callAction: PromiseLike<T> | ((spinner: Ora) => PromiseLike<T>)
}
const keywords: Set<string> = new Set<string>([])
const packageJson: Map<string, string | string[]> = new Map<
  string,
  string | string[]
>([
  ['version', '1.0.0'],
  ['description', 'my-project'],
  ['main', 'index.js'],
  ['keywords', []],
  ['author', ''],
  ['license', ''],
])

async function createProject() {
  const target = await setupTemplates()
  const row = await processPackageJson(target)
  const { templateCode } = row
  //console.log( row)
  
  
  const isLibrary: boolean = await confirm(
    'Would you like to add more libraries?'
  )
  await help.notification(row.template as string, row.type as string)
  await help.warnOverWrite()

  if (await confirm('Do you want to continue?')) {
    const copied = await processBuildTemplateFiles(templateCode, templateCode.baseFilesName)

    if (copied.success) {
      await handleLibraryInstallation(isLibrary, row.directoryName as string)
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
    start: 'Setting up repository templates',
    success: 'Setup completed successfully!',
    fail: 'Setup failed!',
    callAction: build(),
  })
}

async function processPackageJson(target: string): Promise<ParseObj<any>> {
  const module = await setUpModule()
  await help.buildProject()
  const answerProjectName = await input('name')
  const paressedProjectName =
    answerProjectName === '' ? 'my-project' : answerProjectName
  const templateCode = await templateProcessor(
    target,
    transformString(paressedProjectName)
  )
  const {contentPackage, ...remaining} = templateCode
  const row: Row = {}
  for (const [key, value] of packageJson) {
    const answer = await input(key)
        contentPackage.name = paressedProjectName
    if (typeof contentPackage[key] === 'string') {
          contentPackage[key] =
        answer === '' ? contentPackage[key] : answer || value
    }
    if (Array.isArray(contentPackage[key])) {
      answer.split(',').map(item => {
        keywords.add(item)
      })

          contentPackage[key] = answer === '' ? [] : [...keywords]
    }
    if (key === 'license') {
          contentPackage[key] =
        answer === '' ? contentPackage[key] : answer.toUpperCase()
    }
  }
      contentPackage.type = module.toLowerCase()
  row.type = module.toLowerCase()
  row.template = target
  row.directoryName = transformString(contentPackage.name.toString())
  row.userDiretory = remaining.userDiretory
    remaining.baseFilesName.push('package.json')
  row.templateCode = { ...remaining, 'package.json': contentPackage }
  tools.log(
    tools.success,
    tools.textGreen(
      `Successfully setting the project: ${tools.textWhit(row.directoryName)} to ${tools.textWhit(row.userDiretory)}\n`
    )
  )
  return row
}
async function processBuildTemplateFiles (templateCode: ParseObj<string>, baseFilesName: string[]): Promise<ResultFs> {
  try {
  
   for (const file of baseFilesName) {
     await processSpinner(
       await presetSpinnerTemplate(
         buildTemplateFiles(templateCode),
         file
       )
     )
   }
    return { success: true }
    } catch (error: unknown) {
     return { success: false, error: error as Error }
    }
}

async function setUpModule(): Promise<string> {
  return processSpinner({
    start: 'Setting module',
    success: 'Module setup completed successfully!',
    fail: 'Module setup failed!',
    callAction: setModule(),
  })
}

async function handleLibraryInstallation(
  isLibrary: boolean,
  directoryName: string
): Promise<void> {
  const basecommand = `cd ./${directoryName} && npm install`
  if (isLibrary) {
    await help.libraryEx()
    const lib = await input('libraries')
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
      callAction: processExce(basecommand),
    })
  }
}

async function processExce(command: string, library?: string): Promise<void> {
  const commandToExecute = library ? `${command} ${library}` : command

  const { output, error } = await runCommand(commandToExecute)

  if (error) {
    tools.log(
      `\n${tools.error}`,
      tools.textRed(`Execution failed: ${tools.textGrey(error)}`)
    )
    process.exit(1)
  }
  tools.log(`\n${tools.success} ${tools.textGrey(output)}`)
}

async function processSpinner<T>(opts: SpinnerInput<T>): Promise<T> {
  const { start, success, fail, callAction } = opts

  try {
    const result = await oraPromise(callAction, {
      color: 'white',
      prefixText: `${tools.textWhit('[')}${tools.textSlateBlue3('nyrenx')}${tools.textWhit(']')}`,
      text: tools.textGrey(start),
      successText: tools.textGreen(success),
      failText: tools.textRed(fail),
    })
    return result
  } catch (error) {
    throw error
  }
}

function transformString(input: string): string {
  // Check if the input starts with '@' and contains '/'
  if (input.startsWith('@') && input.includes('/')) {
    // Remove '@' and replace '/' with '-'
    return input.replace(/^@/, '').replace('/', '-')
  }
  // If the input doesn't match the conditions, return the original input
  return input
}

export { createProject, processSpinner }
