import { readPackageJson } from './lib/packageJson.js'
import { copyRepo, createJsonFile, createDirectory } from './lib/fileSystem.js'
import { extractArchive } from './lib/zipUtil.js'
import { getDirname, resolvePath } from './lib/pathHelper.js'
import { setPrettierJson, createFileMain } from './lib/setup-repo.js'
import { setModule, build, input, confirm } from './lib/prompts.js'
import { runCommand } from './lib/exec.js'
import { help, tools } from './lib/help.js'
import { oraPromise } from 'ora'
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
  [name: string]: string | string[]
}
export interface SpinnerInput<T> {
  start: string
  success: string
  fail?: string
  callAction: PromiseLike<T>
}

const __dirname = getDirname(import.meta.url)
const keywords: Set<string> = new Set<string>([])
const packageJson: Map<string, string | string[]> = new Map<
  string,
  string | string[]
>([
  ['name', 'my-project'],
  ['version', '1.0.0'],
  ['description', 'my-project'],
  ['main', 'index.js'],
  ['keywords', []],
  ['author', ''],
  ['license', ''],
])

async function createProject() {
  const tarage = await setupTemplates()
  const { row, templateData } = await processTemplate(tarage)

  const isLibrary: boolean = await confirm(
    'Would you like to add more libraries?'
  )
  await help.warnOverWrite()

  if (await confirm('Do you want to continue?')) {
    if (await copyRepoToDirectory(row.src as string, row.fullPath as string)) {
      const creatingPackage = await createPackageJson(
        row.fullPath as string,
        templateData
      )
      // creating .prettierrc.json
    //  await createPrettierJson(row.fullPath as string, 'pp' + row.template as string)
    //  await createFilesMain(row.fullPath as string, row.template as string)

      if (creatingPackage.success) {
        await handleLibraryInstallation(isLibrary, row.directoryName as string)
        process.exit(1)
      } else {
        tools.log(
          tools.error,
          tools.textRed(
            `Create package.json failed: ${(creatingPackage.error as Error).message}`
          )
        )
        process.exit(1)
      }
    } else {
      tools.log(tools.error, tools.textRed('Failed to copy the repository'))
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

async function processTemplate(tarage: string) {
  const { row, templateData } = await processLoopPackage(tarage)

  if (tarage !== 'typescript' && tarage !== 'javascript') {
    tools.log(tools.textRed('Error: Please select a template'))
    process.exit(1)
  }

  return { row, templateData }
}

async function processLoopPackage(
  target: string
): Promise<{ row: Row; templateData: Row }> {
  const module = await setModule()
  const repoPath =
    target === 'typescript' ? 'repo-templates/ts' : 'repo-templates/js'
  const src = resolvePath(__dirname, '../', repoPath)
  const repo = readPackageJson(src)
  const row: Row = {}
  await help.buildProject()
  for (const [key, value] of packageJson) {
    const answer = await input(key)

    if (typeof repo[key] === 'string') {
      row[key] = answer === '' ? repo[key] : answer || value
      repo[key] = answer === '' ? repo[key] : answer || value
    }
    if (Array.isArray(repo[key])) {
      answer.split(',').map(item => {
        keywords.add(item)
      })

      repo[key] = answer === '' ? [] : [...keywords]
    }
    if (key === 'license') {
      repo[key] = answer === '' ? repo[key] : answer.toUpperCase()
      row[key] = answer === '' ? repo[key] : answer.toUpperCase()
    }
  }
  repo.type = module.toLowerCase()
  row.type = module.toLowerCase()
  row.src = src
  row.template = target
  row.directoryName = transformString(row.name.toString())
  row.fullPath = resolvePath(process.cwd(), row.directoryName)
  return { row, templateData: repo }
}

async function copyRepoToDirectory(src: string, basePath: string) {
  //copyRepo(src, basePath)
  await createDirectory(basePath)
 await processSpinner({
      start: 'Cloning repository',
      success: 'Cloning completed successfully!',
      fail: 'Cloning failed!',
      callAction: extractArchive(src + '.zip', basePath)
  })
  return  true
}

async function createPackageJson(basePath: string, dataPackage: Row) {
  return processSpinner({
    start: 'Creating the package.json file',
    success: 'Package.json creation completed successfully!',
    fail: 'Package.json creation failed!',
    callAction: createJsonFile(
      resolvePath(basePath, 'package.json'),
      formatDaraPackageJson(dataPackage)
    ),
  })
}

async function createPrettierJson(basePath: string, target: string) {
  return processSpinner({
    start: 'Creating the .prettierrc.json file',
    success: '.prettierrc.json creation completed successfully!',
    fail: '.prettierrc.json creation failed!',
    callAction: setPrettierJson(target, basePath),
  })
}

async function createFilesMain(basePath: string, target: string) {
  await createDirectory(resolvePath(basePath, '.github'))

  await processSpinner({
    start: 'Creating the workflow folder',
    success: 'Workflow folder created successfully! (.github/workflow)',
    fail: 'Failed to create the workflow folder!',
    callAction: copyRepo(
      resolvePath(__dirname, 'repo-templates/.github'),
      resolvePath(basePath, '.github')
    ),
  })

  await createDirectory(resolvePath(basePath, 'src'))

  await processSpinner({
    start: 'Creating the src/index.js file',
    success: 'src/index.js file created successfully!',
    fail: 'Failed to create the src/index.js file!',
    callAction: createFileMain(target, 'src', basePath),
  })

  await createDirectory(resolvePath(basePath, '__tests__'))

  await processSpinner({
    start: 'Creating the __tests__/index.test.js file',
    success: '__tests__/index.test.js file created successfully!',
    fail: 'Failed to create the __tests__/index.test.js file!',
    callAction: createFileMain(target, '__tests__', basePath),
  })
}

async function handleLibraryInstallation(
  isLibrary: boolean,
  directoryName: string
) {
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
    await processExce(basecommand)
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
    const result = await oraPromise(() => callAction, {
      color: 'white',
      text: tools.textGrey(start),
      successText: tools.textGreen(success),
      failText: tools.textRed(fail),
    })
    return result
  } catch (error) {
    throw error
  }
}

function formatDaraPackageJson(dataPackage: Row) {
  const {
    name,
    version,
    description,
    main,
    type,
    keywords,
    author,
    license,
    repository,
    ...therest
  } = dataPackage
  console.log(dataPackage)
  return {
    name,
    version,
    description,
    license,
    author,
    repository,
    keywords,
    type,
    main,
    ...therest,
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

export { createProject, transformString, tools, processSpinner, processExce }

export * from './lib/fileSystem.js'
