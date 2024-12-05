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
  constructor(flags: string, description:string){
    this.flags = flags;
      this.description = description || '';

      this.required = flags.includes('<'); // A value must be supplied when the option is specified.
      this.optional = flags.includes('[');
    this.variadic = /\w\.\.\.[>\]]$/.test(flags)
    const optionFlags = splitOptionFlags(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.defaultValue = this.defaultValueDescription = undefined;
  }
  default(value: any, description: string) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }
  name() {
    if (this.long) {
      return this.long.replace(/^--/, '');
    }
    return this.short.replace(/^-/, '');
  }
  is(arg: string) {
    return this.short === arg || this.long === arg;
  }
  isBoolean() {
    return !this.required && !this.optional
  }
  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''));
  }
}
function camelcase(str: string) {
  return str.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

function splitOptionFlags(flags: string) {
  let shortFlag, longFlag
  // Use original very loose parsing to maintain backwards compatibility for now,
  // which allowed for example unintended `-sw, --short-word` [sic].
  const flagParts = flags.split(/[ |,]+/);
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
    shortFlag = flagParts.shift();
  longFlag = flagParts.shift();
  // Add support for lone short flag without significantly changing parsing!
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}
function hasFlag(flag: string, argv: readonly string[] = process.argv): boolean {
  const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf('--');
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
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
    this.description = description || '';
    this.variadic = false;
    this.parseArg = undefined;
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.argChoices = undefined;

    switch (name[0]) {
      case '<': // e.g. <required>
        this.required = true;
        this._name = name.slice(1, -1);
        break;
      case '[': // e.g. [optional]
        this.required = false;
        this._name = name.slice(1, -1);
        break;
      default:
        this.required = true;
        this._name = name;
        break;
    }

    if (this._name.length > 3 && this._name.slice(-3) === '...') {
      this.variadic = true;
      this._name = this._name.slice(0, -3);
    }
  }

  /**
   * Return argument name.
   *
   * @return {string}
   */

  name() {
    return this._name;
  }

  /**
   * @package
   */

  _concatValue(value: any, previous: any) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Argument}
   */

  default(value: any, description: string): Argument {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */

  argParser(fn: Function) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Only allow argument value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */

  choices(values: string[]) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(
          `Allowed choices are ${this.argChoices.join(', ')}.`,
        );
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Make argument required.
   *
   * @returns {Argument}
   */
  argRequired() {
    this.required = true;
    return this;
  }

  /**
   * Make argument optional.
   *
   * @returns {Argument}
   */
  argOptional() {
    this.required = false;
    return this;
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
  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '');

  return arg.required ? '<' + nameOutput + '>' : '[' + nameOutput + ']';
}


const parseArg = process.argv.slice(2);
const globalOptions = ['--help', '-h', '--version', '-v']
function parseCommand(cmd: string) {
  const log = console.log
  const opts: any = {}
   switch (cmd) {
      case 'init': 
       const supCommand = parseArg.slice(1).shift()
       console.log('sup', supCommand)
       if (supCommand === 'fast' || supCommand === 'quick') {
         log('init')
         return parseOptions(opts)
       }
       parseOptions(opts)
       log('init ' + parseArg.slice(1), opts)
       if(hasFlag(parseArg.slice(1,2).join(' '))){
         log('init ' + parseArg.slice(1), parseArg.slice(2).join(' '))
         break
       }
       log('false ' + parseArg.slice(1,2))
         break;
      case 'install': case 'i': case 'add':
       log('install' + parseArg)
       break
     case 'update':
       log('update' + parseArg)
       break
     case 'help': case 'h':
       help()
       break
      default:
       log('default' + parseArg)
         break;
   }
  
   
}
function parseOptions(opts,argv = process.argv) {
  
   for (let i = 1; i < parseArg.length; i++){
      const args = parseArg[i]
      console.log(args)
      if (hasFlag(args)){
        if (args === '--project-name' || args === '-n') opts.projectName = parseArg[i+1]
        else if (args === '--target' || args === '-t') opts.target = parseArg[i+1]
        else if (args === '--module' || args === '-m') opts.module = parseArg[i+1]
        else if (args === '--directory' || args === '-d') opts.directory = parseArg[i+1]
        else if (args === '--help' || args === '-h') opts.help = true
        else if (args === '--version' || args === '-v') opts.version = true
        else if (args === '--prefix' || args === '-p') opts.prefix = parseArg[i+1]
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
function help(cmd?: string) {
  const helpAll = `usage: ${cmd ? cmd + ' ' : ''}nyrenx [command | script | fileName] [options]
  Commands:
    init [options]        Create a new project with a template.
    install [options]         Installation libraries for the project on npm. 
    update                  Update the project to the latest version.
    help [command]         Display help for [command]

  Options:
    -h, --help              Display help for [command]
    -v, --version           Display version information
    -p, --prefix            Prefix for the project name.
    -n, --project-name      Project name.
    -t, --target            Target for the project.
    -m, --module            Module name.
    -d, --directory         Directory name.
    -s, --silent            Silent mode.
    -w, --watch             Watch mode.
    `
   if (cmd) {
     console.log(cmd)
   }else{
     console.log(helpAll)
   }
}


function parse(_argv = process.argv) {
   const argv = _argv.slice(2)
   const command = argv.shift()
  const base = `commands:${command}`
  console.log(argv, command)
  parseCommand(command)
}

console.log(parse())