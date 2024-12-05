#!/usr/bin/env node
import { EventEmitter } from 'node:events'

import { readPackageJson } from '../packageJsonUtils.js'
import { createProject } from '../../createProject.js'
import { runAction } from '../../runAction.js'
import { installAction } from '../../installAction.js'
import { executeScriptDynamic } from '../../executeScriptDynamic.js'
import examples from '../../bin/examples.js'
import {
  createProjectWithOptions,
  fastCreateProject,
  type InitOpts,
} from '../../createProjectWithOptions.js'
import { checkForUpdate, chackNodeVersion } from '../checkVersion.js'
import { updateLatestVersion } from '../../updateVersion.js'
import cursor from '../cursor.js'
import process from 'node:process'
class Option {
  flags: string
  required: boolean
  optional: boolean
  variadic: boolean
  description: string
  defaultValue: string | undefined
  defaultValueDescription: string | undefined
  short?: string
  long?: string
  constructor(flags: string, description: string) {
    this.flags = flags
    this.description = description || ''

    this.required = flags.includes('<') // A value must be supplied when the option is specified.
    this.optional = flags.includes('[')
    this.variadic = /\w\.\.\.[>\]]$/.test(flags)
    const optionFlags = splitOptionFlags(flags)
    this.short = optionFlags.shortFlag
    this.long = optionFlags.longFlag
    this.defaultValue = this.defaultValueDescription = undefined
  }
  default(value: any, description: string) {
    this.defaultValue = value
    this.defaultValueDescription = description
    return this
  }
  name() {
    if (this.long) {
      return this.long.replace(/^--/, '')
    }
    return this.short.replace(/^-/, '')
  }
  is(arg: string) {
    return this.short === arg || this.long === arg
  }
  isBoolean() {
    return !this.required && !this.optional
  }
  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''))
  }
}
function camelcase(str: string) {
  return str.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1)
  })
}

function splitOptionFlags(flags: string) {
  let shortFlag, longFlag
  // Use original very loose parsing to maintain backwards compatibility for now,
  // which allowed for example unintended `-sw, --short-word` [sic].
  const flagParts = flags.split(/[ |,]+/)
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
    shortFlag = flagParts.shift()
  longFlag = flagParts.shift()
  // Add support for lone short flag without significantly changing parsing!
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag
    longFlag = undefined
  }
  return { shortFlag, longFlag }
}
function hasFlag(
  flag: string,
  argv: readonly string[] = process.argv
): boolean {
  const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--'
  const position = argv.indexOf(prefix + flag)
  const terminatorPosition = argv.indexOf('--')
  return (
    position !== -1 &&
    (terminatorPosition === -1 || position < terminatorPosition)
  )
}
class Argument {
  description: string
  variadic: boolean
  required: boolean
  _name: string
  parseArg: any
  defaultValue: any
  defaultValueDescription: string | undefined
  argChoices: any
  constructor(name: string, description: string) {
    this.description = description || ''
    this.variadic = false
    this.parseArg = undefined
    this.defaultValue = undefined
    this.defaultValueDescription = undefined
    this.argChoices = undefined

    switch (name[0]) {
      case '<': // e.g. <required>
        this.required = true
        this._name = name.slice(1, -1)
        break
      case '[': // e.g. [optional]
        this.required = false
        this._name = name.slice(1, -1)
        break
      default:
        this.required = true
        this._name = name
        break
    }

    if (this._name.length > 3 && this._name.slice(-3) === '...') {
      this.variadic = true
      this._name = this._name.slice(0, -3)
    }
  }

  /**
   * Return argument name.
   *
   * @return {string}
   */

  name() {
    return this._name
  }

  /**
   * @package
   */

  _concatValue(value: any, previous: any) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value]
    }

    return previous.concat(value)
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Argument}
   */

  default(value: any, description: string): Argument {
    this.defaultValue = value
    this.defaultValueDescription = description
    return this
  }

  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */

  argParser(fn: Function) {
    this.parseArg = fn
    return this
  }

  /**
   * Only allow argument value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */

  choices(values: string[]) {
    this.argChoices = values.slice()
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(
          `Allowed choices are ${this.argChoices.join(', ')}.`
        )
      }
      if (this.variadic) {
        return this._concatValue(arg, previous)
      }
      return arg
    }
    return this
  }

  /**
   * Make argument required.
   *
   * @returns {Argument}
   */
  argRequired() {
    this.required = true
    return this
  }

  /**
   * Make argument optional.
   *
   * @returns {Argument}
   */
  argOptional() {
    this.required = false
    return this
  }
}

/**
 * Takes an argument and returns its human readable equivalent for help usage.
 *
 * @param {Argument} arg
 * @return {string}
 * @private
 */

function humanReadableArgName(arg: Argument) {
  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '')

  return arg.required ? '<' + nameOutput + '>' : '[' + nameOutput + ']'
}

let parseArg = process.argv.slice(2)
const globalOptions = ['--help', '-h', '--version', '-v']
function parseCommand(cmd: string) {
  const log = console.log
  const opts: any = {}
  const commandIndex = process.argv.indexOf('--')
  const args = parseArg.slice(commandIndex - 1, parseArg.length)
  switch (cmd) {
    case 'init':
      const supCommand = parseArg.slice(1).shift()
      console.log('sup', supCommand)
      if (supCommand === 'fast' || supCommand === 'quick') {
        if(commandIndex === -1) process.exit(1)
        parseOptions(opts)
 
        return fastCreateProject(args, opts)
      }
      parseOptions(opts)
      log('init ' + parseArg.slice(1), opts)
      
      log('false ' + parseArg.slice(1, 2))
    const fn =  Object.keys(opts).length !== 0
      ?  createProjectWithOptions(opts)
      :  createProject()
      return fn
    case 'install':
    case 'i':
    case 'add':
      parseOptions(opts)
      log('install' + parseArg)
      return installAction.apply(null,{args})
    case 'update':
      log('update' + parseArg)
      break
    case 'help':
    case 'h':
      help()
      break
    default:
      log('default' + parseArg)
      break
  }
}
function parseOptions(opts, argv = process.argv) {
  for (let i = 1; i < parseArg.length; i++) {
    let args = parseArg[i]
    const qe = args.indexOf('=')
    args = qe !== -1 ? args.split('=')[0] : args
    parseArg[i] = qe !== -1 ? parseArg[i].split('=')[0] : args
    parseArg = [...parseArg[i], ...parseArg.slice(i + 1)]
    console.log('m',args,qe, parseArg[i])
    if (hasFlag(args)) {
      
      
      if (args === '--project-name' || args === '-n')
        opts.projectName = parseArg[i + 1]
      else if (args === '--target' || args === '-t')
        opts.target = parseArg[i + 1]
      else if (args === '--module' || args === '-m')
        opts.module = parseArg[i + 1]
      else if (args === '--directory' || args === '-d')
        opts.directory = parseArg[i + 1]
      else if (args === '--help' || args === '-h') return help(argv.slice(2).shift())
      else if (args === '--version' || args === '-v') opts.version = true
      else if (args === '--prefix' || args === '-p')
        opts.prefix = parseArg[i + 1]
      else if (args === '--silent' || args === '-s') opts.silent = true
      else if (args === '--watch' || args === '-w') opts.watch = true
      else {
        opts.help = true
        break
      }
    }
  }
  console.log(opts)
}
const helpWidth = process.stdout.columns < 60 ? 80 : process.stdout.columns || 80
const helpIndent = 2
const itemSeparatorWidth = 2
function formatHelpMessage(
  command: string,
  description: string,
  width: number,
  indent: number,
  minColumnWidth: number = 20

): string {
  const indentSpace = ' '.repeat(indent)
  const columnWidth = Math.max(minColumnWidth, command.length + 2)
  const descriptionStart = indent + columnWidth

  if (descriptionStart + description.length <= width) {
    // กรณีคำสั่งและคำอธิบายพอดีในบรรทัดเดียว
    return indentSpace + command.padEnd(columnWidth, ' ') + description
  } else {
    // กรณีคำอธิบายยาวเกินไป ให้ขึ้นบรรทัดใหม่
    const wrappedDescription = wrapText(description, width - descriptionStart)
    return (
      indentSpace +
      command.padEnd(columnWidth, ' ') +
      wrappedDescription.shift() + // แสดงบรรทัดแรก
      '\n' +
      wrappedDescription
        .map(line => ' '.repeat(descriptionStart) + line) // จัดบรรทัดใหม่ให้ชิดคอลัมน์
        .join('\n')
    )
  }
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if(word === '\n') return ''
    if ((currentLine + word).length > maxWidth) {
      lines.push(currentLine.trim())
      currentLine = word + ' '
    } else {
      currentLine += word + ' '
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim())
  }

  return lines
}

// ตัวอย่างการใช้งาน:
const formattedHelp = [
  formatHelpMessage(
    'init [options]',
    'Create a new project with a template.',
    helpWidth,
    helpIndent
  ),
  '  SupCommand:',
  formatHelpMessage(
    'quick, fast -- [project-name | target | module]',
    'Quick Start the project without being guided through a series of prompts.',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage(
    'install [options]',
    'Installation libraries for the project on npm.',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage(
    'update',
    'Update the project to the latest version.',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage(
    'help [command]',
    'Display help for [command]',
    helpWidth,
    helpIndent
  ),
].join('\n')
const formattedOptions = [
  formatHelpMessage(
    '-h, --help',
    'Display help for [command]',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage(
    '-v, --version',
    'Display version information.',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage(
    '-p, --prefix',
    'Prefix for the project name.',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage('-s, --silent', 
                    'Silent mode.', helpWidth, helpIndent),
  formatHelpMessage('-w, --watch', 'Watch mode.', helpWidth, helpIndent),
  formatHelpMessage(
    '-n, --project-name',
    'Project name.',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage('-t, --target', 'Target for the project', helpWidth, helpIndent),
  formatHelpMessage('-m, --module', 'Module name.', helpWidth, helpIndent),
].join('\n')

function help(cmd?: string) {
  console.log('cmd',cmd)
  const helpAll = `Usage: nyrenx ${cmd ? cmd + ' ' : ''}[command | script | fileName] [options]
  
Commands:
${formattedHelp}

Options:
${formattedOptions}
    
    `
  if (cmd) {
    if(cmd === 'i') console.log(examples.install)
    if(cmd === 'init' || cmd === 'fast' || cmd === 'quick') console.log(`Usage: nyrenx ${cmd} [quick | fast] [options] -- [arguments]`,examples.init)
    if(cmd === 'update') console.log(examples.update)
    
  } else {
    console.log(helpAll)
  }
}

async function run(listener: any,options: Object = {}, args: Array<string> = []) {
   //await listener
  
}


async function parse(_argv = process.argv) {
  const argv = _argv.slice(2)
  const command = argv.shift()
  const base = `commands:${command}`
  console.log(argv, command)
 const fn = parseCommand(command)
 await run
  
}

;(async () => await parse())()
