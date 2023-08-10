import type {Root as HastRoot} from 'hast'
import type {Root as MdastRoot} from 'mdast'
import {expectType} from 'tsd'
import type {Node as UnistNode} from 'unist'
import type {VFile} from 'vfile'
import type {
  FrozenProcessor,
  Plugin,
  Processor,
  TransformCallback
} from './index.js'
import {unified} from './index.js'

expectType<Processor>(unified())
expectType<FrozenProcessor>(unified().freeze())

type ReactNode = {
  kind: string
}

type ExampleOptionalOptions = {
  example?: string | null | undefined
}

type ExampleRequiredOptions = {
  example: string
}

const hastRoot: HastRoot = {
  type: 'root',
  children: [{type: 'element', tagName: 'p', properties: {}, children: []}]
}

const mdastRoot: MdastRoot = {
  type: 'root',
  children: [{type: 'paragraph', children: []}]
}

// # Explicitly typed plugins

// ## Plugin w/o options
const pluginWithoutOptions: Plugin<[]> = function () {
  // Empty.
}

unified().use(pluginWithoutOptions)
unified().use(
  pluginWithoutOptions,
  // @ts-expect-error: plugin does not expect options.
  {}
)
unified().use(
  pluginWithoutOptions,
  // @ts-expect-error: plugin does not expect `string` as options.
  ''
)
unified().use(
  pluginWithoutOptions,
  // @ts-expect-error: plugin does not expect anything.
  undefined
)

// ## Plugin w/ optional options
const pluginWithOptionalOptions: Plugin<
  [(ExampleOptionalOptions | null | undefined)?]
> = function (options) {
  expectType<ExampleOptionalOptions | null | undefined>(options)
}

unified().use(pluginWithOptionalOptions)
unified().use(pluginWithOptionalOptions, {})
unified().use(pluginWithOptionalOptions, {example: null})
unified().use(pluginWithOptionalOptions, {example: undefined})
unified().use(pluginWithOptionalOptions, {example: 'asd'})
unified().use(
  pluginWithOptionalOptions,
  // @ts-expect-error: plugin does not accept `whatever`.
  {whatever: 1}
)

// ## Plugin w/ required options
const pluginWithOptions: Plugin<[ExampleRequiredOptions]> = function (options) {
  expectType<ExampleRequiredOptions>(options)
}

// @ts-expect-error: plugin requires options.
unified().use(pluginWithOptions)
unified().use(
  pluginWithOptions,
  // @ts-expect-error: plugin requires particular option.
  {}
)
unified().use(pluginWithOptions, {example: ''})

// ## Plugin w/ several arguments
const pluginWithSeveralArguments: Plugin<[ExampleRequiredOptions, number]> =
  function (options, value) {
    expectType<ExampleRequiredOptions>(options)
    expectType<number>(value)
  }

// @ts-expect-error: plugin requires options.
unified().use(pluginWithSeveralArguments)
unified().use(
  pluginWithSeveralArguments,
  // @ts-expect-error: plugin requires particular option.
  {}
)
unified().use(
  pluginWithSeveralArguments,
  // @ts-expect-error: plugin requires more arguments.
  {example: ''}
)
unified().use(pluginWithSeveralArguments, {example: ''}, 1)

// # Implicitly typed plugins.

// ## Plugin without options.

function pluginWithoutOptionsImplicit() {
  // Empty.
}

unified().use(pluginWithoutOptionsImplicit)
unified().use(
  pluginWithoutOptionsImplicit,
  // @ts-expect-error: plugin does not accept options.
  {}
)

// ## Plugin w/ optional options

function pluginWithOptionalOptionsImplicit(
  options?: ExampleOptionalOptions | null | undefined
) {
  expectType<ExampleOptionalOptions | null | undefined>(options)
}

unified().use(pluginWithOptionalOptionsImplicit)
unified().use(pluginWithOptionalOptionsImplicit, {})
unified().use(pluginWithOptionalOptionsImplicit, {example: null})
unified().use(pluginWithOptionalOptionsImplicit, {example: undefined})
unified().use(pluginWithOptionalOptionsImplicit, {example: 'asd'})
unified().use(
  pluginWithOptionalOptionsImplicit,
  // @ts-expect-error: plugin does not accept `whatever`.
  {whatever: 1}
)

// ## Plugin w/ required options
function pluginWithOptionsImplicit(options: ExampleRequiredOptions) {
  expectType<ExampleRequiredOptions>(options)
}

// @ts-expect-error: plugin requires options.
unified().use(pluginWithOptionsImplicit)
unified().use(
  pluginWithOptionsImplicit,
  // @ts-expect-error: plugin requires particular option.
  {}
)
unified().use(pluginWithOptionsImplicit, {example: ''})

// ## Plugin w/ several arguments
function pluginWithSeveralArgumentsImplicit(
  options: ExampleRequiredOptions,
  value: number
) {
  expectType<ExampleRequiredOptions>(options)
  expectType<number>(value)
}

// @ts-expect-error: plugin requires options.
unified().use(pluginWithSeveralArgumentsImplicit)
unified().use(
  pluginWithSeveralArgumentsImplicit,
  // @ts-expect-error: plugin requires particular option.
  {}
)
unified().use(
  pluginWithSeveralArgumentsImplicit,
  // @ts-expect-error: plugin requires more arguments.
  {example: ''}
)
unified().use(pluginWithSeveralArgumentsImplicit, {example: ''}, 1)

// # Different ways of passing options

unified()
  .use(pluginWithOptions, {example: ''})
  .use([pluginWithOptions, {example: ''}])
  .use([[pluginWithOptions, {example: ''}]])
  .use({
    plugins: [[pluginWithOptions, {example: ''}]]
  })

// # Turning plugins on/off w/ booleans

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

// # Plugin defining parser/compiler

unified().use(function () {
  // Function.
  this.Parser = function (doc, file) {
    expectType<string>(doc)
    expectType<VFile>(file)
    return {type: ''}
  }

  // Class.
  this.Parser = class {
    parse() {
      return {type: 'x'}
    }
  }

  // Function.
  this.Compiler = function (tree, file) {
    expectType<UnistNode>(tree)
    expectType<VFile>(file)
    return ''
  }

  this.Compiler = class {
    compile() {
      return ''
    }
  }
})

// # Plugins w/ transformer

unified()
  // Sync w/ nothing (baseline).
  .use(function () {
    return function (tree, file) {
      expectType<UnistNode>(tree)
      expectType<VFile>(file)
    }
  })
  // Sync yielding tree.
  .use(function () {
    return function () {
      return {type: 'x'}
    }
  })
  // Sync yielding explicit `undefined`.
  .use(function () {
    return function () {
      return undefined
    }
  })
  // Sync yielding implicit void.
  .use(function () {
    return function () {
      // Empty.
    }
  })
  // Sync yielding error.
  .use(function () {
    return function (x) {
      return new Error('x')
    }
  })
  // Sync throwing error.
  .use(function () {
    return function (x) {
      // To do: investigate if we can support `never` by dropping this useless condition.
      if (x) {
        throw new Error('x')
      }
    }
  })

  // Sync calling `next` w/ tree.
  .use(function () {
    return function (_1, _2, next) {
      expectType<TransformCallback>(next)
      next(undefined, {type: 'x'})
    }
  })
  // Sync calling `next` w/ error.
  .use(function () {
    return function (_1, _2, next) {
      next(new Error('x'))
    }
  })
  // Async calling `next`.
  .use(function () {
    return function (_1, _2, next) {
      setImmediate(function () {
        next()
      })
    }
  })
  // Async calling `next` w/ tree.
  .use(function () {
    return function (_1, _2, next) {
      setImmediate(function () {
        next(undefined, {type: 'x'})
      })
    }
  })
  // Async calling `next` w/ error.
  .use(function () {
    return function (_1, _2, next) {
      setImmediate(function () {
        next(new Error('x'))
      })
    }
  })

  // Resolving nothing (baseline).
  .use(function () {
    return async function (tree, file) {
      expectType<UnistNode>(tree)
      expectType<VFile>(file)
    }
  })
  // Resolving tree.
  .use(function () {
    return async function () {
      return {type: 'x'}
    }
  })
  // To do: investigate why TS barfs on `Promise<undefined>`?
  // // Resolving explicit `undefined`.
  // .use(function () {
  //   return async function () {
  //     return undefined
  //   }
  // })
  // Resolving implicit void.
  .use(function () {
    return async function () {
      // Empty.
    }
  })
  // Rejecting error.
  .use(function () {
    return async function (x) {
      // To do: investigate if we can support `never` by dropping this useless condition.
      if (x) {
        throw new Error('x')
      }
    }
  })

// # Plugins bound to a certain node

// Parse plugins.
const remarkParse: Plugin<[], string, MdastRoot> = function () {
  // Empty.
}

const processorWithRemarkParse = unified()
  .use(remarkParse)
  .use(function () {
    return function (tree) {
      expectType<MdastRoot>(tree)
    }
  })

expectType<Processor<MdastRoot, MdastRoot, MdastRoot>>(processorWithRemarkParse)
expectType<MdastRoot>(processorWithRemarkParse.parse(''))
// To do: accept `UnistNode`?
expectType<MdastRoot>(processorWithRemarkParse.runSync(mdastRoot))
// @ts-expect-error: to do: accept `UnistNode`?
expectType<MdastRoot>(processorWithRemarkParse.runSync(hastRoot))
// To do: yield `never`, accept `UnistNode`?
expectType<void>(processorWithRemarkParse.stringify(mdastRoot))
// @ts-expect-error: to do: accept `UnistNode`?
processorWithRemarkParse.stringify(hastRoot)
expectType<VFile>(processorWithRemarkParse.processSync(''))

// Inspect/transform plugin (explicit).
const remarkLint: Plugin<[], MdastRoot> = function () {
  // Empty.
}

const processorWithRemarkLint = unified()
  .use(remarkLint)
  .use(function () {
    return function (tree) {
      expectType<MdastRoot>(tree)
    }
  })

// To do: `UnistNode`, `MdastRoot`, `UnistNode`?
expectType<Processor<MdastRoot, MdastRoot, MdastRoot>>(processorWithRemarkLint)
// To do: yield `UnistNode`?
expectType<MdastRoot>(processorWithRemarkLint.parse(''))
expectType<MdastRoot>(processorWithRemarkLint.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
expectType<MdastRoot>(processorWithRemarkLint.runSync(hastRoot))
// To do: yield `never`, accept `UnistNode`?
expectType<void>(processorWithRemarkLint.stringify(mdastRoot))
// @ts-expect-error: to do: accept `UnistNode`?
processorWithRemarkLint.stringify(hastRoot)
expectType<VFile>(processorWithRemarkLint.processSync(''))

// Inspect/transform plugin (implicit).
function remarkLintImplicit() {
  return function (tree: MdastRoot) {
    expectType<MdastRoot>(tree)
    return mdastRoot
  }
}

const processorWithRemarkLintImplicit = unified()
  .use(remarkLintImplicit)
  .use(function () {
    return function (tree) {
      expectType<MdastRoot>(tree)
    }
  })

// To do: `UnistNode`, `MdastRoot`, `UnistNode`?
expectType<Processor<MdastRoot, MdastRoot, MdastRoot>>(
  processorWithRemarkLintImplicit
)
// To do: yield `UnistNode`?
expectType<MdastRoot>(processorWithRemarkLintImplicit.parse(''))
expectType<MdastRoot>(processorWithRemarkLintImplicit.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithRemarkLintImplicit.runSync(hastRoot)
// To do: yield `never`, accept `UnistNode`?
expectType<void>(processorWithRemarkLintImplicit.stringify(mdastRoot))
// @ts-expect-error: to do: accept `UnistNode`?
processorWithRemarkLintImplicit.stringify(hastRoot)
expectType<VFile>(processorWithRemarkLintImplicit.processSync(''))

// Mutate  plugin (explicit).
const remarkRehype: Plugin<[], MdastRoot, HastRoot> = function () {
  // Empty.
}

const processorWithRemarkRehype = unified()
  .use(remarkRehype)
  .use(function () {
    return function (tree) {
      expectType<HastRoot>(tree)
    }
  })

// To do: `UnistNode`, `MdastRoot`, `UnistNode`?
expectType<Processor<MdastRoot, HastRoot, HastRoot>>(processorWithRemarkRehype)
// To do: yield `UnistNode`?
expectType<MdastRoot>(processorWithRemarkRehype.parse(''))
expectType<HastRoot>(processorWithRemarkRehype.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithRemarkRehype.runSync(hastRoot)
// To do: yield `never`?
expectType<void>(processorWithRemarkRehype.stringify(hastRoot))
// @ts-expect-error: to do: accept `UnistNode`?
processorWithRemarkRehype.stringify(mdastRoot)
expectType<VFile>(processorWithRemarkRehype.processSync(''))

// Mutate  plugin (implicit).
function remarkRehypeImplicit() {
  return function (tree: MdastRoot) {
    expectType<MdastRoot>(tree)
    return hastRoot
  }
}

const processorWithRemarkRehypeImplicit = unified()
  .use(remarkRehypeImplicit)
  .use(function () {
    return function (tree) {
      expectType<HastRoot>(tree)
    }
  })

// To do: `UnistNode`, `MdastRoot`, `UnistNode`?
expectType<Processor<MdastRoot, HastRoot, HastRoot>>(
  processorWithRemarkRehypeImplicit
)
// To do: yield `UnistNode`?
expectType<MdastRoot>(processorWithRemarkRehypeImplicit.parse(''))
expectType<HastRoot>(processorWithRemarkRehypeImplicit.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithRemarkRehypeImplicit.runSync(hastRoot)
// To do: yield `never`?
expectType<void>(processorWithRemarkRehypeImplicit.stringify(hastRoot))
// @ts-expect-error: to do: accept `UnistNode`?
processorWithRemarkRehypeImplicit.stringify(mdastRoot)
expectType<VFile>(processorWithRemarkRehypeImplicit.processSync(''))

// Compile plugin.
const rehypeStringify: Plugin<[], HastRoot, string> = function () {
  // Empty.
}

const processorWithRehypeStringify = unified().use(rehypeStringify)

// To do: ?
expectType<Processor<HastRoot, HastRoot, HastRoot>>(
  processorWithRehypeStringify
)
// To do: yield `UnistNode`?
expectType<HastRoot>(processorWithRehypeStringify.parse(''))
// @ts-expect-error: to do: accept `UnistNode`?
processorWithRehypeStringify.runSync(mdastRoot)
// To do: accept, yield `UnistNode`?
expectType<HastRoot>(processorWithRehypeStringify.runSync(hastRoot))
expectType<string>(processorWithRehypeStringify.stringify(hastRoot))
// @ts-expect-error: not the correct node type.
processorWithRehypeStringify.stringify(mdastRoot)
expectType<VFile>(processorWithRehypeStringify.processSync(''))

// Compile plugin (to an `Uint8Array`).
const rehypeStringifyUint8Array: Plugin<[], HastRoot, Uint8Array> =
  function () {
    // Empty.
  }

const processorWithRehypeStringifyUint8Array = unified().use(
  rehypeStringifyUint8Array
)

// To do: ?
expectType<Processor<HastRoot, HastRoot, HastRoot>>(
  processorWithRehypeStringifyUint8Array
)
// To do: yield `UnistNode`?
expectType<HastRoot>(processorWithRehypeStringifyUint8Array.parse(''))
// @ts-expect-error: to do: accept `UnistNode`?
processorWithRehypeStringifyUint8Array.runSync(mdastRoot)
// To do: accept, yield `UnistNode`?
expectType<HastRoot>(processorWithRehypeStringifyUint8Array.runSync(hastRoot))
expectType<Uint8Array>(
  processorWithRehypeStringifyUint8Array.stringify(hastRoot)
)
// @ts-expect-error: not the correct node type.
processorWithRehypeStringifyUint8Array.stringify(mdastRoot)
expectType<VFile>(processorWithRehypeStringifyUint8Array.processSync(''))

// Compile plugin (to a non-node).
const rehypeReact: Plugin<[], HastRoot, ReactNode> = function () {
  // Empty.
}

const processorWithRehypeReact = unified().use(rehypeReact)

// To do: ?
expectType<Processor<HastRoot, HastRoot, HastRoot, ReactNode>>(
  processorWithRehypeReact
)
// To do: yield `UnistNode`?
expectType<HastRoot>(processorWithRehypeReact.parse(''))
// @ts-expect-error: to do: accept `UnistNode`?
processorWithRehypeReact.runSync(mdastRoot)
// To do: accept, yield `UnistNode`?
expectType<HastRoot>(processorWithRehypeReact.runSync(hastRoot))
expectType<ReactNode>(processorWithRehypeReact.stringify(hastRoot))
// @ts-expect-error: not the correct node type.
processorWithRehypeReact.stringify(mdastRoot)
expectType<VFile & {result: ReactNode}>(
  processorWithRehypeReact.processSync('')
)

// All together.
const processorWithAll = unified()
  .use(remarkParse)
  .use(remarkLint)
  .use(remarkLintImplicit)
  .use(remarkRehype)
  .use(rehypeStringify)

expectType<Processor<MdastRoot, HastRoot, HastRoot>>(processorWithAll)
expectType<MdastRoot>(processorWithAll.parse(''))
expectType<HastRoot>(processorWithAll.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithAll.runSync(hastRoot)
expectType<string>(processorWithAll.stringify(hastRoot))
// @ts-expect-error: not the correct node type.
processorWithAll.stringify(mdastRoot)
expectType<VFile>(processorWithAll.processSync(''))

// # Different ways to use plugins

expectType<Processor<UnistNode, UnistNode, UnistNode>>(
  unified().use([remarkParse])
)

expectType<Processor<UnistNode, UnistNode, UnistNode>>(
  unified().use([
    remarkParse,
    // @ts-expect-error: to do: investigate.
    remarkLint,
    remarkLintImplicit,
    remarkRehype,
    rehypeStringify
  ])
)

expectType<Processor<UnistNode, UnistNode, UnistNode>>(
  // @ts-expect-error: to do: investigate.
  unified().use({
    plugins: [remarkParse]
  })
)

expectType<Processor<UnistNode, UnistNode, UnistNode>>(
  unified().use({
    // @ts-expect-error: to do: investigate.
    plugins: [
      remarkParse,
      remarkLint,
      remarkLintImplicit,
      remarkRehype,
      rehypeStringify
    ]
  })
)

expectType<Processor<UnistNode, UnistNode, UnistNode>>(
  unified().use({
    // @ts-expect-error: to do: investigate.
    plugins: [
      remarkParse,
      remarkLint,
      remarkLintImplicit,
      remarkRehype,
      rehypeStringify
    ],
    settings: {something: 'stuff'}
  })
)

// # Using multiple parsers/compilers

const rehypeParse: Plugin<[], string, HastRoot> = function () {
  // Empty.
}

const remarkStringify: Plugin<[], MdastRoot, string> = function () {
  // Empty.
}

expectType<HastRoot>(unified().use(remarkParse).use(rehypeParse).parse(''))

expectType<string>(
  unified().use(remarkStringify).use(rehypeStringify).stringify(hastRoot)
)

// # Using mismatched inspect/transform plugins

const rehypeClassNames: Plugin<[], HastRoot> = function () {
  // Empty.
}

// To do: investigate.
unified().use(remarkLint).use(rehypeClassNames)
