import {expectType, expectError} from 'tsd'
import {Node} from 'unist'
import {VFile} from 'vfile'
import {
  unified,
  Plugin,
  Processor,
  FrozenProcessor,
  TransformCallback
} from './index.js'

expectType<Processor>(unified())
expectType<FrozenProcessor>(unified().freeze())

interface ExamplePluginSettings {
  example: string
}

const pluginWithoutOptions: Plugin<void[]> = function (options) {
  expectType<void>(options)
}

// Explicitly typed plugins.

unified().use(pluginWithoutOptions)
expectError(unified().use(pluginWithoutOptions, {}))
expectError(unified().use(pluginWithoutOptions, ''))

const pluginWithOptionalOptions: Plugin<[ExamplePluginSettings?]> = function (
  options
) {
  expectType<ExamplePluginSettings | undefined>(options)
}

unified().use(pluginWithOptionalOptions)
expectError(unified().use(pluginWithOptionalOptions, {}))
unified().use(pluginWithOptionalOptions, {example: ''})

const pluginWithOptions: Plugin<[ExamplePluginSettings]> = function (options) {
  expectType<ExamplePluginSettings>(options)
}

expectError(unified().use(pluginWithOptions))
expectError(unified().use(pluginWithOptions, {}))
unified().use(pluginWithOptions, {example: ''})

const pluginWithSeveralOptions: Plugin<[ExamplePluginSettings, number]> =
  function (options, value) {
    expectType<ExamplePluginSettings>(options)
    expectType<number>(value)
  }

expectError(unified().use(pluginWithSeveralOptions))
expectError(unified().use(pluginWithSeveralOptions, {}))
expectError(unified().use(pluginWithSeveralOptions, {example: ''}))
unified().use(pluginWithSeveralOptions, {example: ''}, 1)

// Implicitly typed plugins.

const pluginWithImplicitOptions = (options?: ExamplePluginSettings) => {
  expectType<ExamplePluginSettings | undefined>(options)
}

unified().use(pluginWithImplicitOptions)
expectError(unified().use(pluginWithImplicitOptions, {}))
unified().use(pluginWithImplicitOptions, {example: ''})

// Using many different forms to pass options.

unified()
  .use(pluginWithOptions, {example: ''})
  .use([pluginWithOptions, {example: ''}])
  .use([[pluginWithOptions, {example: ''}]])
  .use({
    plugins: [[pluginWithOptions, {example: ''}]]
  })

// Using booleans to turn on or off plugins.

unified()
  .use(pluginWithoutOptions, true)
  .use(pluginWithoutOptions, false)
  .use([pluginWithoutOptions, true])
  .use([pluginWithoutOptions, false])
  .use([
    [pluginWithoutOptions, true],
    [pluginWithoutOptions, false]
  ])
  .use({
    plugins: [
      [pluginWithoutOptions, true],
      [pluginWithoutOptions, false]
    ]
  })

// Plugins setting parsers/compilers

unified().use(function () {
  // Function.
  this.Parser = (doc, file) => {
    expectType<string>(doc)
    expectType<VFile>(file)
    return {type: ''}
  }

  // Class.
  this.Parser = class P {
    constructor(doc: string, file: VFile) {
      // Looks useless but ensures this class is assignable
      expectType<string>(doc)
      expectType<VFile>(file)
    }

    parse() {
      return {type: 'x'}
    }
  }

  // Function.
  this.Compiler = (tree, file) => {
    expectType<Node>(tree)
    expectType<VFile>(file)
    return ''
  }

  this.Compiler = class C {
    constructor(node: Node, file: VFile) {
      // Looks useless but ensures this class is assignable
      expectType<Node>(node)
      expectType<VFile>(file)
    }

    compile() {
      return ''
    }
  }
})

// Plugins returning a transformer.

unified()
  .use(() => (tree, file, next) => {
    expectType<Node>(tree)
    expectType<VFile>(file)
    expectType<TransformCallback>(next)
    setImmediate(next)
  })
  .use(() => async (tree, file) => {
    expectType<Node>(tree)
    expectType<VFile>(file)
    return {type: 'x'}
  })
  .use(() => () => ({type: 'x'}))
  .use(() => () => undefined)
  .use(() => () => {
    /* Empty */
  })
  .use(() => () => {
    throw new Error('x')
  })
