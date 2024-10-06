import { readPackageJson } from './lib/packageJson';
import { copyRepo, createJsonFile } from './lib/fileSystem'
import {setModule, build, input, confirm} from './lib/prompts'
import { runCommand } from './lib/exec'
import {oraPromise } from 'ora';
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
interface SpinnerInput<T> {
  start: string;
  success: string;
  fail: string;
  callAction: PromiseLike<T>

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
  
  const tarage = await processSpinner({ 
    start: 'Setup repo-templates', // ข้อความตอนเริ่ม
      success: 'Completed!', // ข้อความเมื่อสำเร็จ
      fail: 'Failed!', // ข้อความเมื่อเกิดข้อผิดพลาด
    callAction: build()
  }) 
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
    process.exit(1)
    }
 await helpWarn()

  if (await confirm('Do you want to continue?')){
    
   if(await copyRepo(row.src.toString(), process.cwd() + '/__tests__/' + row.name.toString())) {

     console.log(logSymbols.success, chalk.green.bold('Build completed!'))
     const creating = await processSpinner({
       start: 'Creating package.json',
       success: 'Completed!',
       fail: 'Failed!',
       callAction: createJsonFile(process.cwd()+ '/__tests__/' + row.name.toString(), template)
     })
     if (creating.success){
       console.log(logSymbols.success, chalk.green.bold('Create package.json completed!'))
       process.exit(1)
       }
     console.log(logSymbols.error, chalk.red.bold(`Create package.json failed: ${((creating.error) as Error).message}`))
     process.exit(1)
    }
    console.log(logSymbols.error, chalk.red.bold('faild'))
    process.exit(1)
  }
    console.log(logSymbols.error, chalk.red.bold('cancel'))
  process.exit(1)
  }
async function helpWarn(): Promise<void> {
   console.log(logSymbols.warning,`${chalk.hex('#ffaf00').bold('Will overwrite directory')}`)
   console.log(logSymbols.warning,`${chalk.hex('#ffaf00').bold('Please read the documentation if you are not sure.')}`)
   console.log(logSymbols.warning,`${chalk.hex('#ffaf00').bold('See')}: ${chalk.hex('#626262').underline('https://github.com/Saksorn21/nyren-ts-setup/blob/main/README.md')}`)
}

export async function processSpinner<T>(opts: SpinnerInput<T>): Promise<T> {
   const { start, success, fail, callAction } = opts
   const spinner = await oraPromise(() => callAction, { 
    color: 'white',
    text: chalk.hex('#949494').bold(start),
    successText: chalk.hex('#87ffaf').bold(success), // ข้อความเมื่อสำเร็จ
    failText: chalk.hex('#d7005f').bold(fail), // ข้อความเมื่อเกิดข้อผิดพลาด
  })
  return spinner
}

export async function processExce(command: string, library: string) {
   await runCommand(`${command} ${library}`)
}



