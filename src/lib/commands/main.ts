#!/usr/bin/env node
import { EventEmitter } from 'node:events'
import process from 'node:process'
class Option {
  flags: string
  required: boolean
  optional: boolean
  variadic: boolean
  description: string
  defaultValue: string | undefined
  defaultValueDescription: string | undefined
  short: string
  long: string
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
  let shortFlag: string, longFlag: string
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
class Command extends EventEmitter{
  _name: string
  commands: Command[] = []
  options: Option[] = []
  _aliases: string[]
  name!: string
  alias!: string | undefined
  description!: string
  constructor(name?: string){
    super()
  }
  option(str: string, description: string, alias?: string){
    this.name = str
    this.alias = alias || undefined
    this.description = description
    this.emit(str, new Options({name: str, alias: alias, description: description}))
    this.commands.push(new Options(this))
    return this
  }
  action(fn) {
    const listener = (args) => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this.registeredArguments.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this; // backwards compatible "options"
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);

      return fn.apply(this, actionArgs);
    };
    this._actionHandler = listener;
    return this;
  }
  opts() {
    if (this._storeOptionsAsProperties) {
      // Preserve original behaviour so backwards compatible when still using properties
      const result = {};
      const len = this.options.length;

      for (let i = 0; i < len; i++) {
        const key = this.options[i].attributeName();
        result[key] =
          key === this._versionOptionName ? this._version : this[key];
      }
      return result;
    }

    return this._optionValues;
  }
  
  
}
const cmd = Command.proprety
cmd.acorn = function (callback) {
   if(typeof callback === 'function') return callback()
  
}

const defaultArgv = process.argv.slice(2)
const program = new Command()
program.on('commands:init' , (command: Command) => {
  console.log(command)
})
const n = program.eventNames()
if(n.length > 0){
  const newEvent = program.eventNames()
  program.commands.push(...newEvent)
}
const globalOptions = ['--help', '-h', '--version', '-v']
function parse(program: Command,_argv = process.argv) {
   const argv = _argv.slice(2)
   const command = argv.shift()
  const base = `commands:${command}`
  console.log('Debug',_argv,argv,command)
  
  if(program.commands.find(c => c === base)){
    program.emit(`commands:${command}`,argv)
  }else if (command === undefined){
    console.error(`command ${command}`)
  }else{
    console.error(`Cant not find command ${command}`)
  }
  
}

console.log(parse(program))