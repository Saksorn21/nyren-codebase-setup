import { tools as t } from '../lib/help.js'

interface Examples<T> {
  [fnname: string]: T
}
const examples: Examples<string> = {}
examples.run = t.textLightSteelBlue1.dim(`
  ${t.textOrange(`${t.info} Examples `)}
   \`\`\`
   $ nyrenx run -- node index.js 
   $ nyrenx run -- npm run dev
   $ nyrenx run -- npm run test -- npm run build
  `)
examples.install = t.textLightSteelBlue1.dim(`
  ${t.textOrange(`${t.info} Examples `)}

   \`\`\`
   $ nyrenx i -- @nyren/codebase-setup
   $ nyrenx i -- --dev @types/node
   $ nyrenx i -- ts-node -g
   $ nyrenx install -- @nyren/codebase-setup --d @types/nyren
   \`\`\`
   ${t.idea} To install libraries as devDependencies, use the ${t.textLightSteelBlue1.underline('"--D"')} flag followed by the library names.
   
   `)

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
