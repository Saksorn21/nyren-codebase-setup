import process from 'node:process'
import { onExit } from 'signal-exit'
interface Cursor {
  [key: string]: () => void
}
let isHidden = false
const terminal = process.stderr.isTTY
  ? process.stderr
  : process.stdout.isTTY
    ? process.stdout
    : undefined

const cursor: Cursor = {}
cursor.hide = (writableStream = terminal) => {
  writableStream
    ? () => {
        !writableStream.isTTY && null
        isHidden = false
        writableStream.write('\u001B[?25l')
      }
    : () => {}
}
cursor.show = (writableStream = terminal) => {
  writableStream
    ? onExit(
        () => {
          !writableStream.isTTY && null
          isHidden = true
          writableStream.write('\u001B[?25h')
        },
        { alwaysLast: true }
      )
    : () => {}
}
export default cursor
