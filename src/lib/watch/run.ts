import log from '../utils/log.js'

import utils from '../utils/main.js'
import { watch, resetWatchers } from './changed.js'
import { trimCwd } from '../pathHelper.js'
import type {
  NodemonEventQuit,
  NodemonEventExit,
  NodemonEventConfig,
} from 'nodemon'
const taxi = utils.taxi
let runCmd = false
let config: NodemonEventConfig = {}

export const run = async () => {
  try {
    taxi.once('nodemon:config', async event => {
      config = event

      runCmd = !config.options.runOnChangeOnly || config.lastStarted !== 0

      if (runCmd) {
        log.info(
          'starting `' + trimCwd(config.options.execOptions.script) + '`'
        )
      } else {
        log.info('start watch on: ' + config.options.watch)
        if (config.options.watch !== false) {
          watch()
        }
      }
    
      taxi.on('nodemon:start', () => taxi.emit('start', config))
      if (config.options.watch !== false) {
        watch()
      }
      utils.log.info('chlid pid: ' + process.pid)
    })
  } catch (error: unknown) {
  } finally {
    process.on('SIGTERM', () => {
      console.log('SIGTERM', process.pid)
      process.kill(process.pid, 'SIGTERM')
    })
    process.on('SIGINT', () => {
      console.log('SIGINT')
      process.kill(process.pid, 'SIGINT')
    })
    process.on('exit', function (code: number, signal: string) {
      console.log('exiting')
      console.log(code, signal)
    })
  }
}

run.kill = () => {
  resetWatchers()
}
taxi.on('start', config =>
  utils.log.trace(
    'starting `' + trimCwd(config.options.execOptions.script) + '`'
  )
)
taxi.on('nodemon:stdout', data => {
  console.log(data.toString())
})

taxi.on('nodemon:exit', (code: NodemonEventExit) => eventExitedAndQuit(code))

taxi.on('nodemon:quit', (code: NodemonEventQuit) => eventExitedAndQuit(code))

taxi.on('nodemon:crash', () => utils.log.fail('Something went wrong: app crashed - waiting for file changes before starting...'))
function eventExitedAndQuit(code?: NodemonEventExit | NodemonEventQuit) {
  if (code !== undefined) {
    if (code === 130) {
      log.detail('was terminated by Ctrl+C (SIGINT).')
    } else if (code === 143) {
      log.detail('was terminated (SIGTERM).')
      // nodemon returns null, clean state, exit - wait for files to change then restart.
    } else if (code === null) {
      setTimeout(()=>
      log.detail('clean exit - waiting for changes before restart'),500)
    } else {
      log.detail('exited with code: ' + code)
    }
  }
  taxi.on('nodemon:reset', reset => {
    resetWatchers()
    reset()
  })
}
//immediately try to stop any polling
config.run = false
function eventQuit(code?: NodemonEventQuit) {
  utils.log.fail(
    `${utils.color.red('error')}${utils.color.reset.all(`: exited with code ${code ?? 'unknown'}`)}`
  )
  process.exit(code ?? 1) // กำหนดค่าเป็น 1 หาก code เป็น null หรือ undefined
}
