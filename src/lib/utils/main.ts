import log from './log.js'
import taxi from './taxi.js'
import color from './color.js'
import symbol from './symbols.js'
import clone from './clone.js'
import {
  dirname,
  join,
  basename,
  resolve,
  relative,
  extname,
  sep,
} from 'node:path'
import { readFile, writeFile, readFileSync, readdir, mkdir } from 'node:fs'
import { access } from 'node:fs/promises'

interface UtilsModules {
  log: typeof log
  taxi: typeof taxi
  color: typeof color
  clone: typeof clone
  prefixCli: string
  isWindows: boolean
  path: PathModules
  fs: FsModules
  icon: ModulesIcon
}
interface PathModules {
  dirname: typeof dirname
  join: typeof join
  basename: typeof basename
  resolve: typeof resolve
  relative: typeof relative
  extname: typeof extname
  sep: typeof sep
}

interface FsModules {
  readFile: typeof readFile
  writeFile: typeof writeFile
  readFileSync: typeof readFileSync
  readdir: typeof readdir
  access: typeof access
  mkdir: typeof mkdir
}
interface ModulesIcon {
  info: string
  waring: string
  success: string
  error: string
  fast: string
  idea: string
  tool: string
}
const ModulesPath: PathModules = {
  dirname,
  join,
  basename,
  resolve,
  relative,
  extname,
  sep,
}
const ModulesFs: FsModules = {
  readFile,
  writeFile,
  readFileSync,
  readdir,
  access,
  mkdir,
}
const modulesIcon: ModulesIcon = {
  info: symbol.info,
  waring: symbol.warning,
  success: symbol.success,
  error: symbol.error,
  fast: symbol.fast,
  idea: symbol.idea,
  tool: symbol.toolIcon,
}
const utils: UtilsModules = {
  log,
  taxi,
  color,
  clone,
  path: ModulesPath,
  fs: ModulesFs,
  icon: modulesIcon,
  prefixCli: `${color.white('[')}${color.nyren('nyrenx')}${color.white(']')}`,
  isWindows: process.platform === 'win32',
  
}

export default utils
