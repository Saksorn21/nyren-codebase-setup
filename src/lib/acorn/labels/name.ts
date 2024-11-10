import AbstractLabel, {KeywordType} from './abstract.js'

class Name extends AbstractLabel{
  readonly result: CustomToken[] = []
  constructor(private token: CustomToken,
                private readonly prevToken: CustomToken,
                private readonly nextToken: CustomToken,){
    super(token, prevToken, nextToken)
    
  }
}
export default Name