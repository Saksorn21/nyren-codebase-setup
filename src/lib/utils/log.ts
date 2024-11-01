import {tools as t} from '../help.js'
import taxi from './taxi.js'
import color from './color.js'
import utils from './main.js'
const levels: Record<string,Function> = {
  log: color.white.dim,
  info: color.lightSteelBlue,
  trace: color.hex('d7d7ff').dim,
  detail: color.slateBlue,
  warn: color.amber,
  error: color.red,
  fail: color.hex('FF0000'),
}
function _log(type:string, message?: string) {
  let msg = ''
  if (typeof message === 'string'){
   msg = `${utils.prefixCli} ${message ? levels[type](message) : ''}`
    }else{
    msg = `${utils.prefixCli} ${message ? levels[type](JSON.stringify(message,null,2)) : ''}`
    }
  process.nextTick(() => {
    taxi.emit('log', { type: type, message, colour: msg });
  })
  if (type === 'error') {
    console.error(msg);
  } else {
    console.log(msg || '');
  }
}
class Logger { 
  constructor(){
    if (!(this instanceof Logger)) {
      return new Logger();
    }
  
  }
  info(message: string){
    _log('info', message)
  }
  trace( message: string){
    _log('trace', message)
  }
  detail( message: string){
    _log('detail', message)
  }
  warn(message: string){
    _log('warn',message)
  }
  error(message: string){
    _log('error', message)
  }
  fail(message: string){
    _log('fail', message)
  }
}


const log = new Logger()

export default log
