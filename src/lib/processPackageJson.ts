import { processPackageJsonFields, finalizeProject, processTemplate } from './packageJsonUtils.js'
import {
  type ParseObj
} from './templateUtils.js'
import { help } from './help.js'
export async function processPackageJson(target: string, callFn: Function): Promise<ParseObj<any>> {
  const module = await callFn()
  help.buildProject()

  const templateCode = await processTemplate(target)

  const { contentPackage, ...remaining } = templateCode
  await processPackageJsonFields(contentPackage)

  return finalizeProject(contentPackage, remaining, target, module)
}