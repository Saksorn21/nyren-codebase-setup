import { input } from './lib/prompts.js'
import { type Command } from 'commander'
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
async function fastCreateProject(this: Command) {
  const args = this.args
  const opts = {}
  await parseAndSetDefaultArgs(args)
  await processOfGeneratingOptionsResults(args, opts)
  process.exit(0)
  const projectName = args[0]
  const { target, module } = await parseArgumentsFast(args)
process.exit(0)
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
const analysisProcess = async (context: string, isNull = false): Promise<string | null> => await matchLanguage(context) || await matchModule(context) || (isNull ? null : context)
async function parseAndSetDefaultArgs(args: string[]) {
  

  if (args.length > 3) {
    tools.log(
      tools.prefixCli,
      tools.error,
      tools.textRed(`Incompatible arguments: ${tools.textWhit('-- ' + args.join(' '))}. Expected up to 3 arguments, but got ${tools.textWhit(args.length)}.`)
    )
    process.exit(2);
  }
  if (args.length === 0) {
    args.push('my-project', 'typescript', 'module');
  }
  const uniqueArgs = new Set<string>()
for await (const arg of args) {
  const processedArg = await analysisProcess(arg);
  uniqueArgs.add(processedArg as string);
}

  args.length = 0;
  args.push(
    ...Array.from(
    uniqueArgs
    )
  )
}
async function processOfGeneratingOptionsResults(args: string[], opts: InitOpts = {}){
  console.log('args', args)
  console.log('opts', opts)
  let projectName, target, module
  let argumentFirstOne = await analysisProcess(args[0], true)
  let argumentTow = await analysisProcess(args[1], true)
  let argumentThree = await analysisProcess(args[2], true)
  let rawArgsFirstOne = args[0]
  let rawArgsTow = args[1]
  let rawArgsThree = args[2]
  for await (const arg of args){
  switch (arg) {
     case 'typescript':
      target = arg
      opts.target = arg
        break;
    case 'javascript':
      target = arg
      opts.target = arg
        break;
    case 'commonjs':
      module = arg
      opts.module = arg
        break;
    case 'module':
      module = arg
      opts.module = arg
        break;
    default:
      projectName = arg
      opts.projectName = arg
        break
  }
    
}
console.log(argumentFirstOne, argumentTow, argumentThree)
  console.log('raw',rawArgsFirstOne, rawArgsTow, rawArgsThree)
  console.log(projectName, target, module)
  if (!target){
    console.log('target', target, module)
    target = module  === 'module' ? 'typescript' : 'javascript'
  }
    opts.projectName = projectName || 'my-project'
    opts.target = target ||'typescript'
    opts.module = module||'module'
  
  console.log('opts', opts)
}

async function parseArgumentsFast(args: string[]) {
  const uniqueArgs = new Set<string>()
  console.log(args)
  const argumentFirstOne = await analysisProcess(args[0], true)
  if (argumentFirstOne !== null && (argumentFirstOne === 'typescript' || argumentFirstOne === 'javascript')){}
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
    console.log(tools.textRed('No matching arguments found'))
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

async function matchLanguage(target: string): Promise<'javascript' | 'typescript' | null> {
  if(!target) return null
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
async function matchModule(moduleType: string): Promise<'commonjs' | 'module' | null> {
  if(!moduleType) return null
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
