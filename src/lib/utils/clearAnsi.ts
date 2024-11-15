import ansiRegex from 'ansi-regex'
export default function clearAnsiColors(str: string): string {
   if (typeof str !== 'string') throw new TypeError(`Expected a 'string', got '${typeof str}'`)
   
  return str.replace(ansiRegex(), '')
}

