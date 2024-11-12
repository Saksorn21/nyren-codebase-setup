export type colorType =  'white' | 'purple' | 'yellow' | 'blue' | 'green' | 'orange' | 'red' | 'error' 
export interface ThemeSchema {
  name: string;
  version: string;
  originator: string[] | string;
  colors: {
    [colorName in colorType]: string; // ชื่อสีและโค้ดสี
  };
  isDefault?: boolean
}

export const defaultTheme: ThemeSchema  = {
    name: 'Nyren Pro',
    version: '0.0.1',
      originator: ['OneDarkPro for Visual Studio', 'Eva Dark','Atom, One Dark Pro' ],
    colors: {
    white: '#ABB2BF',    // variable, parameter, operator, punctuation
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
export default {
  white: ['variable', 'parameter', 'operator', 'punctuation'],
  purple: ['keywords', 'import', 'export'],
  yellow: ['classes', 'types'],
  blue: ['functions', 'methods', 'object'],
  green: ['strings', 'literals'],
  orange: ['property', 'constants', 'numbers'],
  red: ['errors', 'highlights'],
  error: ['invalid'],
}