import {
  processPackageJsonFields,
  processPackageJsonByOptions,
  finalizeProject,
  processTemplate,
  processDirectory,
  processOptionsModule,
} from './packageJsonUtils.js'
import { type ParseObj } from './templateUtils.js'
import { type InitOpts } from '../createProjectWithOptions.js'
import { help } from './help.js'
export async function processPackageJson(
  target: string,
  callFn: Function,
  opts?: InitOpts
): Promise<ParseObj<any>> {
  const module = await processOptionsModule(callFn, opts?.module)
  help.buildProject()
  let directory = ''
  const { directory: dir } = opts || {}
  const templateCode = await processTemplate(target)

  const { contentPackage, ...remaining } = templateCode
  !opts
    ? await processPackageJsonFields(contentPackage)
    : await processPackageJsonByOptions(contentPackage, opts)

  directory = dir || ''
  directory = !directory
    ? await processDirectory(contentPackage.name)
    : directory

  return finalizeProject(contentPackage, remaining, target, module, directory)
}
