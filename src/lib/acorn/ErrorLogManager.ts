
import clearAnsiCodes from '../utils/clearAnsi.js'
import errorTypes from './errorType.js'
import utils from '../utils/main.js'
interface ErrorAndPath {
  block: {
    line: string
    index: number
  }[]
}

export default class ErrorLogManager {
    private errorPathBlocks: ErrorAndPath[];
private readonly regExpErrorType = /(?:^|\s)(error|[a-zA-Z]+)(?=:)/
    private isCollectingError = false;
    private isCollectingPath = false;
    private activeErrorBlock: ErrorAndPath['block']
    private newData: Array<string> = []
    public readonly MAKEERRORTYPE = 'markErrorType: '
    public readonly MAKEPATH = 'markPath: '
    
    constructor(private rawData: Array<string>) {
        this.errorPathBlocks = [];
        this.activeErrorBlock = []
    }
    parse(line: string, index: number){
        const match = line.match(this.regExpErrorType)
        
        if(match && errorTypes.includes(match[0])){
            if (this.isCollectingError && this.activeErrorBlock.length > 0) {
                  this.addPath(line,index)// Save the previous data block
                  this.activeErrorBlock = [] // Reset the data block for the next set
              }
            this.isCollectingError = true
            this.addError(line, index)
        } else if (this.isCollectingError && line.includes('at ')) {
              // When encountering a line with 'at path' while collecting data
              this.activeErrorBlock.push({ line, index }) // Add this line to the data block with position
              this.addPath(line, index)
              this.activeErrorBlock = [] // Reset the data block for the next set
              this.isCollectingError = false // End data collection for this set
            } else if (this.isCollectingError) {
              // Continue adding lines to the data block as long as 'at path' is not found
              this.addError(line, index)
            }

            // Save the last data block that may not end with 'at path'
            if (this.activeErrorBlock.length > 0) {
              this.addPath(line, index)
                
            }
    }
    editsData(types: 'errorType' | 'path', idx: number){
        if(types === 'errorType') this.newData[idx] = this.MAKEERRORTYPE + idx
        else if(types === 'path') this.newData[idx] = this.MAKEPATH + idx
    }
    addError(line: string, index: number) {
        this.activeErrorBlock.push({ line, index })
        this.editsData('errorType', index)
    }
    addPath(line: string, index: number){
        this.errorPathBlocks.push({ block: [...this.activeErrorBlock] }) 
        this.editsData('path', index)
    }
    debugger(){
        this.errorPathBlocks.forEach((blockObj, blockIndex) => {
          console.log(utils.color.red(`Error Block ${utils.color.white(blockIndex + 1 + ':')}`))
          blockObj.block.forEach(({ line, index }) => {
              console.log(utils.color.amber(`Index ${utils.color.white(index) + ':'} ${utils.color.white(line)}`))
          })
        })
    }
    get get(){
        return { errorPathBlocks: this.errorPathBlocks, newData: this.rawData
    }
    }
    

    getErrorBlocks() {
        return this.errorBlocks;
    }

    // ฟังก์ชันเพิ่มเติมสำหรับการจัดการข้อความและตำแหน่ง
}
