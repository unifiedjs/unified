import * as Unist from 'unist'
import unified = require('unified')
import vfile = require('vfile')

let fileValue: vfile.VFile
let nodeValue: Unist.Node
let stringValue: string

/**
 * processor()
 */
let processor: unified.Processor = unified()
const clonedProcessor: unified.Processor = processor()

/**
 * processor.use
 */
const plugin: unified.Plugin = function() {}
const settings = {
  random: 'option'
}

processor.use(plugin)
processor.use(plugin).use(plugin)
// $ExpectError
processor.use(false)
// $ExpectError
processor.use(true)
// $ExpectError
processor.use('alfred')
processor.use(plugin, settings)
processor.use([plugin, plugin])
processor.use([plugin])
processor.use([plugin, settings])
processor.use([[plugin, settings], [plugin, settings]])
// $ExpectError
processor.use([false])
// $ExpectError
processor.use([true])
// $ExpectError
processor.use(['alfred'])
processor.use({
  // $ExpectError
  plugins: false
})
processor.use({
  // $ExpectError
  plugins: {foo: true}
})
processor.use({})
processor.use({
  plugins: []
})
processor.use({
  settings: {}
})
processor.use({
  plugins: [plugin]
})
processor.use({
  plugins: [plugin, plugin]
})
processor.use({
  plugins: [[plugin, settings], [plugin, settings]]
})
processor.use({
  plugins: [
    {
      plugins: [plugin]
    }
  ]
})

/**
 * processor.parse
 */
nodeValue = processor.parse(vfile())
processor.parse('random string')
processor.parse(new Buffer('random buffer'))

/**
 * processor.Parser
 */
processor.Parser = (file: vfile.VFile | string | Buffer) => ({
  type: 'random node'
})
processor.Parser = class CustomParser {
  parse(file: vfile.VFile | string | Buffer) {
    return {
      type: 'random node'
    }
  }
}

/**
 * processor.stringify
 */
stringValue = processor.stringify(nodeValue)

/**
 * processor.Compiler
 */
processor.Compiler = (node: Unist.Node, file?: vfile.VFile) => {
  return 'random string'
}
processor.Compiler = class CustomCompiler {
  compile(node: Unist.Node, file?: vfile.VFile) {
    return 'random string'
  }
}

/**
 * processor.run
 */
processor.run(nodeValue).then(transFormedNode => {
  nodeValue = transFormedNode
})
processor.run(nodeValue, vfile())
const runCallback: unified.RunCallback = (error, node, file) => {}
processor.run(nodeValue, runCallback)
// $ExpectError
processor.run(nodeValue, runCallback).then(() => {})
// $ExpectError
processor.run(nodeValue, vfile(), runCallback).then(() => {})

/**
 * processor.runSync
 */
nodeValue = processor.runSync(nodeValue)
processor.runSync(nodeValue, vfile())

/**
 * processor.process
 */
processor.process(vfile()).then(file => {
  fileValue = file
})
processor.process('random string')
processor.process(new Buffer('random buffer'))
const processCallback: unified.ProcessCallback = (error, node) => {}
processor.process(vfile(), processCallback)
// $ExpectError
processor.process(vfile(), processCallback).then(() => {})

/**
 * processor.processSync
 */
fileValue = processor.processSync(vfile())
processor.processSync('random string')
processor.processSync(new Buffer('random buffer'))

/**
 * processor.data
 */
processor.data('random key', {})
processor.data('random key', {}).data('random key2', {})
let unknownValue: unknown = processor.data('random key')
// $ExpectError
processor.data('random key').data('random key2', {})
unknownValue = processor.data().randomKey

/**
 * processor.freeze
 */
processor = processor.freeze()
