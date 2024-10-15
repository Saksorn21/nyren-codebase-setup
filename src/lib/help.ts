import chalk from 'chalk'
import symbols from './symbols.js'

export interface HelpFn<T1, T2 = string, T3 = string, T4 = string> {
  [name: string]: (
    arge?: T2,
    arge2?: T3,
    arge3?: T4
  ) => Promise<T1> | T1 | string
}
const text = (hex: string) => chalk.hex(hex).bold
const textLightSteelBlue1 = text('#d7d7ff')
const textSlateBlue3 = text('#5f5faf')
const textGreen = text('#87ffaf')
const textRed = text('#d7005f')
const textOrange = text('#ffaf00')
const textDeepBlue = text('#00afff')
const textWhit = text('#ffffff')
const textGrey = text('#626262')
const prefixCli = `${textWhit('[')}${textSlateBlue3('nyrenx')}${textWhit(']')}`
let help: HelpFn<void> = {}
const info = symbols.info
const success = symbols.success
const warning = symbols.warning
const log = console.log
help.warnOverWrite = () => {
  log(warning, `${textOrange('The directory will be overwritten.')}`)
  log(
    warning,
    `${textOrange("If you're unsure, please read the documentation.")}`
  )
  log(
    warning,
    `${textOrange('For more information, see')}: ${textGrey.underline('https://github.com/Saksorn21/nyren-ts-setup/blob/main/README.md')}`
  )
}

help.libraryEx = () => {
  log(
    info,
    `${textDeepBlue(`Example: ${textWhit('nyrenx @nyren/codebase-setup @nyren/ts256k1')} or ${textWhit('@nyren/ts256k1 --D ts-node @types/node')}`)}`
  )
  log(
    info,
    `${textDeepBlue('The libraries you install will be added to the dependencies section by default.')}`
  )
  log(
    info,
    `${textDeepBlue(`To install libraries as devDependencies, use the ${textLightSteelBlue1.underline('"--D"')} flag followed by the library names.`)}`
  )
}
help.buildProject = () =>
  log(
    info,
    `${textDeepBlue("There is a default value. If you don't want to change it, just press Enter.")}`
  )

help.notification = (target?: string, module?: string): void =>
  log(
    info,
    textSlateBlue3(
      `You will start the project using the language: ${tools.textOrange('[')}${textWhit(target)}${textOrange(']')}, with the module: ${textOrange('[')}${textWhit(module)}${textOrange(']')}.`
    )
  )
help.warnSettingCompleted = (
  projectName?: string,
  userDiretory?: string
): void =>
  tools.log(
    `\r\n${success} ${textGreen(
      `Successfully setting the project: ${textWhit(projectName)} to ${textWhit(userDiretory)}`
    )}`
  )
help.noticeNewVersion = async (
  currentVersion?: string,
  latestVersion?: string,
  semVer?: string
) => {
  const prefixNoify = `${prefixCli} ${info} `
  const install = `${textDeepBlue.dim(`npm install -g @nyren/codebase-setup@latest@${latestVersion}`)}`
  const changelogUrl = `${textOrange.dim(`https://github.com/Saksorn21/nyren-codebase-setup/releases/tag/v${latestVersion}`)}`
  log('\n')
  log(
    `${prefixNoify} ${textLightSteelBlue1(`A new version (${textDeepBlue(semVer)}) is available on npm! ${textDeepBlue.dim(currentVersion)} -> ${textOrange(latestVersion)}`)}`
  )
  log(`${prefixNoify} ${textWhit(`Changelog ${changelogUrl}`)}`)
  log(
    `${prefixNoify} ${textWhit(`To update run: ${install} or ${textOrange('nyrenx update')}`)}`
  )
}
function transformString(input: string): string {
  // Check if the input starts with '@' and contains '/'
  if (input.startsWith('@') && input.includes('/')) {
    // Remove '@' and replace '/' with '-'
    return input.replace(/^@/, '').replace('/', '-')
  }
  // If the input doesn't match the conditions, return the original input
  return input
}
const tools = {
  ...symbols,
  text,
  textOrange,
  textDeepBlue,
  textWhit,
  textGrey,
  textGreen,
  textRed,
  textSlateBlue3,
  textLightSteelBlue1,
  log,
}
export { help, tools, transformString, prefixCli }
