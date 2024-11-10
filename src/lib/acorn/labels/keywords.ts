import AbstractLabel, {KeywordType} from './abstract.js'

class Keyword extends AbstractLabel{
  constructor(private token: CustomToken,
                private readonly prevToken: CustomToken,
                private readonly nextToken: CustomToken,){
    super(token, prevToken, nextToken)
    
  }
}
export default Keyword