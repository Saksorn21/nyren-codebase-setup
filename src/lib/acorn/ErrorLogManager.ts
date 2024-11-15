
import { clearAnsiCodes } from '../utils.js'
import errorTypes from './errorType.js'
import utils from '../utils/main.js'
interface ErrorAndPath {
  block: {
    line: string
    index: number
  }[]
}

class ErrorLogManager {
    private errorBlocks: ErrorAndPath[];

    constructor() {
        this.errorBlocks = [];
    }

    addError(line: string, index: number) {
        // เพิ่มบรรทัดข้อผิดพลาดพร้อมตำแหน่งไปยัง errorBlocks
    }

    getErrorBlocks() {
        return this.errorBlocks;
    }

    // ฟังก์ชันเพิ่มเติมสำหรับการจัดการข้อความและตำแหน่ง
}
export default ErrorLogManager