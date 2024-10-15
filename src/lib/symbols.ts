import chalk from 'chalk'
import isUnicodeSupported from 'is-unicode-supported'

const _isUnicode: boolean = isUnicodeSupported()
const colorBold = chalk.bold
const info = colorBold.blue(_isUnicode ? 'ℹ' : 'i')
const success = colorBold.green(_isUnicode ? '✔' : '✓')
const warning = colorBold.yellow(_isUnicode ? '⚠️' : '‼')
const error = colorBold.red(_isUnicode ? '❌' : '×')
const fast = colorBold.yellow(_isUnicode ? '⚡' : 'ϟ')
const namespace = { info, success, warning, error, fast }
export default namespace
