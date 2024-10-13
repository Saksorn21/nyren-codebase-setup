import { type ResultFs } from './lib/fileSystem.js'
import { setModule, setTarget, input, confirm } from './lib/prompts.js'
import { presetSpinnerCreateFiles } from './lib/utils.js'
import { buildTemplateFiles, type ParseObj } from './lib/templateUtils.js'
import { runCommand } from './lib/exec.js'
import { processPackageJson } from './lib/processPackageJson.js'
import { help, tools, prefixCli } from './lib/help.js'
import cursor from './lib/cursor.js'
import { oraPromise, type Ora } from 'ora'
import { createProject, processSpinner, handleLibraryInstallation, setUpModule, setupTemplates, processBuildTemplateFiles, processExce,  } from './createProject.js'
import process from 'node:process'

export interface InitOpts {
  projectName?: string
  target?: string
  module?: string
  directory?: string
}
async function createProjectWithOptions(options: InitOpts) {
  //debugger
   tools.log(
    `${prefixCli} ${tools.info} Setting up the project: ${tools.textOrange(JSON.stringify(options))}\n`)
  const { projectName: pn, target: tg, module: md, directory: dir } = options
  let target = '' 
  let module = ''
  target = tg || await setupTemplates()
  
  target = target ? matchLanguage(target) || await setupTemplates() : target
  
  module = md || await setUpModule()
  
  module = module ? matchModule(module) || await setUpModule() : module 
  const projectName = pn || await input('Project name', 'my-project')
  const directory = dir || pn || projectName
  console.debug({ projectName, target, module, directory })
  await createProject({ projectName, target, module, directory })
}

function matchLanguage(target: string): string | null {
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
function matchModule(moduleType: string): string | null {
  const esmVariants = [
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
