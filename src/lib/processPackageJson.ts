import {
  processPackageJsonFields,
  processPackageJsonByOptions,
  finalizeProject,
  processTemplate,
  processOptionsModule
} from './packageJsonUtils.js'
import { type ParseObj } from './templateUtils.js'
import {type InitOpts} from '../createProjectWithOptions.js'
import { help } from './help.js'
export async function processPackageJson(
  target: string,
  callFn: Function,
  opts?: InitOpts
): Promise<ParseObj<any>> {
  
  const module = await processOptionsModule(callFn,opts?.module)
  help.buildProject()
const { directory } = opts || {}
  const templateCode = await processTemplate(target)

  const { contentPackage, ...remaining } = templateCode
  !opts ? await processPackageJsonFields(contentPackage) : await processPackageJsonByOptions(contentPackage, opts)

  return finalizeProject(contentPackage, remaining, target, module, directory)
}
