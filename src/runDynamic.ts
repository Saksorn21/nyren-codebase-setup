import { resolvePath } from './lib/pathHelper.js'
import { readPackageJson } from './lib/packageJsonUtils.js'
import { executeCommand } from './lib/executeCommand.js'
import which from 'which'
import { tools as t } from './lib/help.js'
import { type Command } from 'commander'

const enum MatchResult {
  MATCH_FOUND,
  NO_MATCH
}

const findOrFallbackToNpx = async (commandArgs: string[]) => {
  try {
    await which(commandArgs[0]);
  } catch {
    t.log(t.prefixCli, t.toolIcon, t.text('#EF3054')(
      `Since the package: ${t.textWhit(commandArgs[0])} is missing, we will ${t.textWhit('install')} it temporarily using ${t.textWhit('npx')} automatically.`
    ));
    commandArgs.unshift('npx', '--yes');
  }
}
const findMatchingScript = async (commandArgs: string[]): Promise<{ result: MatchResult , commandArgs: string[] }> => {
  try {
    const scripts = readPackageJson(resolvePath(process.cwd(), 'package.json')).scripts;

    for (const [key, value] of Object.entries(scripts)) {
      if (commandArgs[0] === key) {
        commandArgs.length = 0;
        commandArgs.push(...value.split(' '));
        return { result: MatchResult.MATCH_FOUND, commandArgs };
      }
    }
    return { result: MatchResult.NO_MATCH, commandArgs };
  } catch (error) {
    throw new Error(`Failed to read or process the package.json file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
const processCommand =(commandArgs: string[]): Promise<void> => new Promise((resolve, reject) => { 
  const command = commandArgs[0]
  if (!command.endsWith('ts') && !command.endsWith('js') && !command.endsWith('cjs') && !command.endsWith('mjs')){
    t.log(t.prefixCli, t.toolIcon, t.text('#EF3054')(`The command: ${command} is not a valid command: ${t.textWhit(`path/to/file.<ts,js | cjs | mjs>`)}`))
     reject(new Error(`The command: ${command} is not a valid command.`))
  }
  if (command.endsWith('ts')){
    commandArgs.unshift('bun')
    t.log(t.textGreen(`${t.idea} script: ${t.textWhit.dim(`[${commandArgs.join(' ')}]`)}`))
    
  }else if (command.endsWith('js') || command.endsWith('cjs') || command.endsWith('mjs')){
    commandArgs.unshift('node')
    t.log(t.textGreen(`${t.idea} script: ${t.textWhit.dim(`[${commandArgs.join(' ')}]`)}`))
    
  }else{
    t.log(t.textGreen(`${t.idea} script: ${t.textWhit.dim(`[${commandArgs.join(' ')}]`)}`))
  }
  resolve()
  })
async function subCommandWhichToCombine(commandArgs: string[]) {
  await findOrFallbackToNpx(commandArgs)
  const commandToCombine = commandArgs.slice(0,3).join(' ')
  const args = commandArgs.slice(3)
   if (commandArgs[0] === 'npx'){
     commandArgs.length = 0
     commandArgs.push(commandToCombine, ...args)
   }
}

// follwing is the options -w, --wath
const processWathCommand =  async (commandArgs: string[]): Promise<void> => {
  if (commandArgs[0] === 'bun') {
     await subCommandWhichToCombine(commandArgs)
    commandArgs.unshift( 'nodemon' , '--exec')

  }else if (commandArgs[0] === 'node'){
    commandArgs[0] = 'nodemon'
    
  }
}
// follwing is the main function
export async function runDynamic(
  program: Command,
  script: string,
  rawArgs: string[]
) {
  if (!script) {
    program.outputHelp()
    process.exit(1)
  }
  
  const options = program.opts()
  const commandArgsResult = []
  // construct the full command line manually including flags
  const commandIndex = rawArgs.indexOf(script)
  //Variables not yet handled
  const forwardedArgs = rawArgs.slice(commandIndex + 1)
  
  const {result: scriptMatchResult, commandArgs} = await findMatchingScript([script]);
  
  if (scriptMatchResult === MatchResult.MATCH_FOUND) {
    console.log('Matched script args:', commandArgs);
    // nyrenx -- ./path/to/file.<ts,js | cjs | mjs>
  } else {
    await processCommand(commandArgs)
    console.debug('scripts', commandArgs)
    console.log('Check file extension',commandArgs)
    if (options) await processWathCommand(commandArgs)
    console.log('opts',commandArgs)

    await findOrFallbackToNpx(commandArgs)
  }
  
  console.log('match',commandArgs)

  console.log('dynamaic',commandArgs)
 // await executeCommand(commandArgs)

}
