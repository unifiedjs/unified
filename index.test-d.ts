import type {Root as HastRoot} from 'hast'
import type {Root as MdastRoot} from 'mdast'
import {expectType} from 'tsd'
import type {Node as UnistNode} from 'unist'
import type {VFile} from 'vfile'
import type {Plugin, Processor, TransformCallback} from './index.js'
import {unified} from './index.js'

expectType<Processor>(unified())
expectType<Processor>(unified().freeze())

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
const pluginWithoutOptions: Plugin = function () {
  // Empty.
}

unified().use(pluginWithoutOptions)
// @ts-expect-error: plugin does not expect options.
unified().use(pluginWithoutOptions, {})
// @ts-expect-error: plugin does not expect `string` as options.
unified().use(pluginWithoutOptions, '')
// @ts-expect-error: plugin does not expect anything.
unified().use(pluginWithoutOptions, undefined)

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
// @ts-expect-error: plugin does not accept `whatever`.
unified().use(pluginWithOptionalOptions, {whatever: 1})

// ## Plugin w/ required options
const pluginWithOptions: Plugin<[ExampleRequiredOptions]> = function (options) {
  expectType<ExampleRequiredOptions>(options)
}

// @ts-expect-error: plugin requires options.
unified().use(pluginWithOptions)
// @ts-expect-error: plugin requires particular option.
unified().use(pluginWithOptions, {})
unified().use(pluginWithOptions, {example: ''})

// ## Plugin w/ several arguments
const pluginWithSeveralArguments: Plugin<[ExampleRequiredOptions, number]> =
  function (options, value) {
    expectType<ExampleRequiredOptions>(options)
    expectType<number>(value)
  }

// @ts-expect-error: plugin requires options.
unified().use(pluginWithSeveralArguments)
// @ts-expect-error: plugin requires particular option.
unified().use(pluginWithSeveralArguments, {})
// @ts-expect-error: plugin requires more arguments.
unified().use(pluginWithSeveralArguments, {example: ''})
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
  .use([[pluginWithOptions, {example: ''}]])
  .use({
    plugins: [[pluginWithOptions, {example: ''}]]
  })

// # Turning plugins on/off w/ booleans

unified()
  .use(pluginWithoutOptions, true)
  .use(pluginWithoutOptions, false)
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
  this.parser = function (document, file) {
    expectType<string>(document)
    expectType<VFile>(file)
    return {type: ''}
  }

  // Function.
  this.compiler = function (tree, file) {
    expectType<UnistNode>(tree)
    expectType<VFile>(file)
    return ''
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
  // Sync yielding implicit `void` (because TS).
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
      // Note: TS doesn’t like the `never` if we remove this useless condition.
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
  // Resolving explicit `undefined`.
  .use(function () {
    return async function () {
      return undefined
    }
  })
  // Resolving implicit `void` (because TS).
  .use(function () {
    return async function () {
      // Empty.
    }
  })
  // Rejecting error.
  .use(function () {
    return async function (x) {
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

const processorWithRemarkParse = unified().use(remarkParse)

expectType<Processor<MdastRoot>>(processorWithRemarkParse)
expectType<MdastRoot>(processorWithRemarkParse.parse(''))
expectType<UnistNode>(processorWithRemarkParse.runSync(mdastRoot))
expectType<UnistNode>(processorWithRemarkParse.runSync(hastRoot))
expectType<Uint8Array | string>(processorWithRemarkParse.stringify(mdastRoot))
processorWithRemarkParse.stringify(hastRoot)
expectType<VFile>(processorWithRemarkParse.processSync(''))

// Inspect/transform plugin (explicit).
const remarkLint: Plugin<[], MdastRoot> = function () {
  // Empty.
}

const processorWithRemarkLint = unified().use(remarkLint)

expectType<Processor<undefined, MdastRoot, MdastRoot>>(processorWithRemarkLint)
expectType<UnistNode>(processorWithRemarkLint.parse(''))
expectType<MdastRoot>(processorWithRemarkLint.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithRemarkLint.runSync(hastRoot)
expectType<Uint8Array | string>(processorWithRemarkLint.stringify(mdastRoot))
expectType<Uint8Array | string>(processorWithRemarkLint.stringify(hastRoot))
expectType<VFile>(processorWithRemarkLint.processSync(''))

// Inspect/transform plugin (implicit).
function remarkLintImplicit() {
  return function (tree: MdastRoot) {
    expectType<MdastRoot>(tree)
    return mdastRoot
  }
}

const processorWithRemarkLintImplicit = unified().use(remarkLintImplicit)

expectType<Processor<undefined, MdastRoot, MdastRoot>>(
  processorWithRemarkLintImplicit
)
expectType<UnistNode>(processorWithRemarkLintImplicit.parse(''))
expectType<MdastRoot>(processorWithRemarkLintImplicit.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithRemarkLintImplicit.runSync(hastRoot)
expectType<Uint8Array | string>(
  processorWithRemarkLintImplicit.stringify(mdastRoot)
)
expectType<Uint8Array | string>(
  processorWithRemarkLintImplicit.stringify(hastRoot)
)
expectType<VFile>(processorWithRemarkLintImplicit.processSync(''))

// Mutate  plugin (explicit).
const remarkRehype: Plugin<[], MdastRoot, HastRoot> = function () {
  // Empty.
}

const processorWithRemarkRehype = unified().use(remarkRehype)

expectType<Processor<undefined, MdastRoot, HastRoot>>(processorWithRemarkRehype)
expectType<UnistNode>(processorWithRemarkRehype.parse(''))
expectType<HastRoot>(processorWithRemarkRehype.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithRemarkRehype.runSync(hastRoot)
expectType<Uint8Array | string>(processorWithRemarkRehype.stringify(hastRoot))
expectType<Uint8Array | string>(processorWithRemarkRehype.stringify(mdastRoot))
expectType<VFile>(processorWithRemarkRehype.processSync(''))

// Mutate  plugin (implicit).
function remarkRehypeImplicit() {
  return function (tree: MdastRoot) {
    expectType<MdastRoot>(tree)
    return hastRoot
  }
}

const processorWithRemarkRehypeImplicit = unified().use(remarkRehypeImplicit)

expectType<Processor<undefined, MdastRoot, HastRoot>>(
  processorWithRemarkRehypeImplicit
)
expectType<UnistNode>(processorWithRemarkRehypeImplicit.parse(''))
expectType<HastRoot>(processorWithRemarkRehypeImplicit.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithRemarkRehypeImplicit.runSync(hastRoot)
expectType<Uint8Array | string>(
  processorWithRemarkRehypeImplicit.stringify(hastRoot)
)
expectType<Uint8Array | string>(
  processorWithRemarkRehypeImplicit.stringify(mdastRoot)
)
expectType<VFile>(processorWithRemarkRehypeImplicit.processSync(''))

// Compile plugin.
const rehypeStringify: Plugin<[], HastRoot, string> = function () {
  // Empty.
}

const processorWithRehypeStringify = unified().use(rehypeStringify)

expectType<Processor<undefined, undefined, undefined, HastRoot, string>>(
  processorWithRehypeStringify
)
expectType<UnistNode>(processorWithRehypeStringify.parse(''))
expectType<UnistNode>(processorWithRehypeStringify.runSync(mdastRoot))
expectType<UnistNode>(processorWithRehypeStringify.runSync(hastRoot))
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

expectType<Processor<undefined, undefined, undefined, HastRoot, Uint8Array>>(
  processorWithRehypeStringifyUint8Array
)
expectType<UnistNode>(processorWithRehypeStringifyUint8Array.parse(''))
expectType<UnistNode>(processorWithRehypeStringifyUint8Array.runSync(mdastRoot))
expectType<UnistNode>(processorWithRehypeStringifyUint8Array.runSync(hastRoot))
expectType<Uint8Array>(
  processorWithRehypeStringifyUint8Array.stringify(hastRoot)
)
// @ts-expect-error: not the correct node type.
processorWithRehypeStringifyUint8Array.stringify(mdastRoot)
expectType<VFile>(processorWithRehypeStringifyUint8Array.processSync(''))

/**
 * Register our custom compile result.
 */
declare module './index.js' {
  interface CompileResultMap {
    ReactNode: ReactNode
  }
}

// Compile plugin (to a non-node).
const rehypeReact: Plugin<[], HastRoot, ReactNode> = function () {
  // Empty.
}

const processorWithRehypeReact = unified().use(rehypeReact)

expectType<Processor<undefined, undefined, undefined, HastRoot, ReactNode>>(
  processorWithRehypeReact
)
expectType<UnistNode>(processorWithRehypeReact.parse(''))
expectType<UnistNode>(processorWithRehypeReact.runSync(mdastRoot))
expectType<UnistNode>(processorWithRehypeReact.runSync(hastRoot))
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

expectType<Processor<MdastRoot, MdastRoot, HastRoot, HastRoot, string>>(
  processorWithAll
)
expectType<MdastRoot>(processorWithAll.parse(''))
expectType<HastRoot>(processorWithAll.runSync(mdastRoot))
// @ts-expect-error: not the correct node type.
processorWithAll.runSync(hastRoot)
expectType<string>(processorWithAll.stringify(hastRoot))
// @ts-expect-error: not the correct node type.
processorWithAll.stringify(mdastRoot)
expectType<VFile>(processorWithAll.processSync(''))

// Doesn’t matter how you apply, compiler, transformers, parser is also fine.
expectType<Processor<MdastRoot, MdastRoot, HastRoot, HastRoot, string>>(
  unified()
    .use(rehypeStringify)
    .use(remarkLint)
    .use(remarkLintImplicit)
    .use(remarkRehype)
    .use(remarkParse)
)

// # Different ways to use plugins

expectType<Processor>(unified().use([remarkParse]))

expectType<Processor>(
  unified().use([
    remarkParse,
    remarkLint,
    remarkLintImplicit,
    remarkRehype,
    rehypeStringify
  ])
)

expectType<Processor>(
  unified().use({
    plugins: [remarkParse]
  })
)

expectType<Processor>(
  unified().use({
    plugins: [
      remarkParse,
      remarkLint,
      remarkLintImplicit,
      remarkRehype,
      rehypeStringify
    ]
  })
)

/**
 * Register our setting.
 */
declare module './index.js' {
  interface Settings {
    something?: string | undefined
  }
}

expectType<Processor>(
  unified().use({
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

// We currently only *use* types, we don’t crash if they are nonsensical.
expectType<Processor<undefined, MdastRoot, HastRoot>>(
  unified().use(remarkLint).use(rehypeClassNames)
)
