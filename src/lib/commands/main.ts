#!/usr/bin/env node
import { EventEmitter } from 'node:events'
import process from 'node:process'
class Command extends EventEmitter{
  _name: string
  commands: Command[]
  _aliases: string[]
  constructor(name?: string){
    super()
    this.commands= []
    this._name = name || ''
    this._aliases = []
    this._regiterCommand(this)
  }
  _regiterCommand(command: Command){
    const newCommand = this.eventNames().map(name => {
      this.commands.push(new Command(newCommand))
        })
    console.log(newCommand);
    //this.commands.push(new Command(newCommand))
  }
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