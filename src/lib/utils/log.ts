import {tools as t} from '../help.js'
import taxi from './taxi.js'

const levels: Record<string,Function> = {
  log: t.textWhit.dim,
  info: t.textLightSteelBlue1,
  warn: t.textAmber,
  error: t.textRed,
  trace: t.text('d7d7ff').dim,
  detail: t.textSlateBlue3,
}

function _log(type:string, message?: string) {
  let msg = ''
  if (typeof message === 'string'){
   msg = `${t.prefixCli} ${message ? levels[type](message) : ''}`
    }else{
    msg = `${t.prefixCli} ${message ? levels[type](JSON.stringify(message,null,2)) : ''}`
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
  log(message: string){
    
    _log('log', message)
    
  }
  info(message: string){
    _log('info', message)
  }
  warn(message: string){
    _log('warn',message)
  }
  error(message: string){
    _log('error', message)
  }
  trace( message: string){
    _log('trace', message)
  }
  detail( message: string){
    _log('detail', message)
  }
}
const log = new Logger()

export default log
