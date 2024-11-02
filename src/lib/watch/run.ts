import log from '../utils/log.js'

import utils from '../utils/main.js'
import { watch, resetWatchers } from './changed.js'
import { resolvePath, dirname, trimCwd, findLocalBinaryPath } from '../pathHelper.js'
import nodemon from 'nodemon'
import type {
  NodemonEventStart,
  NodemonEventRestart,
  NodemonEventQuit,
  NodemonEventExit,
} from 'nodemon'
const taxi = utils.taxi
let runCmd = false
let config
export const run = async () => {
  
   taxi.once('nodemon:config', async (event) =>{ 
     config = event
     
      runCmd = !config.options.runOnChangeOnly || config.lastStarted !== 0;
     
        
    
     if (runCmd) {

      log.trace('starting `' + trimCwd(config.options.execOptions.script) + '`');
     } else {
       log.detail('start watch on: ' + config.options.watch);
       if (config.options.watch !== false) {
      watch()

       }
     }
     // if (config.options.watch !== false) watch()
     
     taxi.on('nodemon:start', () => taxi.emit('start', config)
    )
   })
  taxi.on('start', (config) =>  utils.log.trace('starting `' + trimCwd(config.options.execOptions.script) + 'p`') )
    taxi.on('nodemon:stdout', (data: Buffer) => {
       console.log(data.toString())
     })
    
     taxi.on('nodemon:exit', (code) => eventExited(code)
     )
  taxi.on('nodemon:crash', () => utils.log.fail('Application has crashed!'))
  taxi.on('nodemon:quit', (code:NodemonEventQuit) => {
    run.kill()
    nodemon.reset(run.kill())
    eventQuit(code)
  })
    


}
process.on('exit', function (code, signal) {
  console.log('exiting')
  console.log(code, signal)
})

run.kill = () =>{
  
    resetWatchers()
}
function eventExited(code?: NodemonEventExit) {
  code = code ?? 0
  if(runCmd){
  
  if (code === 130) {
    log.detail('was terminated by Ctrl+C (SIGINT).')
  } else if (code === 143) {
      log.detail('was terminated (SIGTERM).')
  } else if (code === 0) {
      log.detail('clean exit - waiting for changes before restart')
  }
    process.exit(code)
    }
  
}

function eventQuit(code?: NodemonEventQuit) {
  
    utils.log.fail(`${utils.color.red('error')}${utils.color.reset.all(`: exited with code ${code ?? 'unknown'}`)}`)
  process.exit(code ?? 1) // กำหนดค่าเป็น 1 หาก code เป็น null หรือ undefined
}
