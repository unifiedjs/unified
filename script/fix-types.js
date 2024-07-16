import fs from 'node:fs/promises'

const url = new URL('../lib/index.d.ts', import.meta.url)

let file = ''

try {
  file = String(await fs.readFile(url))
} catch {
  console.error('Could not read `lib/index.d.ts`, did `tsc` run already?')
}

const result = file
  .replace(/declare const Processor_base: [^\n]+/, function () {
    console.log('Fixed `CallableInstance` import')
    return "import {CallableInstance} from './callable-instance.js'"
  })
  .replace(/extends Processor_base/, function () {
    console.log('Fixed `CallableInstance` use')
    return 'extends CallableInstance<[], Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>>'
  })
  .replace(
    /\.\.\.parameters: (Parameters_\d) \| \[boolean] \| undefined/,
    /**
     *
     * @param {string} $0
     * @param {string} $1
     * @returns {string}
     */
    function ($0, $1) {
      console.log(
        'Fixed `use` overload with plugin, and *non-optional* parameters (TS pre 5.4)'
      )
      return '...parameters: ' + $1 + ' | [boolean]'
    }
  )
  .replace(
    /\.\.\.parameters: \(Parameters \| \[boolean]\)\[]/,
    /**
     * @returns {string}
     */
    function () {
      console.log(
        'Fixed `use` overload with plugin, and *non-optional* parameters (TS 5.5+)'
      )
      return '...parameters: Parameters | [boolean]'
    }
  )

if (file === result) {
  console.error(
    'Could not fix `lib/index.d.ts`, was `tsc` fixed somehow? Or were changes already applied?'
  )
} else {
  await fs.writeFile(url, result)
}
