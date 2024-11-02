import nodemon, { config } from 'nodemon'
import type {
  NodemonEventStart,
  NodemonEventRestart,
  NodemonEventQuit,
  NodemonEventExit,
} from 'nodemon'
import utils from '../utils/main.js'

import { run } from './run.js'

import {
  resolvePath,
  dirname,
  basename,
  trimCwd,
  findLocalBinaryPath,
} from '../pathHelper.js'
import { readdir, readFile, exists } from '../fileSystem.js'
import { validExtensionsFile } from '../utils.js'
import { tools as t } from '../help.js'
const taxi = utils.taxi
interface FileWatcherOptions {
  scriptPath?: string
  fullPath?: string
  watchAll?: boolean
  watchFilesAll?: string[]
  watchPaths?: string[]
  ignore?: boolean | string[]
  nodemon?: {
    watch: string[]
    ext: string
  }
}

// Retrieves ignore patterns from both .nyrenignore and .gitignore files.
// If both files exist, their patterns will be combined into a single array.
// Lines starting with '#' are treated as comments and ignored.
export async function getIgnorePatterns(): Promise<string[]> {
  const readIgnoreFile = async (filename: string): Promise<string[]> => {
    try {
      const content = await readFile(resolvePath(process.cwd(), filename))
      return content
        .split('\n')
        .filter(line => line.trim() !== '' && !line.startsWith('#'))
    } catch (err: any) {
      if (err.code === 'ENOENT') return []
      throw err
    }
  }

  const nyrenignorePatterns = await readIgnoreFile('.nyrenignore')
  const gitignorePatterns = await readIgnoreFile('.gitignore')

  return [...nyrenignorePatterns, ...gitignorePatterns]
}

export async function monitorChanges(
  scriptPath: string,
  opts: FileWatcherOptions
): Promise<void> {

  await eventPreStart(scriptPath, opts)

  const getBinaryBunPath = await findLocalBinaryPath('bun')
const inputConfig = opts.nodemon
  nodemon({
    script: opts.fullPath as string,
    ignore: opts.ignore as string[],
    watch: inputConfig?.watch || ['*.*'],
    execMap: { ts: getBinaryBunPath, js: getBinaryBunPath },
    verbose: true,
    restartable: 'rl',
    ext: inputConfig?.ext || '',
    stdout: false,
  })

  return new Promise(async (reject) => {
    
    await run()
      bindNodemonEvents(nodemon)
    ;(nodemon as any)
      .on('readable', () => {
        taxi.emit('nodemon:config', config)
        
        nodemon.stdout.on('data', data => {
          console.log(`\n${data.toString()}`)

        })
      })
      .on('crash', () => {
        utils.log.fail('Application has crashed!')
        reject()
      })
      .on('quit', code => {
        run.kill()
        eventQuit(code)
      })
  
  })
}
function bindNodemonEvents(nodemonEvent: typeof nodemon) {
  const events = ['start', 'quit', 'restart', 'readable', 'crash','exit'];

  events.forEach(event => (nodemonEvent as any).on(event, (...args: any[]) => taxi.emit(`nodemon:${event}`, ...args)
)
);
}
async function eventPreStart(scriptPath: string, opts: FileWatcherOptions) {
  opts.scriptPath = scriptPath

  const chackedPathes = await exists(scriptPath)
  if (chackedPathes && validExtensionsFile(scriptPath)) {
    t.log(
      t.prefixCli,
      t.toolIcon,
      t
        .text('#F46036')
        .dim(
          `The project will be run in the directory: ${t.textWhit(scriptPath)}.`
        )
    )
  } else {
    utils.log.error(
      t.textRed(`error`) +
      t.textWhit.dim(`: file not found "${scriptPath}" please check the path.`)
    )
    process.exit(2)
  }
  await handleOptions(scriptPath, opts)
  utils.log.info(`to restart at any time, enter 'rl'`)
    utils.log.info(`watching path(s): ${opts ? opts.watchPaths?.join(', ') : 'all'}`)
    utils.log.info('watching extensions: ' + opts.nodemon?.ext || '')
}


function eventQuit(code?: NodemonEventQuit) {
    utils.log.error(`${t.textRed('error')} : exited with code ${code ?? 'unknown'}`)
  process.exit(code ?? 1) // กำหนดค่าเป็น 1 หาก code เป็น null หรือ undefined
}


const processExtensionsFile=  (opts: FileWatcherOptions ): {watches: string[], ext: string} => {
  const watches: string[] = []
  const result: string[] = [];
  let ext = ['js', 'cjs', 'mjs', 'json', 'ts']
  const baseDir = utils.path.dirname(opts.fullPath ?? '')
  const script = utils.path.basename(opts.fullPath ?? '')
  const scriptExt = utils.path.extname(opts.fullPath ?? '')
  const cwd = process.cwd();
  if(!(opts.watchAll ?? false)){
  if( opts.fullPath?.endsWith('.ts')) {
    ext = ['ts', 'json']
  }else if(opts.fullPath?.endsWith('.js')){
    ext = ['js', 'json', 'cjs', 'mjs']
  }
  }
  if (cwd === baseDir) {
    result.push('*.*');
      watches.push('*.*')
    
  }else {

  for (const _ext of ext) {
    result.push(`${baseDir}/**/*.${_ext}`);
      watches.push(`${baseDir}/**/*.${_ext}`);
    }
  }
  return {watches,ext: ext.join(',')}
}
async function handleOptions(scriptPath: string, opts: FileWatcherOptions) {
  const isIgnore = opts.ignore ?? true
  if (isIgnore) {
      utils.log.info(`Loading ignore patterns from .nyrenignore and .gitignore`)
  }
  if (opts.watchAll ?? false) {
      utils.log.info(`Watching all files`)
  }
  opts.fullPath = resolvePath(process.cwd(), scriptPath)
  const { watches, ext } = processExtensionsFile(opts)
  opts.nodemon = {
    watch: watches,
    ext: ext
  }
  
 
  opts.watchPaths = opts.nodemon?.watch
    .map((file: string) => trimCwd(file))
    .filter((file: string) => file !== '')
  opts.ignore = isIgnore ? await getIgnorePatterns() : []
}

// ;(async () => {
//   try {
//     await monitorChanges('src/index.js', { ignore: true, watchAll: false })
    
//     console.log('Tracking changes...')
//   } catch (error) {
//     console.error('Failed to start tracking: ', error)
//   }
// })()
