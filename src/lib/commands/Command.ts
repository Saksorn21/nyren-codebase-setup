import Option, { splitOptionFlags, camelcase } from './Option.js'
type CommandFunction = (args: string[], opts: Record<string, any>) => Promise<any> | void;

export default class CommandHandler {
  private commands: Map<string, CommandFunction> = new Map();
  private options: Option[] = [];

  constructor() {}

  // ลงทะเบียนคำสั่ง
  registerCommand(name: string, fn: CommandFunction): void {
    if (this.commands.has(name)) {
      throw new Error(`Command "${name}" is already registered.`);
    }
    this.commands.set(name, fn);
  }

  // ลงทะเบียน options (ใช้คลาส Option)
  option(flags: string, description: string, defautValue?: any){
   const opt =  this.registerOption(flags, description)
    opt.default(defautValue)
    return this
  }
  private registerOption(flags: string, description: string): Option {
    const option = new Option(flags, description);
    this.options.push(option);
    return option;
  }

  // Parse options
  private parseOptions(argv: string[]): Record<string, any> {
    const parsedOptions: Record<string, any> = {};
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      const option = this.options.find((opt) => opt.is(arg));

      if (option) {
        if (option.isBoolean()) {
          parsedOptions[option.attributeName()] = !option.negate; // Boolean
        } else if (option.optional || option.required) {
          const value = argv[i + 1];
          parsedOptions[option.attributeName()] = value;
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

    return parsedOptions;
  }

  // Execute Command
  async executeCommand(cmd: string, argv: string[]): Promise<void> {
    if (!this.commands.has(cmd)) {
      console.error(`Unknown command: "${cmd}"`);
      return;
    }

    const parsedOptions = this.parseOptions(argv);
    const fn = this.commands.get(cmd);

    if (fn) {
      await fn(argv, parsedOptions);
    }
  }

  // Show Help
  help(): void {
    console.log("Available Commands:");
    for (const [cmd] of this.commands) {
      console.log(`  - ${cmd}`);
    }
    console.log("\nAvailable Options:");
    for (const option of this.options) {
      console.log(
        `  ${option.flags}: ${option.description}${
          option.defaultValue ? ` (default: ${option.defaultValue})` : ""
        }`
      );
    }
  }
}