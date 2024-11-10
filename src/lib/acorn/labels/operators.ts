import AbstractLabel, {KeywordType} from './abstract.js'

class Operators extends AbstractLabel{
  constructor(private token: CustomToken,
                private readonly prevToken: CustomToken,
                private readonly nextToken: CustomToken,){
    super(token, prevToken, nextToken)

  }
}
export default Operators