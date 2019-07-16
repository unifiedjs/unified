import {Node} from 'unist'
import unified = require('unified')
import {
  Processor,
  Plugin,
  VFileCompatible,
  RunCallback,
  ProcessCallback
} from 'unified'
import vfile = require('vfile')
import { VFile } from 'vfile'

let fileValue: vfile.VFile
let nodeValue: Node
let stringValue: string

/**
 * processor()
 */
let processor: Processor = unified()
const clonedProcessor: Processor = processor()

/**
 * processor.use
 */
const plugin: Plugin = function() {}
const settings = {
  random: 'option'
}

interface ExamplePluginSettings {
  example: string
}
const typedPlugin: Plugin<[ExamplePluginSettings?]> = function() {}
const typedSetting = {example: 'example'}

const implicitlyTypedPlugin = (settings?: ExamplePluginSettings) => {}

const transformerPlugin = (settings?: ExamplePluginSettings) => (tree: Node, file: VFile) => ({
  type: 'random node'
})

const pluginWithTwoSettings = (
  processor?: Processor,
  settings?: ExamplePluginSettings
) => {}

processor.use(plugin)
processor.use(plugin).use(plugin)
processor.use(plugin, settings)
processor.use([plugin, plugin])
processor.use([plugin])
processor.use([plugin, settings])
processor.use([[plugin, settings], [plugin, settings]])

processor.use(typedPlugin)
processor.use(typedPlugin).use(typedPlugin)
processor.use(typedPlugin, typedSetting)
// NOTE: in tuple/array form settings are not able to be type checked
processor.use([typedPlugin, typedSetting])
processor.use([[typedPlugin, typedSetting], [typedPlugin, typedSetting]])
processor.use([[plugin, settings], [typedPlugin, typedSetting]])
processor.use([typedPlugin])
processor.use([typedPlugin, typedSetting, settings])
processor.use([typedPlugin, settings])

processor.use(implicitlyTypedPlugin)
processor.use(implicitlyTypedPlugin).use(implicitlyTypedPlugin)
processor.use(implicitlyTypedPlugin, typedSetting)
// NOTE: in tuple/array form settings are not able to be type checked
processor.use([implicitlyTypedPlugin, typedSetting])
processor.use([
  [implicitlyTypedPlugin, typedSetting],
  [implicitlyTypedPlugin, typedSetting]
])
processor.use([[plugin, settings], [implicitlyTypedPlugin, typedSetting]])
processor.use([implicitlyTypedPlugin])
processor.use([implicitlyTypedPlugin, settings])
processor.use([implicitlyTypedPlugin, typedSetting, settings])

processor.use(transformerPlugin)
processor.use([transformerPlugin, transformerPlugin])
processor.use(transformerPlugin, typedSetting)
// $ExpectError
processor.use(transformerPlugin, settings)

processor.use(pluginWithTwoSettings)
processor.use(pluginWithTwoSettings).use(pluginWithTwoSettings)
processor.use(pluginWithTwoSettings, processor, typedSetting)
processor.use(pluginWithTwoSettings, processor)
// NOTE: in tuple/array form settings are not able to be type checked
processor.use([pluginWithTwoSettings, processor, settings])
processor.use([pluginWithTwoSettings, processor, typedSetting])
processor.use([pluginWithTwoSettings, processor])
processor.use([
  [pluginWithTwoSettings, processor, typedSetting],
  [pluginWithTwoSettings, processor, typedSetting]
])
processor.use([
  [plugin, settings],
  [pluginWithTwoSettings, processor, typedSetting]
])
processor.use([pluginWithTwoSettings])

// $ExpectError
processor.use(typedPlugin, settings)
// $ExpectError
processor.use(typedPlugin, typedSetting, settings)

// $ExpectError
processor.use(implicitlyTypedPlugin, settings)
// $ExpectError
processor.use(implicitlyTypedPlugin, typedSetting, settings)

// $ExpectError
processor.use(pluginWithTwoSettings, typedSetting)
// $ExpectError
processor.use(pluginWithTwoSettings, typedSetting)

// $ExpectError
processor.use(pluginWithTwoSettings, processor, settings)

// $ExpectError
processor.use({})
// $ExpectError
processor.use(false)
// $ExpectError
processor.use(true)
// $ExpectError
processor.use('alfred')
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
processor.Parser = (text: string, file: VFile) => ({
  type: 'random node'
})
processor.Parser = class CustomParser {
  parse(text: string, file: VFile): Node {
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
processor.Compiler = (node: Node, file: VFile) => {
  return 'random string'
}
processor.Compiler = class CustomCompiler {
  compile(node: Node, file: VFile) {
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
const runCallback: RunCallback = (error, node, file) => {}
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
const processCallback: ProcessCallback = (error, node) => {}
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

/**
 * Language specific processors
 */
interface RemarkSettings {
  gfm: boolean
}

const remark = unified<RemarkSettings>()
  .use(() => {})
  .freeze()
remark
  .use({settings: {gfm: true}})
  // $ExpectError
  .use({settings: {dne: true}})
remark
  // $ExpectError
  .use({settings: {dne: true}})
  .use({settings: {gfm: true}})
remark.use(function() {
  this
    // $ExpectError
    .use({settings: {dne: true}})
    .use({settings: {gfm: true}})
  this.use({settings: {gfm: true}})
    // $ExpectError
    .use({settings: {dne: true}})
})
// $ExpectError
remark.use({})
