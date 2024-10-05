import { readPackageJson } from './lib/packageJson';
import { copyRepo } from './lib/fileSystem'
import {setModule, build, input, confirm} from './lib/prompts'
import {oraPromise as ora } from 'ora';
import chalk from 'chalk';
import logSymbols from 'log-symbols';

export interface OptsInits {
  name?: string;
  template?: string;
  path?: string;
  }
interface Row {
  // It's the same.
  // Record<string, string | string[]>
  [name: string]: string| string[] 
}
interface SpinnerInput {
  title: string;
  on: string;
  end: string;
  tiemout?: number;
}
const keywords: Set<string> = new Set<string>([])
const packageJson: Map<string, string | string[]> = new Map<string, string | string[]>([
  ['name', 'my-project'],
  ['version', '1.0.0'],
  ['description', 'my-project'],
  ['main', 'index.js'],
  ['keywords', []],
  ['author', ''],
  ['license', ''],
])
export async function processLoopPackage(target: string): Promise<{row: Row, templateData: Row}> {
  const module = await setModule()
  const src = target === 'typescript' ? './repo-templates/ts': './repo-templates/js'
   const repo = readPackageJson(src)
   const row: Row = {}
   for (const [key, value] of packageJson){
     const answer =  await input(key)
     repo.type = module
     row.type = module
     if (typeof repo[key] === 'string'){
       row[key] = answer === '' ? repo[key] : answer || value
       repo[key] = answer === '' ? repo[key] : answer || value
     }
     if (Array.isArray(repo[key])) {
       answer.split(',').map((item) => {
         keywords.add(item)
       })
       
       repo[key] = answer === '' ? [] : [...keywords]
       } 

   }
  row.src = src
  row.template = target
  return { row, templateData: repo }
}

export async function createProject(opts: OptsInits) {
  
console.log(`options: ${JSON.stringify(opts)}`)
  
  const tarage = await build()
  let template: Row = {}
  const { row, templateData } = await processLoopPackage(tarage)

  if (tarage === 'typescript') {
      template = templateData
    }else if (tarage === 'javascript') {
      template = templateData
    }else{
      console.log(
        chalk.red.bold(
          'Error: Please select a template'
        )
      )
    }
  processSpinner({
    title: 'Creating project...',
    on: 'Creating project with' + chalk.whiteBright.bold(chalk.underline(row.template)),
    end: 'Project created',
    tiemout: 1000
  })
await ora(helpWarn(), { text: 'Creating project...' })
  if (await confirm('Do you want to continue?')){
    processSpinner({
      title: 'Setup overwrite directory.',
      on: 'Loading repo-template' + chalk.whiteBright.bold(chalk.underline(row.template)),
      end: 'done',
      tiemout: 1000
    })
   if(await copyRepo(row.src.toString(), process.cwd() + '/__tests__/' + row.name.toString())) {
     
 
  }
    
  }
    console.log(logSymbols.error, chalk.red.bold('cancel'))
    //console.log(answer)
  }
async function helpWarn(): Promise<void> {
   console.log(logSymbols.warning,`${chalk.hex('#ffaf00').bold('Will overwrite directory')}`)
   console.log(logSymbols.warning,`${chalk.hex('#ffaf00').bold('Please read the documentation if you are not sure.')}`)
   console.log(logSymbols.warning,`${chalk.hex('#ffaf00').bold('See')}: ${chalk.hex('#626262').underline('https://github.com/Saksorn21/nyren-ts-setup/blob/main/README.md')}`)
}

export async function processSpinner(opts: SpinnerInput) {
   const { title, on, end, tiemout } = opts
   const spinner = await ora({text:title}).start();
   setTimeout(() =>{
     spinner.prefixText = chalk.dim('[info]');
     
     spinner.spinner = 'balloon';
     spinner.color = 'gray';
     spinner.text = on;
     spinner.succeed(end);
 
       }, tiemout || 1000)
   
}


