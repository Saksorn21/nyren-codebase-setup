
import { input } from './lib/prompts.js'
import { createProject, processSpinner, setUpModule, setupTemplates, } from './createProject.js'

export interface InitOpts {
  projectName?: string
  target?: string
  module?: string
  directory?: string
}
async function createProjectWithOptions(options: InitOpts) {
  const { projectName: pn, target: tg, module: md, directory: dir } = options
  let target = '' 
  let module = ''
  target = tg || await setupTemplates()
  
  target = target ? await presetSpinnerMatch('Target', matchLanguage(target)) || await setupTemplates() : target;
  
  module = md || await setUpModule()
  
  module = module ? await presetSpinnerMatch('Module', matchModule(module)) || await setUpModule() : module 
  const projectName = pn || await input('Project name', 'my-project')
  const directory = dir || pn || projectName
  await createProject({ projectName, target, module, directory })
}

const presetSpinnerMatch = async <T>(match: string, callFn: PromiseLike<T>) => await processSpinner({
  start: `Verifying ${match}...`,
     success: `${match} verified successfully!`,
     fail: `Verification failed for ${match}.`,
     callAction: callFn
   })


async function matchLanguage(target: string): Promise<string | null> {
  const languageVariants = [
    'js', 
    'javascript', 
    'ts', 
    'typescript', 
    'type', 
    'types' 
  ];

  const normalizedTarget = target.toLowerCase();

  if (languageVariants.includes(normalizedTarget)) {
    return normalizedTarget === 'js' || normalizedTarget === 'javascript' 
      ? 'javascript' 
      : 'typescript';
  }

  return null; 
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
    'import'
  ];

  const cjsVariants = [
    'cjs', 
    'commonjs', 
    'common', 
    'require'
  ];

  const normalizedModuleType = moduleType.toLowerCase();

  if (esmVariants.includes(normalizedModuleType)) {
    return 'module'; 
  } else if (cjsVariants.includes(normalizedModuleType)) {
    return 'commonjs'; 
  }

  return null; 
}

export { createProjectWithOptions }
