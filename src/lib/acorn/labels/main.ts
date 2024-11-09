import type {Token} from 'acorn'
import utils from '../../utils/main.js'
interface LabelsTypes {
  [key: string]: string
}
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
interface CustomToken extends Token {
  value: string
}
const taxi = utils.taxi
class Labels {
  private kw: string | undefined
  private lb: string
  constructor(
    private readonly tok: CustomToken) {
    const { type } = this.tok
    this.kw = type.keyword
    this.lb = type.label
    }
  get keyword(): string | undefined {
    return this.kw
  }
  get label(): string {
    return this.lb
  }
  public on(keyword: string, label?: string){
    const bus = taxi.on('label:'+ keyword, (me) => {
      
    })
  }
}