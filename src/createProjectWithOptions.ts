import { input } from './lib/prompts.js'
import {
  createProject,
  processSpinner,
  setUpModule,
  setupTemplates,
  processBuildTemplateFiles,
} from './createProject.js'
import { processPackageJson } from './lib/processPackageJson.js'
import { help, tools } from './lib/help.js'
export interface InitOpts {
  projectName?: string
  fix?: string | boolean | undefined
  target?: string
  module?: string
  directory?: string
}

async function createProjectWithOptions(options: InitOpts) {
  const {
    projectName: pn,
    target: tg,
    module: md,
    directory: dir,
    fix: fastProject,
  } = options
  if (fastProject !== undefined) return await fastCreateProject(options)

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
  projectName: opts.fix as string,
  target: (await matchLanguage(opts.target || 'typescript')) || 'typescript',
  module: (await matchModule(opts.module || 'module')) || 'module',
  directory: opts.directory || (opts.fix as string),
})
async function fastCreateProject(options: InitOpts) {
  const { fix: fastProject } = options
  if (fastProject === true || typeof fastProject === 'string') {
    if (typeof fastProject !== 'string')
      return tools.log(
        tools.error,
        tools.textRed('Please enter a valid project name')
      )

    const objFast = await fastProjectObj(options)
    help.notification(objFast.target, objFast.module)
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

  const cjsVariants = ['cjs', 'commonjs', 'common', 'require']

  const normalizedModuleType = moduleType.toLowerCase()

  if (esmVariants.includes(normalizedModuleType)) {
    return 'module'
  } else if (cjsVariants.includes(normalizedModuleType)) {
    return 'commonjs'
  }

  return null
}

export { createProjectWithOptions }
