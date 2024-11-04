import process from 'node:process'
import color from './color.js'
const modefyStdout = (stdout: typeof process.stdout) => stdout.on('data', data => {
  let str = data.toString().split('\n')
const variable = ['const' , 'let' , 'var','if', 'else', 'for', 'while', 'do', 'try', 'catch','finally', 'switch', 'case','import', 'export', 'default', 'from', 'modules', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', ]
  const boolean = ['true', 'false']
  const number = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  const operator = ['+', '-', '*', '/', '%', '++', '--', '!', '&&', '||', '==', '!=', '===', '!==', '>', '>=', '<', '<=', '|', '&', '^', '?', ':', '=>', '=>', '::', ]
  str.forEach((item: string, index: number) => {
    if (item.includes('^')) {
      str[index] = color.red(item)
    } else if (item.includes('error')) {
      const override = str[index].split('error:')
      str[index] =
        color.red('error:') + color.grey(override.slice(1))
    } else if (item.includes('Bun')) {
      str.splice(index, str.length)
    }
  })

  console.log(str.join('\n'))
})