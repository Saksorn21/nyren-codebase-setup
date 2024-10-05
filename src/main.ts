import { readPackageJson } from './lib/packageJson';
import { copyRepo } from './lib/fileSytem'
import {build, input} from './lib/prompts'
import ora from 'ora';
import chalk from 'chalk';
export interface OptsInits {
  name?: string;
  template?: string;
  path?: string;
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
export async function createProject(opts: OptsInits) {
  
console.log(`options: ${JSON.stringify(opts)}`)
 const module = await build()
  if (module === 'typescript') {
    const repo = readPackageJson('./repo-templates')
    const row: any = {}
    for (const [key, value] of packageJson){
      const answer =  await input(key)
      
      if (typeof repo[key] === 'string'){
        row[key] = answer === '' ? repo[key] : answer || value
        repo[key] = answer === '' ? repo[key] : answer || value
      }
      if (Array.isArray(repo[key])) {
        repo[key] = [repo[key], ...answer.split(',')]
        } 
      
    }
    
    console.log(repo, row);
    
    const spinner = ora(chalk.hex('#ffd7af').bold('create project')).start();
 
   setTimeout(() => {
      spinner.color = 'cyan';
      spinner.text = chalk.hex('#d7875f').bold('Loading template')
     spinner.succeed(chalk.hex('#ffffff').bold('create project with typescript'));
    }, 1000);
    //console.log(answer)
  }
}
