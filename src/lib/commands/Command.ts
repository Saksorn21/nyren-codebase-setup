import Option, { splitOptionFlags, camelcase } from './Option.js'
import { Option as Opts, Argument } from 'commander'
type CommandFunction = (args: string[], opts: Record<string, any>) => Promise<any> | void;
export interface ParseOptions {
  from: 'node' | 'electron' | 'user' | 'eval'
}
export default class Command {
  private commands: Map<string, CommandFunction> = new Map();
  parent: Command | undefined;
  private _name: string
  private aliases: Map<string, string> = new Map();
  private _description!: string 
  private _argsDescription: Record<string, string> | undefined
  private _version: string | undefined
  private _versionOptionName: string | undefined
  private options: Option[] = [];
  private optionsValue: Record<string, any> | undefined
  private actionHander: CommandFunction | undefined;
  public args: string[] = []; // เก็บ args ที่ parse แล้ว
  private rawArgs: string[] = [];
  private optionsData: Record<string, any> = {}; // เก็บ options ที่ parse แล้ว
  constructor(name?: string) {
    this.optionsValue = undefined
   this.parent = this.actionHander = undefined
    this._versionOptionName = undefined
    this._name = name || ''
    
    this._description = ''
  }

  // ลงทะเบียนคำสั่ง
  registerCommand(name: string, fn?: CommandFunction): void {
    const defaultFn = this.commands.get(name)
    if (this.commands.has(name) && defaultFn) {
      throw new Error(`Command "${name}" is already registered.`);
    }
    this.commands.set(name, fn);
    console.log(this.commands)
  }
  
  command(name: string, description?: string): Command {
    const subCommand = this.createCommand(name)
    if(description) subCommand.description(description);
    this.registerCommand(name);
      subCommand.parent = this
    subCommand.registerParent(this)
  //  subCommand.parent = this
    
    return subCommand;
  }
  createCommand(name?: string): Command{
    return new Command(name)
  }
  action(fn: (...args: any[]) => void | Promise<void>): this {
  const isArrowFunction = !fn.prototype; // ตรวจสอบว่าเป็นฟังก์ชันลูกศรหรือไม่

  const listener = (...args: any[]) => {
    const expectedArgsCount = this.options.length;
    const actionArgs = args.slice(0, expectedArgsCount);
    actionArgs.push(this.opts());

    // ถ้าเป็นฟังก์ชันลูกศร จะเรียกใช้โดยไม่ผูก `this`
    if (isArrowFunction) {
      return fn(...actionArgs);
    }

    // ถ้าไม่ใช่ฟังก์ชันลูกศร ให้ `this` เป็น Command instance
    return fn.apply(this, actionArgs);
  };
this.parent?.registerCommand(this._name, listener);
  this.actionHander = listener;
  return this;
    }
  // ลงทะเบียน options (ใช้คลาส Option)
  option(flags: string, description: string, defautValue?: any){
   const opt =  this.registerOption(flags, description) 
    opt.default(defautValue)
    return this
  }
  private registerOption(flags: string, description: string): Option {
    const option = new Option(flags, description);
    //this.parent = this
    this.parent?.options.push(option);
    return option;
  }
  version(): string | undefined
  version(str: string, flags?: string, description?: string): this
  version(str?: string, flags?: string, description?: string) {
    if (str === undefined) return this._version
    this._version = str
    flags = flags || '-V, --version'
    description = description || 'output the version number'
    const versionOption = this.registerOption(flags, description)
    this._versionOptionName = versionOption.attributeName()
    
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
  
 private _findOption(arg:string): Option {
   
    return this.options.find((option) => option.is(arg));
  }
  // Parse options
  private parseOptions(argv: string[]): Record<string, any> {
    
    const parsedOptions: Record<string, any> = {};
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      
      
      if (this._findOption(arg)) {
        if (this._findOption(arg).isBoolean()) {
          parsedOptions[this._findOption(arg).attributeName()] = !this._findOption(arg).negate; // Boolean
          console.log(parsedOptions)
        } else if (this._findOption(arg).optional || this._findOption(arg).required) {
          const value = argv[i + 1];
          parsedOptions[this._findOption(arg).attributeName()] = value;
          i++; // ข้ามค่าที่ตามมา
        }
      }
    }

    // เติมค่า Default
    for (const option of this.options) {
      if (
        !(option.attributeName() in parsedOptions) &&
        option.defaultValue !== undefined
      ) {
        parsedOptions[option.attributeName()] = option.defaultValue;
      }
    }
    this.optionsValue = parsedOptions;
    
    return parsedOptions;
  }
  
  private parseArgumentsAndOptions(argv: string[]): { args: string[], options: Record<string, any> } {
    const argsIndex = argv.indexOf("--");
    const args = argsIndex !== -1 ? argv.slice(argsIndex + 1) : [];
    const options = this.parseOptions(argsIndex !== -1 ? argv.slice(0, argsIndex) : argv);
    return { args, options };
  }
  
  alias(aliasName: string): this {
      if (aliasName === this._name) {
          throw new Error("Command alias can't be the same as its name");
      }

      if (!this._name) {
          throw new Error("Cannot set an alias without a command name.");
      }

      if (this.aliases.has(aliasName)) {
          throw new Error(`Alias "${aliasName}" is already registered.`);
      }

      this.aliases.set(aliasName, this._name);
console.log('alias', this.aliases)
      // ถ้ามี parent ให้เพิ่ม alias ใน parent ด้วย
      if (this.parent) {
          this.parent.aliases.set(aliasName, this._name);
      }

      return this;
  }
  private prepareUserArgs (argv?: readonly string[], parseOptions?: ParseOptions ){
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error('first parameter to parse must be array or undefined');
    }
    
        parseOptions = parseOptions || {} as ParseOptions

    // auto-detect argument conventions if nothing supplied
    if (argv === undefined && parseOptions.from === undefined) if (process.versions?.electron) {
            parseOptions.from = 'electron';
      }
    if (argv === undefined) argv = process.argv; 
    this.rawArgs = argv.slice()
    let userArgs
    switch (parseOptions.from) {
       case undefined : case 'node' :
    this._scriptPath = argv[1];
        userArgs = argv.slice(2);
        break;
      case 'electron':
        // @ts-ignore: because defaultApp is an unknown property
        if (process.defaultApp) {
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
        } else {
          userArgs = argv.slice(1);
        }
        break;
      case 'user':
        userArgs = argv.slice(0);
        break;
      case 'eval':
        userArgs = argv.slice(1);
        break;
      default:
        throw new Error(
          `unexpected parse option { from: '${parseOptions.from}' }`,
        );
    }
    
}
  private resolveCommand(cmd: string): string {
    let command = this
    
    console.log('resolveCmd',this.aliases)
    return this.aliases.get(cmd) || cmd; // คืนค่าชื่อคำสั่งหลัก หาก cmd เป็น alias
  }
  async executeCommand(cmd: string, argv: string[]): Promise<void> {
    
    const resolvedCmd = this.resolveCommand(cmd);
console.log('cmd',this.commands)
    if (!this.commands.has(resolvedCmd)) {
      console.error(`Unknown command: "${cmd}"`);
      return;
    }

    const fn = this.commands.get(resolvedCmd);
    if (fn) {
      try {
        const { args, options } = this.parseArgumentsAndOptions(argv);
console.log('raw',args,options)
        await this._chainOrCall(undefined, () => {
          const isArrowFunction = fn.prototype === undefined;

          if (isArrowFunction) {
            // ฟังก์ชันลูกศร: เรียกโดยไม่ผูก this
            return fn.apply(null,[...args, options]);
          } else {
            // ฟังก์ชันธรรมดา: ผูก this กับ Command instance
            return fn.apply(this, [...args, options]);
          }
        });
      } catch (err) {
        console.error("Command execution failed:", err);
      }
    }
  }
  opts(): Record<string, any> {
    const options = this.options.map((opt) => opt.attributeName());
    return options.reduce((acc, curr) => {
      acc[curr] = undefined; // ค่า default เป็น undefined
      return acc;
    }, {} as Record<string, any>);
    
  }
  name(): string
  name(str: string): string
  name(str?: string): this | string {
    if (str === undefined) return this._name;
    this._name = str;
    return this;
  }
  private async _chainOrCall(promise: Promise<any> | undefined, fn: Function): Promise<any> {
    if (promise) {
      await promise; // รอ promise สำเร็จก่อน
    }
    return fn(); // เรียก callback
  }
  registerParent(parent: Command): void {
      // รวม aliases และคำสั่งทั้งหมดกลับไปยัง parent
      for (const [aliasName, commandName] of this.aliases) {
          parent.aliases.set(aliasName, commandName);
      }
      for (const [commandName, commandFn] of this.commands) {
          parent.commands.set(commandName, commandFn);
      }
  }
  // Show Help
  help(): void {
    console.log(`Usage: ${this._name} [options] [arguments]`);
    if (this._description) {
      console.log(`\n${this._description}`);
    }

    if (this.options.length > 0) {
      console.log("\nOptions:");
      for (const option of this.options) {
        console.log(
          `  ${option.flags}: ${option.description}${
            option.defaultValue ? ` (default: ${option.defaultValue})` : ""
          }`
        );
      }
    }

    if (this.commands.size > 0) {
      console.log("\nCommands:");
      for (const [cmd, _] of this.commands) {
        console.log(`  ${cmd}`);
      }
    }
  }
  
}