import clearAnsi from '../utils/clearAnsi.js'
type TokenError = {
  idx: number
  errorType: string
  message: string
  paths: Array<{ idx: number; path: string }>
  mark: { type: string; path: string }
}
export default class Fusion {
  result: Array<string> = []
  constructor() {}
  process(code: string, codeError: TokenError[]) {
    const lines = code.split('\n')
    for (const err of codeError) {
      lines.map((line, index) => {
        const parse = clearAnsi(line).split(':')
        const lineId = parseInt(parse[1])
        if (line.includes(err.mark.type)) {
          if (lineId === err.idx) {
            lines[index] = err.errorType + err.message
          }
        } else if (line.includes(err.mark.path))
          err.paths.map(({ idx, path }) => {
            if (lineId === idx) lines[index] = path.replace(/\n/g, '')
          })
      })
    }
    this.result.push(...lines)
    return this
  }
}
