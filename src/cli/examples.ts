import { tools as t } from '../lib/help.js'
interface Examples<T> {
  [fnname: string]: T
}
const examples: Examples<string> = {}
examples.run = `nyrenx run --npm run dev`
examples.install = `nyrenx i --nyren --d @types/nyren`
examples.init = t.textLightSteelBlue1.dim(`
  ${t.textOrange(`${t.info} Examples `)}
  
    \`\`\`
    $ nyrenx init
    $ nyrenx init -n my-project --target ts -m esm
    $ nyrenx init fast ${t.fast}
    $ nyrenx init fast -- my-project js cjs ${t.fast}
    \`\`\`
    
  ${t.textOrange(`${t.idea} Try it `)}
  
    \`\`\`
    $ nyrenx init fast ${t.fast}
    ${t.prefixCli} ${t.fast} ${t.reset(t.textSlateBlue3(`Turbocharge your project builds with ${t.textOrange.dim('[')}${t.textWhit('typescript')}${t.textOrange(']')}${t.reset(t.textSlateBlue3(`, using the module`))} ${t.textOrange.dim('[')}${t.textWhit('module')}${t.textOrange(']')} ${t.reset(t.textSlateBlue3(`in the directory:`))} ${t.textOrange.dim('[')}${t.textWhit('my-project')}${t.textOrange(']')}.`))} ${t.fast}
    \`\`\`
     
   ${t.textOrange(`${t.info} Passing Flags `)}
   
       -t , --target [JavaScript | TypeScript]${t.textWhit(`
         ${t.text('#F7DF1E')(`JavaScript:`)} [ 'js', 'javascript' ]
         ${t.text('#007ACC')(`TypeScript:`)} ['ts', 'typescript', 'type', 'types' ] `)}
  
      -m, --module [esModule | Commonjs]${t.textWhit(`
         ${t.text('#8CCB3D')('esModule:')} [ 'es', 'esm', 'module', 'esmodule', 'es6', 'es2015', 'esnext', 'import' ]
         ${t.text('#F7DF1E')('Commonjs:')} [ 'cjs', 'commonjs', 'common', 'require', 'node' ] `)}
   `)

export default examples
