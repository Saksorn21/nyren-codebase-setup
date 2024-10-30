import log from '../utils/log.js'
import taxi from '../utils/taxi.js'
import { watch, resetWatchers } from './changed.js'
import { resolvePath, dirname, trimCwd, findLocalBinaryPath } from '../pathHelper.js'
//import {config} from 'nodemon'
export const run = async () => {
   taxi.once('nodemon:config', async (event) =>{ 
     let config = event
     const dirs = config.dirs.map(dir => dir)
   console.log(config)

     var runCmd = !config.options.runOnChangeOnly || config.lastStarted !== 0;

     if (runCmd) {

      log.trace('starting `' + trimCwd(config.options.execOptions.script) + '`');
     } else {
       log.detail('start watch on: %s', config.options.watch);
       if (config.options.watch !== false) {
        await watch()

       }
     }
     if (config.options.watch !== false) {
     watch()
     }

   })
}
run.kill = () =>{
    resetWatchers()
}
