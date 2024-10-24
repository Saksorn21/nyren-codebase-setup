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
import examples from './bin/examples.js'
import { tools, help } from './lib/help.js'
export interface InitOpts {
  projectName?: string
  fix?: string | boolean | undefined
  target?: string
  module?: string
  directory?: string
  prefix?: string
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

async function fastCreateProject(this: Command) {
  const args = this.args
  const opts = this.opts()
  console.log(args, opts)
  await parseAndSetDefaultArgs(args)
  await finalizeOptions(args, opts)
  
  tools.log(
    tools.textOrange(
      `${tools.fast} Turbocharge your project builds with ${tools.textWhit(opts.target)}, using the module ${tools.textWhit(opts.module)}, in the directory: ${tools.textWhit(opts.directory)}! ${tools.fast}`
    )
  )

  const row = await processPackageJson(
    opts.target as string,
    setUpModule,
    opts as InitOpts
  )
  const { templateCode, userDirectoryName } = row
  await processBuildTemplateFiles(
    templateCode,
    templateCode.baseFilesName,
    userDirectoryName
  )
}
const analysisProcess = async (context: string): Promise<string > => await matchLanguage(context) || await matchModule(context) || context

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
  if (uniqueArgs.has('commonjs') && processedArg === 'module' || 
    uniqueArgs.has('module') && processedArg === 'commonjs') {
  tools.log(
    tools.prefixCli,
    tools.error,
    tools.textRed(`Conflicting module types: Cannot use both ${tools.textWhit('commonjs')} and ${tools.textWhit('esmodule')} together.`)
  );
    tools.log(examples.init)
  process.exit(2);
    }
  uniqueArgs.add(processedArg as string);
}

  args.length = 0;
  args.push(
    ...Array.from(
    uniqueArgs
    )
  )
}
async function finalizeOptions(args: string[], opts: InitOpts = {}){
  let projectName, language, moduleType;
  // Added flexibility in passing the “-- any” argument.
  // $ nyrenx init fast -- my-project typescript module
  // $ nyrenx init fast -- my-project typescript
  // $ nyrenx init fast -- js esm
  // $ nyrenx init fast -- cjs
  
  for await (const arg of args) {
    switch (arg) {
      case 'typescript':
        language = arg;
        opts.target = arg;
        break;
      case 'javascript':
        language = arg;
        opts.target = arg;
        break;
      case 'commonjs':
        moduleType = arg;
        opts.module = arg;
        break;
      case 'module':
        moduleType = arg;
        opts.module = arg;
        break;
      default:
        projectName = arg;
        opts.projectName = arg;
        break;
    }
  }

  if (!language) {
    console.log('language', language, moduleType);
    language = moduleType === 'module' ? 'typescript' : 'javascript';
  }

  if (!moduleType) {
    moduleType = language === 'typescript' ? 'module' : 'commonjs';
  }

  opts.projectName = projectName || 'my-project';
  opts.target = language || 'typescript';
  opts.module = moduleType || 'module';
  opts.directory = opts.prefix || opts.projectName || 'my-project';

  console.log('opts', opts);
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
