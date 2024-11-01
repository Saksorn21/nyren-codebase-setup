import chalk, {type ChalkInstance} from 'chalk'
import symbols from '../symbols.js'
type ColorForChalk = (hex: string) => ChalkInstance
interface Color {
  hex: typeof _color
  nyren: ChalkInstance
  orange: ChalkInstance
    deepBlue: ChalkInstance
    white: ChalkInstance
    grey: ChalkInstance
    green: ChalkInstance
    red: ChalkInstance
    amber: ChalkInstance
    slateBlue: ChalkInstance
    lightSteelBlue: ChalkInstance
  bg: ColorForChalk
  reset: {
  all: ChalkInstance
  style: (msg: string) => string
  color: (msg: string) => string
    }
  
}
const _color: ColorForChalk = (hex: string) => chalk.hex('#' + hex).bold
const color: Color = {
  ...symbols,
  hex: _color,
  nyren: _color('9067C6'), // Signature color
  orange: _color('ffaf00'),
  deepBlue: _color('00afff'),
  white: _color('ffffff'),
  grey: _color('626262'),
  green: _color('87ffaf'),
  red: _color('E53935'), // #FF0000
  amber: _color('FFC107'),
  slateBlue: _color('5f5faf'),
  lightSteelBlue: _color('d7d7ff'),
  bg: (bgHex: string, hex: string = 'ffffff') => chalk.bgHex(bgHex).hex(hex).bold,
  reset: {
  all: chalk.reset,
  style: (msg: string) =>`\x1B[22m${msg}`,
  color: (msg: string) => `\x1B[39m${msg}`
  }
}
export default color
