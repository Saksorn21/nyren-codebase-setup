import process from 'node:process'
import onetime from 'onetime'
import { onExit } from 'signal-exit'
interface Cursor {
  [key: string]: () => void
}

const resetCursorOnExit = () => {
  const terminal = process.stderr.isTTY
    ? process.stderr
    : process.stdout.isTTY
      ? process.stdout
      : undefined
  terminal
    ? (onetime(() =>
        onExit(
          () => {
            terminal.write('\x1B[?25h') // Reset cursor visibility
          },
          { alwaysLast: true }
        )
      ))()
    : () => {}
}
const cursor: Cursor = {}
cursor.hide = (writableStream = process.stderr) => {
  if (!writableStream.isTTY) return
  resetCursorOnExit()

  writableStream.write('\u001B[?25l')
}
cursor.show = (writableStream = process.stderr) => {
  if (!writableStream.isTTY) return

  writableStream.write('\u001B[?25h')
}
export default cursor
