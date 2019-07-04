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
const typedPlugin: Plugin<ExamplePluginSettings> = function() {}
const typedSetting = {example: 'example'}

const implicitlyTypedPlugin = (settings?: ExamplePluginSettings) => {}

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
processor.use([typedPlugin, typedSetting])
processor.use([[typedPlugin, typedSetting], [typedPlugin, typedSetting]])
processor.use([[plugin, settings], [typedPlugin, typedSetting]])
processor.use([typedPlugin])

processor.use(implicitlyTypedPlugin)
processor.use(implicitlyTypedPlugin).use(implicitlyTypedPlugin)
processor.use(implicitlyTypedPlugin, typedSetting)
processor.use([implicitlyTypedPlugin, typedSetting])
processor.use([
  [implicitlyTypedPlugin, typedSetting],
  [implicitlyTypedPlugin, typedSetting]
])
processor.use([[plugin, settings], [implicitlyTypedPlugin, typedSetting]])
processor.use([implicitlyTypedPlugin])

// NOTE: settings overrides the generic undefined
// settings value will be unused but TypeScript will not warn
processor.use(implicitlyTypedPlugin, typedSetting, settings)
processor.use([implicitlyTypedPlugin, typedSetting, settings])

processor.use(pluginWithTwoSettings)
processor.use(pluginWithTwoSettings).use(pluginWithTwoSettings)
processor.use(pluginWithTwoSettings, processor, typedSetting)
processor.use(pluginWithTwoSettings, processor)
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
processor.use([typedPlugin, settings])
// $ExpectError
processor.use(typedPlugin, typedSetting, settings)
// $ExpectError
processor.use([typedPlugin, typedSetting, settings])

// $ExpectError
processor.use(implicitlyTypedPlugin, settings)
// $ExpectError
processor.use([implicitlyTypedPlugin, settings])

// $ExpectError
processor.use(pluginWithTwoSettings, typedSetting)
// $ExpectError
processor.use(pluginWithTwoSettings, typedSetting)

// $ExpectError
processor.use(pluginWithTwoSettings, processor, settings)
// $ExpectError
processor.use([pluginWithTwoSettings, processor, settings])

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
processor.Parser = (file: VFileCompatible) => ({
  type: 'random node'
})
processor.Parser = class CustomParser {
  parse(file: VFileCompatible) {
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
processor.Compiler = (node: Node, file?: VFileCompatible) => {
  return 'random string'
}
processor.Compiler = class CustomCompiler {
  compile(node: Node, file?: vfile.VFile) {
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
