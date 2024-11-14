  import {keywordAnyTypes, JSKeywordTypes, TSKeywordTypes} from './schema-keywordType.js' 
export type ColorType =  'white' | 'dark'| 'purple' | 'yellow' | 'blue' | 'green' | 'orange' | 'red' | 'error' 
export enum colorType {
  white = 'white',
  dark = 'dark',
  purple = 'purple',
  yellow = 'yellow',
  blue = 'blue',
  green = 'green',
  orange = 'orange',
  red = 'red',
  error = 'error',
}
type ColorSchema<T> = {[key in ColorType]: T }
  

export interface ThemeSchema {
  name: string;
  version: string;
  originator: string[] | string;
  colors: ColorSchema<string>;
     // ชื่อสีและโค้ดสี
  
  isDefault?: boolean
}

export const defaultTheme: ThemeSchema  = {
    name: 'Nyren Pro',
    version: '0.0.1',
      originator: ['OneDarkPro for Visual Studio', 'Eva Dark','Atom, One Dark Pro' ],
    colors: {
    white: '#ABB2BF0',    // variable, parameter, operator, punctuation
      dark: '#7F848E',    // 
    purple: '#C678DD',        // keywords เช่น const, import, export
    yellow: '#E5C07B',        // classes, types เช่น class ชื่อ type ของข้อมูล
    blue: '#61AFEF',          // functions, methods, object
    green: '#98C379',         // strings, literals
    orange: '#D19A66',        // property, constants, numbers
    red: '#E06C75',           // errors, highlights
  error: '#F44747',       // invalid
      },
    isDefault: true
};
const matchIncludes: ColorSchema<Array<string>>  = {
  white: ['variable', 'parameter', 'operator', 'punctuation'],
  dark: ['variable', 'parameter', 'operator', 'punctuation', 'name','object'],
  purple: ['keyword',...keywordAnyTypes],
  yellow: ['classes', 'typeAnnotation','types'],
  blue: ['functions', 'method', ],
  green: ['string', 'literals', 'regexp'],
  orange: ['property', 'constants', 'TFnumber', 'TFboolean'],
  red: ['privateId'],
  error: ['invalid','error'],
}
export default matchIncludes