import kw from './schema-keywordType.js'
class Token {
  label: string
  keyword: string
  
  value: any
  constructor(p) {
    this.label = p.label
    this.keyword = p.keyword
    this.value = p.value
    // this.start = p.start
    // this.end = p.end
    // this.loc = p.loc
  }
}
export default class Parser {
  constructor(private readonly code: string){
    
  }
  parse(){
const arr = this.code.split(' ')
    for (let inCode of arr) {
       if(kw.keywordAnyTypes.includes(inCode)){
         this.label = inCode
         this.keyword = inCode
         this.value = inCode
         
       }else{
         if (typeof inCode === 'number'){
           this.label = 'num'
           this.keyword = null
           this.value = inCode
         }
         this.label = 'name'
          this.keyword = inCode
          this.value = inCode
          
       }
    }
    
  }
  getToken(){
    this.next()
    return new Token(this)
  }
  next(){
    
  }
}
const pp = Parser.prototype
if (typeof Symbol !== "undefined")
  (pp as any)[Symbol.iterator] = function() {
    return {
      next: () => {
        let token = this.getToken()
        return {
          done: token.type === tt.eof,
          value: token
        }
      }
    }
  }