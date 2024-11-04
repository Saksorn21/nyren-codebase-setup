import chalk from 'chalk'
import isUnicodeSupported from 'is-unicode-supported'
const isHyper = typeof process !== 'undefined' && process.env.TERM_PROGRAM === 'Hyper';
const isLinux = typeof process !== 'undefined' && process.platform === 'linux'

const _isUnicode: boolean = isUnicodeSupported()
const colorBold = chalk.bold
const info = colorBold.blue(_isUnicode ? 'ℹ' : 'i')
const success = colorBold.green(_isUnicode ? '✔' : '✓')
const warning = colorBold.yellow(_isUnicode ? '⚠️' : '‼')
const error = colorBold.red(_isUnicode ? '❌' : '×')
const fast = colorBold.yellow(_isUnicode ? '⚡' : 'ϟ')
const idea = colorBold.cyan(_isUnicode ? '💡' : 'i')
const toolIcon = colorBold.blackBright(_isUnicode ? '🛠️' : '[Tool]')
const namespace = { info, success, warning, error, fast, idea, toolIcon }
export default namespace
