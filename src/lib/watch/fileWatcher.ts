import nodemon, {config} from 'nodemon'
import type { 
  NodemonEventStart,
  NodemonEventRestart, 
  NodemonEventQuit, 
  NodemonEventExit } from 'nodemon'
import log from '../utils/log.js'
import taxi from '../utils/taxi.js'
import { watch, resetWatchers } from './changed.js'
import { resolvePath, dirname, trimCwd, findLocalBinaryPath } from '../pathHelper.js'
import { readdir, readFile, exists } from '../fileSystem.js'
import { validExtensionsFile } from '../utils.js'
import { tools as t } from '../help.js'
interface FileWatcherOptions {
  scriptPath?: string
  fullPath?: string
  watchAll?: boolean
  watchFilesAll?: string[]
  watchPaths?: string[]
  ignore?: boolean | string[]
}
let options = {}
const PREFIXWATCH = `${t.prefixCli} ${t.toolIcon}`
const logMessage = (message: string) => t.log(PREFIXWATCH, t.text('#d7d7ff').dim(message))
// Retrieves ignore patterns from both .nyrenignore and .gitignore files.
// If both files exist, their patterns will be combined into a single array.
// Lines starting with '#' are treated as comments and ignored.
export async function getIgnorePatterns(): Promise<string[]> {
  const readIgnoreFile = async (filename: string): Promise<string[]> => {
    try {
      const content = await readFile(resolvePath(process.cwd(), filename));
      return content
        .split('\n')
        .filter(line => line.trim() !== '' && !line.startsWith('#'));
    } catch (err: any) {
      if (err.code === 'ENOENT') return []; 
      throw err;
    }
  };

  const nyrenignorePatterns = await readIgnoreFile('.nyrenignore');
  const gitignorePatterns = await readIgnoreFile('.gitignore');

  return [...nyrenignorePatterns, ...gitignorePatterns];
}

export async function monitorChanges(scriptPath: string, opts: FileWatcherOptions): Promise<void> {
  let watched
  await eventPreStart(scriptPath, opts);
  
  const getBinaryBunPath = await findLocalBinaryPath('bun');
 
  nodemon({
    script: opts.fullPath as string,
    ignore: opts.ignore as string[],
    watch: opts.watchFilesAll,
    execMap: { ts: getBinaryBunPath, js: getBinaryBunPath },
    verbose: true,
    restartable: 'rl',
    ext: 'js,cjs,mjs,json,ts',
    stdout: false
  });
  
    
  
  return new Promise( async(resolve, reject) => {
    let hasStarted = false;
    taxi.once('nodemon:config', async (event) =>{ 
      let config = event
 console.log(!config.options.runOnChangeOnly || config.lastStarted !== 0)
                                   
      var runCmd = !config.options.runOnChangeOnly || config.lastStarted !== 0;
      
      if (runCmd) {

       log.trace('starting `' + config.command.string + '`');
      } else {
        // should just watch file if command is not to be run
        // had another alternate approach
        // to stop process being forked/spawned in the below code
        // but this approach does early exit and makes code cleaner
        log.detail('start watch on: %s', config.options.watch);
        if (config.options.watch !== false) {
         await watch([dirname(opts.fullPath as string)],nodemon.config)

        }
      }
      if (config.options.watch !== false) {
        watch([dirname(opts.fullPath as string)],nodemon.config)
      }
  })
    
    
    
    
    nodemon.on('readable', async()=> {
      taxi.emit('nodemon:config', config)
      
      nodemon.stdout.on('data', (data) => {
        
        console.log(`[Nodemon Output]: ${data.toString()}`);
        // จัดการ output ที่ได้ เช่น เขียนไปยังไฟล์ หรือแสดงใน console
      });
  

    }).on('crash', () => {
        logMessage('Application has crashed!');
        reject(new Error('Application crashed'));
      }).on('restart', () => {
      
      })
      .on('quit', (code) => {
        resetWatchers()
        eventQuit(code);
      })
      .on('exit', (code) => {
        
        eventExited(code)
    })
  })
}

async function eventPreStart(scriptPath: string, opts: FileWatcherOptions ) {
  
   opts.scriptPath = scriptPath

     const chackedPathes = await exists(scriptPath)
    if(chackedPathes && validExtensionsFile(scriptPath)){
      t.log(t.prefixCli, t.toolIcon, t.text('#F46036').dim(`The project will be run in the directory: ${t.textWhit(scriptPath)}.`))
    }else {
      t.log( t.textRed(`error`),t.textWhit.dim(`: file not found "${scriptPath}" please check the path.`))
      process.exit(2)
    }
  await handleOptions(scriptPath,opts)
  logMessage(`to restart at any time, enter 'rl'`)
 logMessage(`watching path(s): ${ opts ?opts.watchPaths.join(', ') : 'all'}`)
  logMessage('watching extensions: js|cjs|mjs|json|ts')
}

function eventStart(scriptPath: string){
  
  logMessage(`staring \`${t.textWhit(scriptPath)}\``)
}
async function eventRestart(changed?: NodemonEventRestart): Promise<void>{
  if (changed && changed.matched) {
    const { result, total } = changed.matched;
    logMessage(`changes after filters (before/ after) (${result.length} / ${total})`)
    logMessage(`restarted due to: ${trimCwd(result)} : ${total} files changed`);
  }else {
     logMessage(`changes after filters (before/ after): ${changed.length} / 1`)
    logMessage(`restarted due to: ${trimCwd(changed as string)} files`);
    
  }
}
function eventQuit(code?: NodemonEventQuit){
  logMessage(`${t.textRed('error')} : exited with code ${code ?? 'unknown'}`);
   process.exit(code ?? 1); // กำหนดค่าเป็น 1 หาก code เป็น null หรือ undefined
}
function eventExited(code?: NodemonEventExit){
  code = code ?? 0;
   if (code === 130) {
      logMessage('was terminated by Ctrl+C (SIGINT).');
    } else if (code === 143) {
      logMessage('was terminated (SIGTERM).');
    }else if(code === 0){
     log.detail('clean exit - waiting for changes before restart')
     
    }
     
    }

async function handleOptions(scriptPath: string, opts: FileWatcherOptions) {
  const isIgnore = opts.ignore ?? true;
  if (isIgnore) {
    logMessage(`Loading ignore patterns from .nyrenignore and .gitignore`);
  }

  const isAllFiles = opts.watchAll ?? false;
  if (isAllFiles) {
    logMessage(`Watching all files`);
  }

  
  opts.fullPath = resolvePath(process.cwd(),scriptPath);
  const baseDir = dirname(opts.fullPath);

  opts.watchFilesAll = isAllFiles 
    ? ['*.*'] 
    : [`${baseDir}/**/*.js`, `${baseDir}/**/*.ts`];
  opts.watchPaths = opts.watchFilesAll.map(file => trimCwd(file)).filter(file => file !== '')
  opts.ignore = isIgnore ? await getIgnorePatterns() : [];
}
(async () => {
try {

  
  await monitorChanges('src/index.js',{ignore: false, watchAll: false}) 
  console.log('Tracking changes...');
} catch (error) {
  console.error('Failed to start tracking: ', error);
}
})();