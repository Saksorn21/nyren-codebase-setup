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
  negate: boolean
  constructor(flags: string, description: string) {
    this.flags = flags
    this.description = description || ''

    this.required = flags.includes('<') // A value must be supplied when the option is specified.
    this.optional = flags.includes('[')
    this.variadic = /\w\.\.\.[>\]]$/.test(flags)
    const optionFlags = splitOptionFlags(flags)
    this.short = optionFlags.shortFlag
    this.long = optionFlags.longFlag
    this.negate = false
    if (this.long) {
      this.negate = this.long.startsWith('--no-')
    }
    this.defaultValue = this.defaultValueDescription = undefined
  }
  default(value: any, description?: string) {
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
const arg = new Argument('[...arg]', 'description')
console.log(humanReadableArgName(arg))
class Command extends EventEmitter {
  readonly commands: readonly Command[]
  readonly options: readonly Option[]
  readonly registeredArguments: readonly Argument[]
  args: string[]
  processedArgs: any[]
  parent: Command | null
  _name: string
  _version: string | undefined
  _description: string
  
  _argsDescription: Record<string, string> | undefined
  _storeOptionsAsProperties: boolean
_optionValues: Record<string, any> | undefined
  _optionValueSources: Record<string, any> | undefined
  constructor(name?: string) {
    super()
    this.commands = []
    this.options = []
    this._optionValues = {}
    this._optionValueSources = {}
    this.registeredArguments = this.args = this.processedArgs = []
    this.parent = null
    this._name = name || ''
    this._description = ''
    this._version = this._argsDescription = undefined
    this._storeOptionsAsProperties = false
  }
  private _registerOption(option: Option) {
    const matchingOption =
      (option.short && this._findOption(option.short)) ||
      (option.long && this._findOption(option.long))
    if (matchingOption) {
      const matchingFlag =
        option.long && this._findOption(option.long)
          ? option.long
          : option.short
      throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
  -  already used by option '${matchingOption.flags}'`)
    }

    this.options.push(option)
  }
  createOption(flags: string, description: string) {
    return new Option(flags, description)
  }
  addOption(option: Option) {
    this._registerOption(option)

    const oname = option.name()
    const name = option.attributeName()

    // store default value
    if (option.negate) {
      // --no-foo is special and defaults foo to true, unless a --foo option is already defined
      const positiveLongFlag = option.long.replace(/^--no-/, '--')
      if (!this._findOption(positiveLongFlag)) {
        this.setOptionValueWithSource(
          name,
          option.defaultValue === undefined ? true : option.defaultValue,
          'default'
        )
      }
    } else if (option.defaultValue !== undefined) {
      this.setOptionValueWithSource(name, option.defaultValue, 'default')
    }

    // handler for cli and env supplied values
    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
      // val is null for optional option used without an optional-argument.
      // val is undefined for boolean and negated option.
      if (val == null && option.presetArg !== undefined) {
        val = option.presetArg
      }

      // custom processing
      const oldValue = this.getOptionValue(name)
      if (val !== null && option.parseArg) {
        val = this._callParseArg(option, val, oldValue, invalidValueMessage)
      } else if (val !== null && option.variadic) {
        val = option._concatValue(val, oldValue)
      }

      // Fill-in appropriate missing values. Long winded but easy to follow.
      if (val == null) {
        if (option.negate) {
          val = false
        } else if (option.isBoolean() || option.optional) {
          val = true
        } else {
          val = '' // not normal, parseArg might have failed or be a mock function for testing
        }
      }
      this.setOptionValueWithSource(name, val, valueSource)
    }

    this.on('option:' + oname, val => {
      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`
      handleOptionValue(val, invalidValueMessage, 'cli')
    })

    return this
  }
  setOptionValueWithSource(key, value, source) {
    if (this._storeOptionsAsProperties) {
      this[key] = value;
    } else {
      this._optionValues[key] = value;
    }
    this._optionValueSources[key] = source;
    return this;
  }
  _optionEx(flags: any, description: string, defaultValue: string) {
    if (typeof flags === 'object' && flags instanceof Option) {
      throw new Error(
        'To add an Option object use addOption() instead of option() or requiredOption()'
      )
    }
    const option = this.createOption(flags, description)
    option.default(defaultValue)

    return this.addOption(option)
  }
  option(flags: string, description: string, defaultValue: string) {
    return this._optionEx(flags, description, defaultValue)
  }
  name(): string
  name(str?: string) {
    if (str === undefined) return this._name
    this._name = str
    return this
  }
  version(): string | undefined
  version(str: string, flags?: string, description?: string): this
  version(str?: string, flags?: string, description?: string) {
    if (str === undefined) return this._version
    this._version = str
    flags = flags || '-V, --version'
    description = description || 'output the version number'
    const versionOption = this.createOption(flags, description)
    this._versionOptionName = versionOption.attributeName()
    this._registerOption(versionOption)
    this.on('option:' + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}\n`)
      this._exit(0, 'commander.version', str)
    })
    return this
  }
  description(): string
  description(str: string): this
  description(
    str?: string,
    argsDescription?: Record<string, string>
  ): string | this {
    if (str === undefined && argsDescription === undefined) {
      return this._description
    }
    if (str !== undefined) {
      this._description = str
    }
    if (argsDescription) {
      this._argsDescription = argsDescription
    }
    return this
  }

  _findCommand(name) {
    if (!name) return undefined
    return this.commands.find(
      cmd => cmd._name === name || cmd._aliases.includes(name)
    )
  }
  _findOption(arg) {
    return this.options.find(option => option.is(arg))
  }
}
let parseArg = process.argv.slice(2)
function prepareUserArgs(argv: string[] = process.argv) {
  let rawArgs, scriptPath, userArgs
   if(argv === undefined) argv = process.argv
  rawArgs = argv.slice()
  scriptPath = rawArgs[1]
  userArgs = argv.slice(2)
  return { rawArgs, scriptPath, userArgs }
}

function parseCommand(cmd: string) {
  const log = console.log;
  const opts: Record<string, any> = {};

  // หาตำแหน่ง '--' ใน argv
  const commandIndex = process.argv.indexOf('--');

  // รวม '--' และค่าหลังจากนั้นทั้งหมด
  const args: string[] =
    commandIndex !== -1 ? process.argv.slice(commandIndex) : [];

  parseOptions(opts); // ประมวลผล options ก่อน

  switch (cmd) {
    case 'init': {
      const subCommand = process.argv[2]; // ตรวจคำสั่งย่อย เช่น fast หรือ quick
      log(`subCommand: ${subCommand}`);

      if (subCommand === 'fast' || subCommand === 'quick') {
        if (args.length === 0) {
          log('Error: Missing arguments after `--`');
          process.exit(1); // ไม่มี args หลัง `--` ให้แสดงข้อผิดพลาด
        }
        log('Fast initialization with args:', args);
        return fastCreateProject(args, opts); // ส่ง args และ opts ไปใช้
      }

      log('Initialization command');
      return Object.keys(opts).length > 0
        ? createProjectWithOptions(opts)
        : createProject();
    }
    case 'install':
    case 'i':
    case 'add': {
      log('Install command with args:', args, opts);
      return installAction.apply({ args, opts: () => opts } as any, args);
    }
    case 'update': {
      log('Update command');
      return updateLatestVersion();
    }
    case 'help':
    case 'h': {
      log('Displaying help...');
      return help();
    }
    default: {
      log('Unknown command, delegating to dynamic execution:', cmd, args);
      const program = {
        outputHelp: help,
        opts: () => opts,
      };
      return executeScriptDynamic(program as any, cmd, args);
    }
  }
}
function parseOptions(opts: any, argv = process.argv) {
  // Mapping ระหว่าง option/flag กับ property ที่ต้องการใน opts
  const optionMap: Record<string, string> = {
    '--project-name': 'projectName',
    '-n': 'projectName',
    '--target': 'target',
    '-t': 'target',
    '--module': 'module',
    '-m': 'module',
    '--directory': 'directory',
    '-d': 'directory',
    '--prefix': 'prefix',
    '-p': 'prefix',
    '--help': 'help',
    '-h': 'help',
    '--version': 'version',
    '-v': 'version',
    '--silent': 'silent',
    '-s': 'silent',
    '--watch': 'watch',
    '-w': 'watch',
  }

  // ฟังก์ชันตรวจสอบว่า args เป็น flag หรือไม่
  const hasFlag = (arg: string) => arg.startsWith('--') || arg.startsWith('-')

  // ฟังก์ชันแยกค่าออกจาก flag เช่น --prefix=value
  const parseValue = (
    args: string[],
    index: number,
    key: string
  ): string | true => {
    const eqIndex = args[index].indexOf('=')
    if (eqIndex !== -1) return args[index].slice(eqIndex + 1) // ค่าในรูปแบบ --key=value
    if (args[index + 1] && !hasFlag(args[index + 1])) return args[index + 1] // ค่าในรูปแบบ --key value
    return true // สำหรับ flag ที่ไม่มี value เช่น --silent
  }

  const parseArg = argv.slice(2) // ลบ node และ script path
  for (let i = 0; i < parseArg.length; i++) {
    const arg = parseArg[i]
    if (!hasFlag(arg)) continue

    const key = optionMap[arg] // ตรวจสอบว่า arg มี mapping หรือไม่
    if (!key) {
      opts.help = true // หากไม่มี mapping ให้แสดง help
      break
    }

    // ดึงค่าออกมาจาก flag
    const value = parseValue(parseArg, i, key)
    if (
      value === true ||
      key === 'help' ||
      key === 'silent' ||
      key === 'watch'
    ) {
      opts[key] = true // flag ที่ไม่มี value
    } else {
      opts[key] = value // flag ที่มี value
      i++ // ข้าม index ของ value
    }

    // ถ้าพบ help ให้เรียกฟังก์ชัน help ทันที
    if (key === 'help') {
      return help(argv.slice(2).shift())
    }
  }

  console.log(opts)
}
const helpWidth =
  process.stdout.columns < 60 ? 80 : process.stdout.columns || 80
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
    if (word === '\n') return ''
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
  formatHelpMessage('-s, --silent', 'Silent mode.', helpWidth, helpIndent),
  formatHelpMessage('-w, --watch', 'Watch mode.', helpWidth, helpIndent),
  formatHelpMessage(
    '-n, --project-name',
    'Project name.',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage(
    '-t, --target',
    'Target for the project',
    helpWidth,
    helpIndent
  ),
  formatHelpMessage('-m, --module', 'Module name.', helpWidth, helpIndent),
].join('\n')

function help(cmd?: string) {
  console.log('cmd', cmd)
  const helpAll = `Usage: nyrenx ${cmd ? cmd + ' ' : ''}[command | script | fileName] [options]
  
Commands:
${formattedHelp}

Options:
${formattedOptions}
    
    `
  if (cmd) {
    if (cmd === 'i' || cmd === 'add' || cmd === 'install')
      console.log(examples.install)
    if (cmd === 'init' || cmd === 'fast' || cmd === 'quick')
      console.log(
        `Usage: nyrenx ${cmd} [quick | fast] [options] -- [arguments]`,
        examples.init
      )
    if (cmd === 'update') console.log(examples.update)
  } else {
    console.log(helpAll)
  }
}

async function run(
  listener: any,
  options: Object = {},
  args: Array<string> = []
) {
  await listener
}



async function parse(_argv = process.argv) {
  const { rawArgs, scriptPath, userArgs } = prepareUserArgs()
  const argv = _argv.slice(2)
  const command = argv.shift()
  const base = `commands:${command}`
  console.log(argv, command)
  const fn = parseCommand(command)
  //await run(fn)
}

;(async () => await parse())()
console.log(new Option('-t, --target [tarGet]', 'Target for the project'))
