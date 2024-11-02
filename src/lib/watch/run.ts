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
let config = {}
let isExited = false;
export const run = async () => {
  
  try {
  
   taxi.once('nodemon:config', async (event) =>{ 
     config = event
     
      runCmd = !config.options.runOnChangeOnly || config.lastStarted !== 0;
     
        
    
     if (runCmd) {

      log.trace('starting `' + trimCwd(config.options.execOptions.script) + '`');
     } else {
       log.detail('start watch on: ' + config.options.watch);
       if (config.options.watch !== false) {
         watch()
   return
          }
     }
     // if (config.options.watch !== false) watch()
     
     taxi.on('nodemon:start', () => taxi.emit('start', config)
    )
     if (config.options.watch !== false) {
       watch()

        }
   })
  
  taxi.on('start', (config) =>  utils.log.trace('starting `' + trimCwd(config.options.execOptions.script) + '`') )
    taxi.on('stdout', (stdout) => {
     stdout.on('close', (e)=>{
       console.log('close',e)
      // eventExited(e)
     //  isExited = true
     

     })})
    taxi.on('nodemon:stdout', (data) => {
      console.log(data.toString())
    })
    taxi.on('nodemon:restart', (data) => {
      console.log(data)
    })
    taxi.on('nodemon:exit', (code: NodemonEventExit) => eventExitedAndQuit(code))

  taxi.on('nodemon:quit', (code:NodemonEventQuit) => eventExitedAndQuit(code))
    taxi.on('nodemon:crash', () => utils.log.fail('Application has crashed!'))
    } catch (error: unknown) {

    } finally {
       process.on('SIGTERM', () => {

          console.log('SIGTERM',process.pid)
          
         process.kill(process.pid, 'SIGTERM');
          
        })
       process.on('exit', function (code, signal) {
         console.log('exiting')
         console.log(code, signal)
         
       })
    process.on('SIGINT',()=>{
      console.log('SIGINT')
      process.kill(process.pid, 'SIGINT')
      
    })
    }

}


run.kill = () =>{
  
    resetWatchers()
}
function eventExitedAndQuit(code?: NodemonEventExit | NodemonEventQuit) {

  if(code !== undefined){
  if (code === 130) {
    log.detail('was terminated by Ctrl+C (SIGINT).')
  } else if (code === 143) {
      log.detail('was terminated (SIGTERM).')
    // nodemon returns null, clean state, exit - wait for files to change then restart.
  } else if (code === null) {
      log.detail('clean exit - waiting for changes before restart')
  }else {
    log.detail('exited with code: ' + code)
  }
    }

  
}
//immediately try to stop any polling
config.run = false
function eventQuit(code?: NodemonEventQuit) {
  
    utils.log.fail(`${utils.color.red('error')}${utils.color.reset.all(`: exited with code ${code ?? 'unknown'}`)}`)
  process.exit(code ?? 1) // กำหนดค่าเป็น 1 หาก code เป็น null หรือ undefined
}
