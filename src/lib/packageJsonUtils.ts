import { input } from './prompts.js'
import { tools } from './help.js'
import { transformString } from './help.js'
import {
  templateProcessor
} from './templateUtils.js'
export interface Row {
  // It's the same.
  // Record<string, string | string[]>
  [name: string]: string | string[] | object
}

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

export async function getProjectName(): Promise<string> {
  const answer = await input('name')
  return answer === '' ? 'my-project' : answer
}


export async function processPackageJsonFields(contentPackage: any) {
  const keywords = new Set<string>()

  for (const [key, value] of packageJson) {
    const answer = await input(key)
    updatePackageField(contentPackage, key, answer, value, keywords)
  }
}
export async function processTemplate(target: string, projectName: string) {
  return await templateProcessor(target, transformString(projectName))
}

export function finalizeProject(contentPackage: any, remaining: any, target: string, module: string, projectName: string): Row {
  contentPackage.type = module.toLowerCase()
console.log(remaining)
  const row: Row = {
    projectName,
    type: module.toLowerCase(),
    template: target,
    directoryName: transformString(contentPackage.name.toString()),
    userDiretory: remaining.userDiretory,
    templateCode: { ...remaining, 'package.json': contentPackage }
  }

  remaining.baseFilesName.push('package.json')

  tools.log(
    tools.success,
    tools.textGreen(
      `Successfully setting the project: ${tools.textWhit(row.directoryName)} to ${tools.textWhit(row.userDiretory)}\n`
    )
  )

  return row
}

function updatePackageField(
  contentPackage: any, key: string, answer: string, defaultValue: any, keywords: Set<string>
) {
  if (typeof contentPackage[key] === 'string') {
    contentPackage[key] = answer === '' ? contentPackage[key] : answer || defaultValue
  } else if (Array.isArray(contentPackage[key])) {
    answer.split(',').forEach(item => keywords.add(item))
    contentPackage[key] = answer === '' ? [] : [...keywords]
  } else if (key === 'license') {
    contentPackage[key] = answer === '' ? contentPackage[key] : answer.toUpperCase()
  }
}

