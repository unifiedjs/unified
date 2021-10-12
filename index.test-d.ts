/* eslint-disable @typescript-eslint/no-floating-promises */

import type {Buffer} from 'node:buffer'
import {expectType, expectError} from 'tsd'
import type {Node, Parent, Literal} from 'unist'
import type {VFile} from 'vfile'
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
  .use(() => (x) => {
    if (x) {
      throw new Error('x')
    }
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

// Input and output types.
interface ReactNode {
  kind: string
}

const someMdast: MdastRoot = {
  type: 'root',
  children: [{type: 'paragraph', children: [{type: 'text', value: 'a'}]}]
}

const someHast: HastRoot = {
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

const remarkParse: Plugin<void[], string, MdastRoot> = () => {
  /* Empty */
}

const remarkStringify: Plugin<void[], MdastRoot, string> = () => {
  /* Empty */
}

const rehypeParse: Plugin<void[], string, HastRoot> = () => {
  /* Empty */
}

const rehypeStringify: Plugin<void[], HastRoot, string> = () => {
  /* Empty */
}

const rehypeStringifyBuffer: Plugin<void[], HastRoot, Buffer> = () => {
  /* Empty */
}

const explicitRemarkPlugin: Plugin<void[], MdastRoot> = () => {
  /* Empty */
}

const implicitPlugin: Plugin<void[]> = () => {
  /* Empty */
}

const remarkRehype: Plugin<void[], MdastRoot, HastRoot> = () => {
  /* Empty */
}

const explicitRehypePlugin: Plugin<void[], HastRoot> = () => {
  /* Empty */
}

const rehypeReact: Plugin<void[], HastRoot, ReactNode> = () => {
  /* Empty */
}

// If a plugin is defined with string as input and a node as output, it
// configures a parser.
expectType<MdastRoot>(unified().use(remarkParse).parse(''))
expectType<HastRoot>(unified().use(rehypeParse).parse(''))
expectType<Node>(unified().parse('')) // No parser.

// If a plugin is defined with a node as input and a non-node as output, it
// configures a compiler.
expectType<string>(unified().use(remarkStringify).stringify(someMdast))
expectType<string>(unified().use(rehypeStringify).stringify(someHast))
expectType<Buffer>(unified().use(rehypeStringifyBuffer).stringify(someHast))
expectType<unknown>(unified().stringify(someHast)) // No compiler.
expectType<ReactNode>(unified().use(rehypeReact).stringify(someHast))
expectError(unified().use(remarkStringify).stringify(someHast))
expectError(unified().use(rehypeStringify).stringify(someMdast))

// Compilers configure the output of `process`, too.
expectType<VFile>(unified().use(remarkStringify).processSync(''))
expectType<VFile>(unified().use(rehypeStringify).processSync(''))
expectType<VFile>(unified().use(rehypeStringifyBuffer).processSync(''))
expectType<VFile>(unified().processSync(''))
expectType<VFile & {result: ReactNode}>(
  unified().use(rehypeReact).processSync('')
)

// A parser plugin defines the input of `.run`:
expectType<MdastRoot>(unified().use(remarkParse).runSync(someMdast))
expectError(unified().use(remarkParse).runSync(someHast))

// A compiler plugin defines the input/output of `.run`:
expectError(unified().use(rehypeStringify).runSync(someMdast))
// As a parser and a compiler are set, it can be assumed that the input of `run`
// is the result of the parser, and the output is the input of the compiler.
expectType<HastRoot>(
  unified().use(remarkParse).use(rehypeStringify).runSync(someMdast)
)
// Probably hast expected.
expectError(unified().use(rehypeStringify).runSync(someMdast))

unified()
  .use(rehypeStringify)
  .run(someHast)
  .then((thing) => {
    expectType<HastRoot>(thing)
  })

unified()
  .use(rehypeStringify)
  .run(someHast, (error, thing) => {
    expectType<Error | null | undefined>(error)
    expectType<HastRoot | undefined>(thing)
  })

// A compiler plugin defines the output of `.process`:
expectType<VFile & {result: ReactNode}>(
  unified().use(rehypeReact).processSync('')
)
expectType<VFile & {result: ReactNode}>(
  unified().use(remarkParse).use(rehypeReact).processSync('')
)

unified()
  .use(rehypeReact)
  .process('')
  .then((file) => {
    expectType<VFile & {result: ReactNode}>(file)
  })

unified()
  .use(rehypeReact)
  .process('', (error, thing) => {
    expectType<Error | null | undefined>(error)
    expectType<(VFile & {result: ReactNode}) | undefined>(thing)
  })

// Plugins work!
unified()
  .use(remarkParse)
  .use(explicitRemarkPlugin)
  .use(implicitPlugin)
  .use(remarkRehype)
  .use(implicitPlugin)
  .use(rehypeStringify)
  .freeze()

// Parsers define the input of transformers.
unified().use(() => (node) => {
  expectType<Node>(node)
})
unified()
  .use(remarkParse)
  .use(() => (node) => {
    expectType<MdastRoot>(node)
  })
unified()
  .use(rehypeParse)
  .use(() => (node) => {
    expectType<HastRoot>(node)
  })

unified()
  // Using a parser plugin also defines the current tree (see next).
  .use(remarkParse)
  // A plugin following a typed parser receives the defined AST.
  // If it doesn’t resolve anything, that AST remains for the next plugin.
  .use(() => (node) => {
    expectType<MdastRoot>(node)
  })
  // A plugin that returns a certain AST, defines it for the next plugin.
  .use(() => (node) => {
    expectType<MdastRoot>(node)
    return someHast
  })
  .use(() => (node) => {
    expectType<HastRoot>(node)
  })
  .use(rehypeStringify)

// Using two parsers or compilers is fine. The last one sticks.
const p1 = unified().use(remarkParse).use(rehypeParse)
expectType<HastRoot>(p1.parse(''))
const p2 = unified().use(remarkStringify).use(rehypeStringify)
expectError(p2.stringify(someMdast))

// Using mismatched explicit plugins is fine (for now).
unified()
  .use(explicitRemarkPlugin)
  .use(explicitRehypePlugin)
  .use(explicitRemarkPlugin)

expectType<HastRoot>(
  unified()
    .use(explicitRemarkPlugin)
    .use(remarkRehype)
    .use(explicitRehypePlugin)
    .runSync(someMdast)
)

/* eslint-enable @typescript-eslint/no-floating-promises */
