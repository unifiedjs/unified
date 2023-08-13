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
    return "declare const CallableInstance: import('./callable-instance.js').ICallableInstance"
  })
  .replace(/extends Processor_base/, function () {
    console.log('Fixed `CallableInstance` use')
    return 'extends CallableInstance<[], Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>>'
  })
  .replace(
    /\.\.\.parameters: Parameters_1 \| \[boolean] \| undefined/,
    function () {
      console.log(
        'Fixed `use` overload with plugin, and *non-optional* parameters'
      )
      return '...parameters: Parameters_1 | [boolean]'
    }
  )

if (file === result) {
  console.error(
    'Could not fix `lib/index.d.ts`, was `tsc` fixed somewhow? Or were changes already applied?'
  )
} else {
  await fs.writeFile(url, result)
}
