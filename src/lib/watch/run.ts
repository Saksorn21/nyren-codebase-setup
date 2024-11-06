import log from '../utils/log.js'
import nodemon,{ config as nodemonConfig } from 'nodemon'
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
let config: NodemonEventConfig = nodemonConfig

export const run = async () =>
  taxi.once('nodemon:config', async options => {
    config = options
    runCmd = !config.options.runOnChangeOnly || config.lastStarted !== 0

    if (runCmd) {
      log.info('starting `' + trimCwd(config.options.execOptions.script) + '`')
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
    processResume(config)
  })


// Customize the start nodemon event to not send anything to use.
taxi.on('start', config =>
  utils.log.trace(
    'starting `' + trimCwd(config.options.execOptions.script) + '`'
  )
)

taxi.on('nodemon:stdout', data => 
  console.log(data.toString())
)
taxi.on('nodemon:stderr', data => {
  
  let str = data.toString().split('\n')

  str.forEach((item: string, index: number) => {
    if (item.includes('^')) {
      str[index] = utils.color.red(item)
    } else if (item.includes('error')) {
      const override = str[index].split('error:')
      str[index] =
        utils.color.red('error:') + utils.color.grey(override.slice(1))
    } else if (item.includes('Bun')) {
      str.splice(index, str.length)
    }
  })

 // console.log(str.join('\n'))
})
taxi.on('nodemon:exit', (code: NodemonEventExit) => eventExitedAndQuit(code))

taxi.on('nodemon:quit', (code: NodemonEventQuit) => eventExitedAndQuit(code))

taxi.on('nodemon:crash', () =>
  utils.log.fail(
    'Something went wrong: app crashed - waiting for file changes before starting...'
  )
)
function eventExitedAndQuit(code?: NodemonEventExit | NodemonEventQuit) {
  if (code !== undefined) {
    if (code === 130) {
      log.detail('was terminated by Ctrl+C (SIGINT).')
      process.exit(130)
    } else if (code === 143) {
      log.detail('was terminated (SIGTERM).')
      process.exit(143)
      // nodemon returns null, clean state, exit - wait for files to change then restart.
    } else if (code === null) {
      setTimeout(
        () => log.detail('clean exit - waiting for changes before restart'),
        100
      )
    } else {
      log.detail('exited with code: ' + code)
    }
  }
  
  
}

function processResume(
  config: NodemonEventConfig,
  stdin: typeof process.stdin = process.stdin
) {
  if (config.options.stdin) {
    stdin.resume()
    stdin.setEncoding('utf8')
    stdin.on('data', checkExitCommand)
  }
}
run.kill = () => {
  resetWatchers()
  config.run = false
  nodemon.reset(()=>utils.log.info('Cleanup done.'))
  taxi.emit('nodemon:quit',143)
}
function checkExitCommand(data: Buffer) {
  const str = data.toString().trim().toLowerCase()

  if (str === '.exit' || str === 'exit') run.kill()
  else if (str === '.clean') console.clear()
}
// ฟังก์ชันสำหรับการทำความสะอาด


if(!utils.isWindows){
  taxi.once('boot', () => {
process.on('SIGTERM', () => {
  console.log('SIGTERM')
  run.kill()
    process.kill(process.pid, 'SIGTERM') // ปิดโปรเซส
  })
process.on('SIGINT', () => {
  console.log('SIGINT')
run.kill()
    process.kill(process.pid, 'SIGTERM') // ปิดโปรเซส
})
})
}
