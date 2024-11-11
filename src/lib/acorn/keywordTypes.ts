import { keywordTypes as kwTypes, AddKeywordTypes } from './main.js'
/** 
•	beforeExpr: ตัวแปรนี้บอกว่า token นี้สามารถอยู่ก่อน expression หรือไม่ สำหรับ regexp จะเป็น false เพราะไม่สามารถอยู่ก่อน expression ได้
•	startsExpr: บอกว่า token นี้เป็นการเริ่มต้นของ expression หรือไม่ ในกรณีนี้ true หมายความว่า regexp สามารถเริ่มต้น expression ได้
•	isLoop: แสดงว่า token นี้เกี่ยวข้องกับลูป (loop) หรือไม่ สำหรับ regexp จะเป็น false
•	isAssign: ระบุว่า token นี้เกี่ยวข้องกับการมอบค่า (assignment) หรือไม่ สำหรับ regexp จะเป็น false
•	prefix: หมายถึงว่า token นี้สามารถอยู่หน้าตัวแปรหรือไม่ สำหรับ regexp จะเป็น false
•	postfix: หมายถึงว่า token นี้สามารถอยู่หลังตัวแปรหรือไม่ สำหรับ regexp จะเป็น false
•	binop: แสดงถึงการดำเนินการทางคณิตศาสตร์หรือไม่ สำหรับ regexp จะเป็น null เพราะ regexp ไม่ได้ใช้ในการคำนวณ
*/
const startsExpr: boolean = true
const beforeExpr: boolean = true
const isLoop: boolean = true
const isAssign: boolean = true
const prefix: boolean = true
const postfix: boolean = true
const keywordTypes = new AddKeywordTypes(kwTypes)
keywordTypes
  .on('let', { startsExpr })
  .on('from')
  .on('of', { isLoop })
  .del('true')
  .del('false')

keywordTypes.on(
  'as',
  'implements',
  'require',
  'infer',
  'keyof',
  'is',
  'typeof',
  'instanceof',
  'extends',
  {
    keyword: 'TsKeyword',
    startsExpr, // 'as' และคำที่คล้ายกันสามารถเริ่มต้น expression ได้
  }
)

keywordTypes.on(
  'assert',
  'asserts',
  'global',
  'keyof',
  'readonly',
  'private',
  'protected',
  'public',
  'abstract',
  'namespace',
  'declare',
  'enum',
  'interface',
  'type',
  'unique',
  'static',
  {
    keyword: 'TsKeyword',
  }
)

// ตัวอย่างคีย์เวิร์ดที่ใช้ b

export default keywordTypes
