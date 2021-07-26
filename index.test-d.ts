import {expectType, expectError} from 'tsd'
import {Node, Parent, Literal} from 'unist'
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

// Plugins bound to a certain node.

// A small subset of mdast.
interface MdastRoot extends Parent {
  type: 'root'
  children: MdastFlow[]
}

type MdastFlow = MdastParagraph

interface MdastParagraph extends Parent {
  type: 'paragraph'
  children: MdastPhrasing[]
}

type MdastPhrasing = MdastText

interface MdastText extends Literal {
  type: 'text'
  value: string
}

// A small subset of hast.
interface HastRoot extends Parent {
  type: 'root'
  children: HastChild[]
}

type HastChild = HastElement | HastText

interface HastElement extends Parent {
  type: 'element'
  tagName: string
  properties: Record<string, unknown>
  children: HastChild[]
}

interface HastText extends Literal {
  type: 'text'
  value: string
}

const explicitPluginWithInputTree: Plugin<void[], MdastRoot> =
  () => (tree, file) => {
    expectType<MdastRoot>(tree)
    expectType<VFile>(file)
  }

const explicitPluginWithTrees: Plugin<void[], MdastRoot, HastRoot> =
  () => (tree, file) => {
    expectType<MdastRoot>(tree)
    expectType<VFile>(file)
    return {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: {},
          children: [{type: 'text', value: 'a'}]
        }
      ]
    }
  }

unified().use(explicitPluginWithInputTree)
unified().use([explicitPluginWithInputTree])
unified().use({plugins: [explicitPluginWithInputTree], settings: {}})
unified().use(() => (tree: MdastRoot) => {
  expectType<MdastRoot>(tree)
})
unified().use([
  () => (tree: MdastRoot) => {
    expectType<MdastRoot>(tree)
  }
])
unified().use({
  plugins: [
    () => (tree: MdastRoot) => {
      expectType<MdastRoot>(tree)
    }
  ],
  settings: {}
})

unified().use(explicitPluginWithTrees)
unified().use([explicitPluginWithTrees])
unified().use({plugins: [explicitPluginWithTrees], settings: {}})
unified().use(() => (_: MdastRoot) => ({
  type: 'root',
  children: [{type: 'text', value: 'a'}]
}))
unified().use([
  () => (_: MdastRoot) => ({
    type: 'root',
    children: [{type: 'text', value: 'a'}]
  })
])
unified().use({
  plugins: [
    () => (_: MdastRoot) => ({
      type: 'root',
      children: [{type: 'text', value: 'a'}]
    })
  ],
  settings: {}
})
