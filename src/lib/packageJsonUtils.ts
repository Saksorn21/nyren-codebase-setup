import { input } from './prompts.js'
import { transformString, help } from './help.js'
import { templateProcessor } from './templateUtils.js'
import { rfSync } from './fileSystem.js'
import { getDirname, resolvePath } from './pathHelper.js'
import { type InitOpts } from '../createProjectWithOptions.js'
export interface Row {
  // It's the same.
  // Record<string, string | string[]>
  [name: string]: string | string[] | object
}

const __dirname = getDirname(import.meta.url)

const packageJson: Map<string, string | string[]> = new Map<
  string,
  string | string[]
>([
  ['name', 'my-project'],
  ['version', '1.0.0'],
  ['description', 'my-project'],
  ['main', ''],
  ['keywords', []],
  ['author', ''],
  ['license', 'ISC'],
])

export async function processPackageJsonFields(contentPackage: any) {
  help.infoProcessInput()
  const keywords = new Set<string>()

  for (const [key, value] of packageJson) {
    const answer = await input(key, value as string)
    updatePackageField(contentPackage, key, answer, value, keywords)
  }
}
export async function processTemplate(target: string) {
  return await templateProcessor(target)
}

export function finalizeProject(
  contentPackage: any,
  remaining: any,
  target: string,
  module: string,
  directory?: string
): Row {
  const normalizedDirectory = transformString(
    directory ? directory : contentPackage.name
  )
  const row: Row = {
    projectName: contentPackage.name.toString(),
    type: module.toLowerCase(),
    template: target,
    userDirectoryName: normalizedDirectory,
    templateCode: {
      userDirectory: resolvePath(process.cwd(), normalizedDirectory),
      'package.json': contentPackage,
      ...remaining,
    },
  }

  remaining.baseFilesName.push('package.json')

  help.warnSettingCompleted(
    row.projectName as string,
    (row.templateCode as any).userDirectory
  )

  return row
}
export const processDirectory = async (defaultValue: string) =>
  await input('directory', transformString(defaultValue))

export async function processOptionsModule(
  callFn: Function,
  optsModule?: string
) {
  let module = ''
  optsModule !== undefined && (module = optsModule || (await callFn()))
  module = !module ? await callFn() : module
  return module
}
export async function processPackageJsonByOptions(
  contentPackage: any,
  opts: InitOpts
) {
  contentPackage.name = opts.projectName
  contentPackage.description = opts.projectName
  contentPackage.type = opts.module
}

function updatePackageField(
  contentPackage: any,
  key: string,
  answer: string,
  defaultValue: any,
  keywords: Set<string>
) {
  if (typeof contentPackage[key] === 'string') {
    contentPackage[key] =
      answer === '' ? contentPackage[key] : answer || defaultValue
  } else if (Array.isArray(contentPackage[key])) {
    answer.split(',').forEach(item => keywords.add(item))
    contentPackage[key] = answer === '' ? [] : [...keywords]
  } else if (key === 'license') {
    contentPackage[key] =
      answer === '' ? contentPackage[key] : answer.toUpperCase()
  }
}

export function readPackageJson(
  src?: string
): Record<string, string | string[]> {
  let packageJsonPath: string
  if (src) {
    packageJsonPath = src
  } else {
    packageJsonPath = resolvePath(__dirname, '../..', 'package.json')
  }
  return JSON.parse(rfSync(packageJsonPath, 'utf-8'))
}

export function formatDataPackageJson(dataPackage: Record<string, string>) {
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
