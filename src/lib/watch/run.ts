import log from '../utils/log.js'
import taxi from '../utils/taxi.js'
import { watch, resetWatchers } from './changed.js'
import { resolvePath, dirname, trimCwd, findLocalBinaryPath } from '../pathHelper.js'
let runCmd = false
//import {config} from 'nodemon'
export const run = async () => {
   taxi.once('nodemon:config', async (event) =>{ 
     let config = event
     
      runCmd = !config.options.runOnChangeOnly || config.lastStarted !== 0;
taxi.on('nodemon:start', () =>{})
     if (runCmd) {

      log.trace('starting `' + trimCwd(config.options.execOptions.script) + '`');
     } else {
       log.detail('start watch on: %s' + config.options.watch);
       if (config.options.watch !== false) {
      watch()

       }
     }
     if (config.options.watch !== false) {
  watch()
     }
   })
  
  taxi.on('nodemon:exit', (code) =>{
    code = code ?? 0
    if(code === 0){
      if (runCmd) log.trace('clean exit - waiting for changes before restart')
    }
  })
}
run.kill = () =>{
    resetWatchers()
}
