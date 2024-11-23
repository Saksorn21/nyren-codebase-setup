import clearAnsiCodes from '../utils/clearAnsi.js'
import errorTypes from './errorType.js'
import utils from '../utils/main.js'
import { readPackageJson } from '../../lib/packageJsonUtils.js'
export type ErrorAndPath = {
  block: { line: string; index: number }[]
}
type ErrorBlock = ErrorAndPath & {
  lineId: number
  keyword: string
  message: string
  paths: { line: string; index: number }[]
}
class BlockError {
  private readonly regExpErrorType = /(?:^|\s)(error|[a-zA-Z]+)(?=:)/
  private lineId: number
  private keyword: string
  private message: string
  private paths:Array<{ line: string; index: number }>
  constructor(e: ErrorBlock){
    const errorTypeMatch = e.line.match(this.regExpErrorType)
    this.lineId = parseInt(e.lineId)
     this.paths = e.paths.forEach(({line, index}): string => line.replace(/\n/g, ''))
    this.keyword = e.keyword
    this.message = e.message
  }
}
export default class ErrorLogManager {
  private errorPathBlocks: ErrorAndPath[]
  private readonly regExpErrorType = /(?:^|\s)(error|[a-zA-Z]+)(?=:)/
  private isCollectingError = false

  private activeErrorBlock: ErrorAndPath['block']
  private readonly arrRawData: Array<string> = []
  private newData: Array<string>
  public readonly MAKEERRORTYPE = 'markErrorType'
  public readonly MAKEPATH = 'markPath'
  public readonly errorTypes = errorTypes
  constructor() {
    this.errorPathBlocks = []
    this.activeErrorBlock = []
    this.newData = []
  }

  /**
   * Processes the raw data string by splitting it into lines, clearing ANSI codes, and passing them to the parser.
   * @param rawData The raw string data to be processed.
   */
  process(rawData: string) {
    this.arrRawData.push(...rawData.split('\n'))

    const lines = clearAnsiCodes(rawData).split('\n') // Remove ANSI codes and split into lines
    this.newData = lines
    //this.newData =
    this.newData.map((line, index) => {
      this.parse(line, index) // Process each line

      return line // Return the original line
    })
    this.removeRunTimes() // Remove run times from the newData array
    this.saveBlock() // Save the last block if any
    return this
  }

  /**
   * Parses each line to identify error types and paths, and organizes them into error blocks.
   * @param line A single line of raw data.
   * @param index The index of the line in the raw data.
   */
  private parse(line: string, index: number) {
    const errorTypeMatch = line.match(this.regExpErrorType)
    const atPathMatch = line.trim().startsWith('at ')

    if (errorTypeMatch && this.errorTypes.includes(errorTypeMatch[0])) {
      if (this.isCollectingError && this.activeErrorBlock.length > 0) {
        this.saveBlock() // Save the current block before starting a new one
      }
      this.isCollectingError = true // Start collecting a new block

      this.addError(line, index) // Add the error type line to the current block
    } else if (this.isCollectingError && atPathMatch) {
      this.addPath(line, index) // Add the `at path` line to the current block
    } else if (this.isCollectingError) {
      this.saveBlock() // Save the current block when encountering unrelated lines

      this.isCollectingError = false
    }
  }

  /**
   * Adds an error line to the current active error block.
   * @param line The line containing the error.
   * @param index The index of the error line in the raw data.
   */
  private addError(line: string, index: number) {
    this.activeErrorBlock.push({ line, index })
    this.markAsModified('errorType', index)
  }

  /**
   * Adds a path line to the current active error block.
   * @param line The line containing the path.
   * @param index The index of the path line in the raw data.
   */
  private addPath(line: string, index: number) {
    this.activeErrorBlock.push({ line, index })
    this.markAsModified('path', index)
  }

  /**
   * Saves the current error block to the list of error path blocks and resets the active block.
   */
  private saveBlock() {
    if (this.activeErrorBlock.length > 0) {
      this.errorPathBlocks.push({ block: [...this.activeErrorBlock] })
      this.activeErrorBlock = [] // Reset the active error block
    }
    this.isCollectingError = false // Stop collecting errors
  }

  /**
   * Marks a line as modified by adding a prefix based on whether it's an error or path.
   * @param type The type of marker ('errorType' or 'path').
   * @param index The index of the line being marked.
   */
  private markAsModified(type: 'errorType' | 'path', index: number) {
    const marker = type === 'errorType' ? this.MAKEERRORTYPE : this.MAKEPATH
    this.newData[index] = marker + ': ' + index
  }

  public processColorize() {
    const colorizeResult: {
      idx: number
      errorType: string
      message: string
      paths: Array<{ idx: number; path: string }>
      mark: { type: string; path: string }
    }[] = []
    let errType = '',
      path = '',
      msg = '',
      isType = false,
      isPath = false,
      resultPaths: Array<{ idx: number; path: string }> = []
    this.errorPathBlocks.forEach(blockObj => {
      blockObj.block.forEach(({ line, index }) => {
        const type = line.match(this.regExpErrorType)
        if (type && !isType) {
          errType = type[0]
          msg = line.replace(type[0], '')
          isType = true
        } else {
          isType = false
          isPath = true
          path = this.atPath(line)
          resultPaths.push({ idx: index, path })
        }

        if (this.errorTypes.includes(errType) && isType) {
          isType = false
          errType = utils.color.hex('f44747').visible(errType || '')
          msg = utils.color.hex('abb2bf').visible(msg || '')

          colorizeResult.push({
            idx: index,
            errorType: errType,
            message: msg,
            paths: resultPaths,
            mark: { type: this.MAKEERRORTYPE, path: this.MAKEPATH },
          })
        }
      })
      isType = false
      isPath = false
      resultPaths = []
    })

    return colorizeResult
  }
  atPath(path: string): string {
    const color = utils.color.chalk
    const regex =
      /at\s+(?:(?<method>[\w<>]+)\s+\()?((?<file>[^\s:]+):(?<line>\d+):(?<column>\d+))\)?/

    const match = regex.exec(path)

    if (match) {
      const at = color.hex('#d7d7ff').dim('at')
      const method = color.hex('#abb2bf').bold(match.groups?.method || '')
      const filePath = color.cyan(match.groups?.file || '')
      const line = color.yellow(parseInt(match.groups?.line || ''))
      const column = color.yellow.dim(parseInt(match.groups?.column || ''))

      return color
        .hex('#5c6370')
        .visible(
          `     ${at} ${method} ${method ? '(' + filePath + ')' : filePath}:${line}:${column}\n`
        )
    }
    return ''
  }

  /**
   * Removes run times from the newData array.
   */
  private removeRunTimes() {
    const version = readPackageJson().version
    this.newData.map((line, index) =>
      line.includes('Bun') ? (this.newData[index] = utils.color.chalk.hex('#d7d7ff').dim.visible(`Nyrenx: (${version})`)) : line
    )
  }

  /**
   * Debugging method to print out all error blocks with their corresponding lines and indices.
   */
  public debug() {
    this.errorPathBlocks.forEach((blockObj, blockIndex) => {
      console.log(
        utils.color.red(
          `Error Block ${utils.color.white(blockIndex + 1 + ':')}`
        )
      )
      blockObj.block.forEach(({ line, index }) => {
        console.log(
          utils.color.amber(
            `Index ${utils.color.white(index) + ':'} ${utils.color.white(line)}`
          )
        )
      })
    })
  }

  /**
   * Gets the processed error path blocks and modified data.
   * @returns An object containing the error path blocks and modified data.
   */
  public get results() {
    return {
      errorPathBlocks: this.errorPathBlocks,
      arrRawData: this.arrRawData,
      modifiedData: this.newData,
    }
  }
}
