import { input } from './lib/prompts.js'
import {
  createProject,
  processSpinner,
  setUpModule,
  setupTemplates,
  processBuildTemplateFiles,
} from './createProject.js'
import { processPackageJson } from './lib/processPackageJson.js'
import { tools } from './lib/help.js'
export interface InitOpts {
  projectName?: string
  fix?: string | boolean | undefined
  target?: string
  module?: string
  directory?: string
}

async function createProjectWithOptions(options: InitOpts) {
  const { projectName: pn, target: tg, module: md, directory: dir } = options

  let target = ''
  let module = ''
  target = tg || (await setupTemplates())

  target = target
    ? (await presetSpinnerMatch('Target', matchLanguage(target))) ||
      (await setupTemplates())
    : target

  module = md || (await setUpModule())

  module = module
    ? (await presetSpinnerMatch('Module', matchModule(module))) ||
      (await setUpModule())
    : module

  const projectName = pn || (await input('Project name', 'my-project'))
  const directory = dir || pn || projectName

  await createProject({ projectName, target, module, directory })
}
const fastProjectObj = async (opts: InitOpts): Promise<InitOpts> => ({
  projectName: opts.projectName as string,
  target: opts.target,
  module: opts.module,
  directory: opts.directory || opts.projectName,
})
async function fastCreateProject(args: string[]) {
  const projectName = args[0] || 'my-project'
  const { target, module } = await parseArgumentsFast(args)

  const objFast = await fastProjectObj({ projectName, target, module })
  tools.log(
    tools.textOrange(
      `${tools.fast} Turbocharge your project builds with ${tools.textWhit(objFast.target)}, using the module ${tools.textWhit(objFast.module)}, in the directory: ${tools.textWhit(objFast.directory)}! ${tools.fast}`
    )
  )

  const row = await processPackageJson(
    objFast.target as string,
    setUpModule,
    objFast as InitOpts
  )
  const { templateCode, userDirectoryName } = row
  await processBuildTemplateFiles(
    templateCode,
    templateCode.baseFilesName,
    userDirectoryName
  )
}
async function parseArgumentsFast(args: string[]) {
  const arr1 = args[1] || 'typescript'
  const arr2 = args[2] || 'module'
  const args2 =
    (await matchLanguage(arr1)) || (await matchModule(arr1)) || 'typescript'
  const args3 =
    (await matchLanguage(arr2)) || (await matchModule(arr2)) || 'module'
  let language, moduleType

  if (
    ((args2 === 'typescript' || args2 === 'javascript') &&
      (args3 === 'module' || args3 === 'commonjs')) ||
    ((args2 === 'module' || args2 === 'commonjs') &&
      (args3 === 'typescript' || args3 === 'javascript'))
  ) {
    if (args2 === 'typescript' || args2 === 'javascript') {
      language = args2
      moduleType = args3
    } else {
      language = args3
      moduleType = args2
    }
  } else {
    console.log('No matching arguments found')
  }
  if (language && moduleType) {
    return { target: language, module: moduleType }
  }
  return { target: 'typescript', module: 'module' }
}
const presetSpinnerMatch = async <T>(match: string, callFn: PromiseLike<T>) =>
  await processSpinner({
    start: `Verifying ${match}...`,
    success: `${match} verified successfully!`,
    fail: `Verification failed for ${match}.`,
    callAction: callFn,
  })

async function matchLanguage(target: string): Promise<string | null> {
  const languageVariants = [
    'js',
    'javascript',
    'ts',
    'typescript',
    'type',
    'types',
  ]

  const normalizedTarget = target.toLowerCase()

  if (languageVariants.includes(normalizedTarget)) {
    return normalizedTarget === 'js' || normalizedTarget === 'javascript'
      ? 'javascript'
      : 'typescript'
  }

  return null
}
async function matchModule(moduleType: string) {
  const esmVariants = [
    'es',
    'esm',
    'module',
    'esmodule',
    'es6',
    'es2015',
    'esnext',
    'import',
  ]

  const cjsVariants = ['cjs', 'commonjs', 'common', 'require', 'node']

  const normalizedModuleType = moduleType.toLowerCase()

  if (esmVariants.includes(normalizedModuleType)) {
    return 'module'
  } else if (cjsVariants.includes(normalizedModuleType)) {
    return 'commonjs'
  }

  return null
}

export { createProjectWithOptions, fastCreateProject }
