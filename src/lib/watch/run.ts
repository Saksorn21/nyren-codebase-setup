import log from '../utils/log.js'
import taxi from '../utils/taxi.js'
import { watch, resetWatchers } from './changed.js'
import { resolvePath, dirname, trimCwd, findLocalBinaryPath } from '../pathHelper.js'
import type {
  NodemonEventStart,
  NodemonEventRestart,
  NodemonEventQuit,
  NodemonEventExit,
} from 'nodemon'
let runCmd = false
let config
export const run = async () => {
   taxi.once('nodemon:config', async (event) =>{ 
     config = event
     
      runCmd = !config.options.runOnChangeOnly || config.lastStarted !== 0;
taxi.on('nodemon:start', () =>{})
     if (runCmd) {

      log.trace('starting `' + trimCwd(config.options.execOptions.script) + '`');
     } else {
       log.detail('start watch on: ' + config.options.watch);
       if (config.options.watch !== false) {
      watch()

       }
     }
     if (config.options.watch !== false) {
  watch()
     }
  
     taxi.on('nodemon:start', () =>  log.trace('starting `' + trimCwd(config.options.execOptions.script) + '`')
        )
     taxi.on('nodemon:exit', (code) => eventExited(code)
     )
   })
}


run.kill = () =>{
  
    resetWatchers()
}
function eventExited(code?: NodemonEventExit) {
  code = code ?? 0
  runCmd = false
  
  if (code === 130) {
    log.detail('was terminated by Ctrl+C (SIGINT).')
  } else if (code === 143) {
      log.detail('was terminated (SIGTERM).')
  } else if (code === 0) {
      log.detail('clean exit - waiting for changes before restart')
  }
}
