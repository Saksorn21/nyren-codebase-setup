import ansiRegex from 'ansi-regex'
 const clearAnsiCodes = (str: string): string =>
  typeof str === 'string'
    ? (() => str.replace(ansiRegex(), ''))()
    : (() => {
        throw new TypeError(`Expected a 'string', got '${typeof str}'`)
      })()
export default clearAnsiCodes