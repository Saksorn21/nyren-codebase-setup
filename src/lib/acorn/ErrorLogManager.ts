import clearAnsiCodes from '../utils/clearAnsi.js'
import errorTypes from './errorType.js'
import utils from '../utils/main.js'

type ErrorAndPath = {
    block: { line: string; index: number }[]
}

export default class ErrorLogManager {
    private errorPathBlocks: ErrorAndPath[]
    private readonly regExpErrorType = /(?:^|\s)(error|[a-zA-Z]+)(?=:)/
    private isCollectingError = false

    private activeErrorBlock: ErrorAndPath['block']
    private readonly arrRawData: Array<string> = []
    private newData: Array<string>
    public readonly MAKEERRORTYPE = 'markErrorType: '
    public readonly MAKEPATH = 'markPath: '

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

        if (errorTypeMatch && errorTypes.includes(errorTypeMatch[0])) {
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
        this.newData[index] = marker + index
    }
    /**
     * Removes run times from the newData array.
     */
  private removeRunTimes() {
        this.newData.map((line, index) =>
            line.includes('Bun') ? (this.newData[index] = '') : line
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
