import { Token,tokContexts, tokTypes  } from 'acorn'
import type { Position } from 'acorn'
import ColorizeSyntax, { type KeywordType} from '../ColorizeSyntax.js'
import kwTypes  from '../keywordTypes.js'
import utils from '../../utils/main.js'
import TokenTracker from '../TokenTracker.js'
export function onDebug(namespace: string = 'nyren:*') {
  console.log('onDebug is called')
  if (!process.env.DEBUG) {
    process.env.DEBUG = namespace;
  }
}
onDebug()
import createDebug from 'debug'
/**
 *@ interface SyntaxHighlight 
 *@ dscription - Acorn's Token class doesn't have a property value, so we need to create one.
 * of acorn Token {
type: TokenType
start: number
end: number
loc?: SourceLocation
range?: [number, number]
}
 */
interface CustomRegExp {
  pattern: string
  flags: string
  value: RegExp
}
interface CustomToken extends Token {
  value: string | CustomRegExp 
}
type ContractType = 'data' | 'error'
export const debug = createDebug(process.env.DEBUG || 'nyren:acorn-labels')
//const taxi = utils.taxi
class Labels {
  static formatEscapes(str: String) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\x08/g, '\\b')
      .replace(/\f/g, '\\f')
  }
  //acorn changes \r to \n , requires replaceCR and revertCR functions.
  static revertCR(tokenValue: string) {
    return typeof tokenValue === 'string'
      ? tokenValue.replace(/\[CR\]/g, '\r')
      : tokenValue
  }
  static replaceCR(code: string) {
    return code.replace(/\r/g, '[CR]')
  }

  public readonly controlCharRe: RegExp = /[\x0A\x0D\x09\x0C\x08]/ // \x0A = \n, \x0D = \r, \x09 = \t, \x0C = \f, \x08 = backspac
  private kwTypes: typeof kwTypes = kwTypes
  prevToken: CustomToken | null
  nextToken: CustomToken | null
  result!: CustomToken[] 
  private listeners: { [key in ContractType]?: ((data: CustomToken[]) => void)[] } = {};
  
  private transformer: CompositeTransformer;
 readonly debug: typeof debug = debug
  constructor(private readonly rawToken: CustomToken[]) {
    this.result = []
    this.prevToken = null
    this.nextToken = null
    this.transformer = new CompositeTransformer()
    
  }
  build() {
    let currentLine = 1
    let currentColumn = 0
    let keysword = [...this.kwTypes.getKeys()]
    const keywordType = this.kwTypes.emit()
    let isCustomtolen = false
    
       debug(utils.color.white('<<<===Parses Token===>>>')) 
    this.rawToken.forEach((token: CustomToken, index: number) => {
      let cloneToken = utils.clone(token)
      

      debug(utils.color.red('rawToken: ') + '%o', {
        label: token.type.label, 
                             keyword: token.type.keyword || null, value: token.value || null})
      this.nextToken = this.rawToken[index + 1] || null
           
        cloneToken = this.transformer.pasesToken(cloneToken, this.prevToken, this.nextToken);
            this.result.push(cloneToken);
      //this.prevToken = cloneToken

      this.prevToken = token
    })
  }
  onDebug = onDebug
  

  // ฟังก์ชันที่ใช้เรียก callbacks เมื่อผลลัพธ์ใหม่ถูกอัพเดต
  emit(contract: ContractType){
    switch (cloneToken.type.label) {
        case 'method':
        console.log(utils.color.white('parse: keyword'))

        break
        case 'keyword': case 'TsKeyword':
        console.log(utils.color.white('parse: keyword and TsKeyword'))

        break
        case 'class': case 'typeAnnotation': case 'types':
        console.log(utils.color.white('parse: class and typeAnnotation and types'))

        break
      case 'variable':
        console.log(utils.color.white('parse: variable'))

        break
        case 'property': case 'object':
        console.log(utils.color.white('parse: property and object'))

        break
        case 'booleans':
        console.log(utils.color.white('parse: boolean'))
        break
      case 'number':
        console.log(utils.color.white('parse: number'))
        break
      case 'string':
        console.log(utils.color.white('parse: string'))
        break
      case 'template': case 'templateExpressionStart':
        console.log(utils.color.white('parse: template and templateExpression'))
        break
      case 'regexp':
        //value ? pattern flags value | string | undefined
        console.log(utils.color.white('parse: regexp'))
        break
        case 'operator': case 'punctuation':
        console.log(utils.color.white('parse: operator and punctuation'))
        break
      case 'privateId': case 'privateIdentifier':
        console.log(utils.color.white('parse: privateId'))
        break
      case 'eof':  //End of File
        console.log(utils.color.white('parse: eof'))
        break
      default:
        console.log(utils.color.white('parse: default'))


        break
    }}
  }
  


import TFKeyword from './keywords.js'
import TFName from './name.js'
import TFNumbers from './numbers.js'
import TFString from './strings.js'
import TFTemplate from './template.js'
import TFOperators from './operators.js'
class CompositeTransformer {
  private transformers: any[] = [];

  constructor() {
    // เพิ่มคลาสย่อยที่ต้องการใช้
    this.transformers.push(new TFKeyword());
    this.transformers.push(new TFName());
    this.transformers.push(new TFNumbers());
    this.transformers.push(new TFString());
    this.transformers.push(new TFTemplate());
    this.transformers.push(new TFOperators());
  }

  pasesToken(token: CustomToken, prevToken: CustomToken | null, nextToken: CustomToken): CustomToken {

    for (const transformer of this.transformers) {
      
    
      token = transformer.parse(token, prevToken, nextToken);
    }
    return token;
  }
}
// class Labels {
//   private transformer: CompositeTransformer;

//   constructor() {
//     this.transformer = new CompositeTransformer();
//   }

//   build() {
//     this.rawToken.forEach((token: CustomToken) => {
//       // ใช้ CompositeTransformer เพื่อแปลง token
//       token = this.transformer.transform(token);
//       this.result.push(token);
//     });
//   }
// }
export default Labels
