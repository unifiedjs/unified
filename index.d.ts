// TypeScript Version: 4.0

// Note: this is a `.d.ts` file because it is not possible to have default type
// parameters in JSDoc-based TypeScript, which is a feature we use to type that:
//
// ```js
// .use(somePlugin, theOptions)
// ```
//
// `theOptions` matches the options that `somePlugin` expects and thus is very
// important for making unified usable in TypeScript.
//
// Furthermore, this is places in the root of the project because types that
// accept type parameters cannot be re-exported as such easily.

import type {Node} from 'unist'
import type {VFile, VFileCompatible, VFileValue} from 'vfile'

/**
 * Interface of known results from compilers.
 *
 * Normally, compilers result in text ({@link VFileValue `VFileValue`}).
 * When you compile to something else, such as a React node (as in,
 * `rehype-react`), you can augment this interface to include that type.
 *
 * ```ts
 * import type {ReactNode} from 'somewhere'
 *
 * declare module 'unified' {
 *   interface CompileResultMap {
 *     // Register a new result (value is used, key should match it).
 *     ReactNode: ReactNode
 *   }
 * }
 * ```
 *
 * Use {@link CompileResults `CompileResults`} to access the values.
 */
// Note: if `Value` from `VFile` is changed, this should too.
export interface CompileResultMap {
  Uint8Array: Uint8Array
  string: string
}

/**
 * Acceptable results from compilers.
 *
 * To register custom results, add them to
 * {@link CompileResultMap `CompileResultMap`}.
 */
type CompileResults = CompileResultMap[keyof CompileResultMap]

/**
 * Type to generate a {@link VFile `VFile`} corresponding to a compiler result.
 *
 * If a result that is not acceptable on a `VFile` is used, that will
 * be stored on the `result` field of {@link VFile `VFile`}.
 *
 * @typeParam Result
 *   Compile result.
 */
type VFileWithOutput<Result extends CompileResults | undefined> =
  Result extends VFileValue | undefined ? VFile : VFile & {result: Result}

/**
 * Create a processor based on the input/output of a {@link Plugin plugin}.
 *
 * @typeParam ParseTree
 *   Output of `parse`.
 * @typeParam HeadTree
 *   Input for `run`.
 * @typeParam TailTree
 *   Output for `run`.
 * @typeParam CompileTree
 *   Input of `stringify`.
 * @typeParam CompileResult
 *   Output of `stringify`.
 * @typeParam Input
 *   Input of plugin.
 * @typeParam Output
 *   Output of plugin.
 */
type UsePlugin<
  ParseTree extends Node | undefined,
  HeadTree extends Node | undefined,
  TailTree extends Node | undefined,
  CompileTree extends Node | undefined,
  CompileResult extends CompileResults | undefined,
  Input extends Node | string | undefined,
  Output
> = Input extends string
  ? Output extends Node | undefined
    ? // Parser.
      Processor<
        Output extends undefined ? ParseTree : Output,
        HeadTree,
        TailTree,
        CompileTree,
        CompileResult
      >
    : // Unknown.
      Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
  : Output extends CompileResults
  ? Input extends Node | undefined
    ? // Compiler.
      Processor<
        ParseTree,
        HeadTree,
        TailTree,
        Input extends undefined ? CompileTree : Input,
        Output extends undefined ? CompileResult : Output
      >
    : // Unknown.
      Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
  : Input extends Node | undefined
  ? Output extends Node | undefined
    ? // Transform.
      Processor<
        ParseTree,
        // No `HeadTree` yet? Set `Input`.
        HeadTree extends undefined ? Input : HeadTree,
        Output extends undefined ? TailTree : Output,
        CompileTree,
        CompileResult
      >
    : // Unknown.
      Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
  : // Unknown.
    Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>

/**
 * Processor.
 *
 * @typeParam ParseTree
 *   Output of `parse`.
 * @typeParam HeadTree
 *   Input for `run`.
 * @typeParam TailTree
 *   Output for `run`.
 * @typeParam CompileTree
 *   Input of `stringify`.
 * @typeParam CompileResult
 *   Output of `stringify`.
 */
export type Processor<
  ParseTree extends Node | undefined = undefined,
  HeadTree extends Node | undefined = undefined,
  TailTree extends Node | undefined = undefined,
  CompileTree extends Node | undefined = undefined,
  CompileResult extends CompileResults | undefined = undefined
> = {
  /**
   * Configure the processor with a preset.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * @example
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Preset with plugins and settings:
   *     .use({plugins: [pluginA, [pluginB, {}]], settings: {position: false}})
   *     // Settings only:
   *     .use({settings: {position: false}})
   *   ```
   *
   * @param preset
   *   Single preset ({@link Preset `Preset`}): an object with a `plugins`
   *   and/or `settings`.
   * @returns
   *   Current processor.
   */
  use(
    preset?: Preset | null | undefined
  ): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>

  /**
   * Configure the processor with a list of usable values.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * @example
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugins:
   *     .use([pluginA, pluginB])
   *     // Two plugins, the second with options:
   *     .use([pluginC, [pluginD, {}]])
   *   ```
   *
   * @param list
   *   List of plugins plugins, presets, and tuples
   *   ({@link PluggableList `PluggableList`}).
   * @returns
   *   Current processor.
   */
  use(
    list: PluggableList
  ): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>

  /**
   * Configure the processor to use a {@link Plugin `Plugin`}.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * @example
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugin with options:
   *     .use(pluginA, {x: true, y: true})
   *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
   *     .use(pluginA, {y: false, z: true})
   *   ```
   *
   * @typeParam Parameters
   *   Arguments passed to the plugin.
   * @typeParam Input
   *   Value that is expected as input.
   *
   *   *   If the plugin returns a {@link Transformer `Transformer`}, this
   *       should be the node it expects.
   *   *   If the plugin sets a {@link Parser `Parser`}, this should be
   *       `string`.
   *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be the
   *       node it expects.
   * @typeParam Output
   *   Value that is yielded as output.
   *
   *   *   If the plugin returns a {@link Transformer `Transformer`}, this
   *       should be the node that that yields.
   *   *   If the plugin sets a {@link Parser `Parser`}, this should be the
   *       node that it yields.
   *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be
   *       result it yields.
   * @param plugin
   *   {@link Plugin `Plugin`} to use.
   * @param parameters
   *   Arguments passed to the {@link Plugin plugin}.
   *
   *   Plugins typically receive one options object, but could receive other and
   *   more values.
   *   It’s also possible to pass a boolean: `true` (to turn a plugin on),
   *   `false` (to turn a plugin off).
   * @returns
   *   Current processor.
   */
  use<
    Parameters extends unknown[] = [],
    Input extends Node | string | undefined = undefined,
    Output = Input
  >(
    plugin: Plugin<Parameters, Input, Output>,
    ...parameters: Parameters | [boolean]
  ): UsePlugin<
    ParseTree,
    HeadTree,
    TailTree,
    CompileTree,
    CompileResult,
    Input,
    Output
  >

  /**
   * Configure the processor to use a tuple of a {@link Plugin `Plugin`} with
   * its parameters.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * @example
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugin with options:
   *     .use([pluginA, {x: true, y: true}])
   *   ```
   *
   * @typeParam Parameters
   *   Arguments passed to the plugin.
   * @typeParam Input
   *   Value that is expected as input.
   *
   *   *   If the plugin returns a {@link Transformer `Transformer`}, this
   *       should be the node it expects.
   *   *   If the plugin sets a {@link Parser `Parser`}, this should be
   *       `string`.
   *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be the
   *       node it expects.
   * @typeParam Output
   *   Value that is yielded as output.
   *
   *   *   If the plugin returns a {@link Transformer `Transformer`}, this
   *       should be the node that that yields.
   *   *   If the plugin sets a {@link Parser `Parser`}, this should be the
   *       node that it yields.
   *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be
   *       result it yields.
   * @param tuple
   *   {@link Plugin `Plugin`} with arguments to use.
   *
   *   Plugins typically receive one options object, but could receive other and
   *   more values.
   *   It’s also possible to pass a boolean: `true` (to turn a plugin on),
   *   `false` (to turn a plugin off).
   * @returns
   *   Current processor.
   */
  use<
    Parameters extends unknown[] = [],
    Input extends Node | string | undefined = undefined,
    Output = Input
  >(
    tuple:
      | [plugin: Plugin<Parameters, Input, Output>, enable: boolean] // Enable or disable the plugin.
      | [plugin: Plugin<Parameters, Input, Output>, ...parameters: Parameters] // Configure the plugin.
  ): UsePlugin<
    ParseTree,
    HeadTree,
    TailTree,
    CompileTree,
    CompileResult,
    Input,
    Output
  >
} & FrozenProcessor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>

/**
 * Frozen processor.
 *
 * @typeParam ParseTree
 *   Output of `parse`.
 * @typeParam HeadTree
 *   Input for `run`.
 * @typeParam TailTree
 *   Output for `run`.
 * @typeParam CompileTree
 *   Input of `stringify`.
 * @typeParam CompileResult
 *   Output of `stringify`.
 */
export type FrozenProcessor<
  ParseTree extends Node | undefined = undefined,
  HeadTree extends Node | undefined = undefined,
  TailTree extends Node | undefined = undefined,
  CompileTree extends Node | undefined = undefined,
  CompileResult extends CompileResults | undefined = undefined
> = {
  /**
   * Create a processor.
   *
   * @returns
   *   New *unfrozen* processor ({@link Processor `Processor`}) that is
   *   configured to work the same as its ancestor.
   *   When the descendant processor is configured in the future it does not
   *   affect the ancestral processor.
   */
  (): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>

  /**
   * Internal list of configured plugins.
   *
   * @private
   */
  attachers: Array<PluginTuple<unknown[]>>

  /**
   * A **parser** handles the parsing of text to a syntax tree.
   *
   * It is used in the parse phase and is called with a `string` and
   * {@link VFile `VFile`} of the document to parse.
   *
   * `Parser` can be a normal function, in which case it must return the syntax
   * tree representation of the given file ({@link Node `Node`}).
   *
   * `Parser` can also be a constructor function (a function with a `parse`
   * field in its `prototype`), in which case it is constructed with `new`.
   * Instances must have a `parse` method that is called without arguments and must
   * return a {@link Node `Node`}.
   */
  Parser?: Parser<ParseTree extends undefined ? Node : ParseTree> | undefined

  /**
   * A **compiler** handles the compiling of a syntax tree to something else (in
   * most cases, text).
   *
   * It is used in the stringify phase and called with a {@link Node `Node`}
   * and {@link VFile `VFile`} representation of the document to compile.
   *
   * `Compiler` can be a normal function, in which case it should return the
   * textual representation of the given tree (`string`).
   *
   * `Compiler` can also be a constructor function (a function with a `compile`
   * field in its `prototype`), in which case it is constructed with `new`.
   * Instances must have a `compile` method that is called without arguments and
   * should return a `string`.
   *
   * > 👉 **Note**: unified typically compiles by serializing: most compilers
   * > return `string` (or `Uint8Array`).
   * > Some compilers, such as the one configured with
   * > [`rehype-react`][rehype-react], return other values (in this case, a
   * > React tree).
   * > If you’re using a compiler that doesn’t serialize, expect different result
   * > values.
   * >
   * > To register custom results in TypeScript, add them to
   * > {@link CompileResultMap `CompileResultMap`}.
   *
   * [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  Compiler?:
    | Compiler<
        CompileTree extends undefined ? Node : CompileTree,
        CompileResult extends undefined ? unknown : CompileResult
      >
    | undefined

  /**
   * Parse text to a syntax tree.
   *
   * > 👉 **Note**: `parse` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `parse` performs the parse phase, not the run phase or other
   * > phases.
   *
   * @param file
   *   file to parse; typically `string`; any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns
   *   Syntax tree representing `file`.
   */
  parse(
    file?: VFileCompatible | undefined
  ): ParseTree extends undefined ? Node : ParseTree

  /**
   * Compile a syntax tree.
   *
   * > 👉 **Note**: `stringify` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `stringify` performs the stringify phase, not the run phase
   * or other phases.
   *
   * @param tree
   *   Tree to compile
   * @param file
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns
   *   Textual representation of the tree (see note).
   *
   *   > 👉 **Note**: unified typically compiles by serializing: most compilers
   *   > return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different result
   *   > values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@link CompileResultMap `CompileResultMap`}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  stringify(
    tree: CompileTree extends undefined ? Node : CompileTree,
    file?: VFileCompatible | undefined
  ): CompileResult extends undefined ? VFileValue : CompileResult

  /**
   * Run *transformers* on a syntax tree.
   *
   * > 👉 **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `run` performs the run phase, not other phases.
   *
   * @param tree
   *   Tree to transform and inspect.
   * @param done
   *   Callback.
   * @returns
   *   Nothing.
   */
  run(
    tree: HeadTree extends undefined ? Node : HeadTree,
    done: RunCallback<TailTree extends undefined ? Node : TailTree>
  ): undefined

  /**
   * Run *transformers* on a syntax tree.
   *
   * > 👉 **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `run` performs the run phase, not other phases.
   *
   * @param tree
   *   Tree to transform and inspect.
   * @param file
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @param done
   *   Callback.
   * @returns
   *   Nothing.
   */
  run(
    tree: HeadTree extends undefined ? Node : HeadTree,
    file: VFileCompatible | undefined,
    done: RunCallback<TailTree extends undefined ? Node : TailTree>
  ): undefined

  /**
   * Run *transformers* on a syntax tree.
   *
   * > 👉 **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `run` performs the run phase, not other phases.
   *
   * @param tree
   *   Tree to transform and inspect.
   * @param file
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns
   *   A `Promise` rejected with a fatal error or resolved with the transformed
   *   tree.
   */
  run(
    tree: HeadTree extends undefined ? Node : HeadTree,
    file?: VFileCompatible | undefined
  ): Promise<TailTree extends undefined ? Node : TailTree>

  /**
   * Run *transformers* on a syntax tree.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > 👉 **Note**: `runSync` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `runSync` performs the run phase, not other phases.
   *
   * @param tree
   *   Tree to transform and inspect.
   * @param file
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns
   *   Transformed tree.
   */
  runSync(
    tree: HeadTree extends undefined ? Node : HeadTree,
    file?: VFileCompatible | undefined
  ): TailTree extends undefined ? Node : TailTree

  /**
   * Process the given file as configured on the processor.
   *
   * > 👉 **Note**: `process` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `process` performs the parse, run, and stringify phases.
   *
   * @param file
   *   File; any value accepted as `x` in `new VFile(x)`.
   * @param done
   *   Callback.
   * @returns
   *   Nothing.
   */
  process(
    file: VFileCompatible | undefined,
    done: ProcessCallback<VFileWithOutput<CompileResult>>
  ): undefined

  /**
   * Process the given file as configured on the processor.
   *
   * > 👉 **Note**: `process` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `process` performs the parse, run, and stringify phases.
   *
   * @param file
   *   File; any value accepted as `x` in `new VFile(x)`.
   * @returns
   *   `Promise` rejected with a fatal error or resolved with the processed
   *   file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > 👉 **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different result
   *   > values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@link CompileResultMap `CompileResultMap`}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  process(
    file?: VFileCompatible | undefined
  ): Promise<VFileWithOutput<CompileResult>>

  /**
   * Process the given file as configured on the processor.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > 👉 **Note**: `processSync` freezes the processor if not already *frozen*.
   *
   * > 👉 **Note**: `processSync` performs the parse, run, and stringify phases.
   *
   * @param file
   *   File; any value accepted as `x` in `new VFile(x)`.
   * @returns
   *   The processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > 👉 **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different result
   *   > values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@link CompileResultMap `CompileResultMap`}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  processSync(
    file?: VFileCompatible | undefined
  ): VFileWithOutput<CompileResult>

  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * @returns
   *   The key-value store.
   */
  data(): Record<string, unknown>

  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * > 👉 **Note**: setting information cannot occur on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * @param data
   *   Values to set.
   * @returns
   *   The processor that `data` is called on.
   */
  data(
    data: Record<string, unknown>
  ): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>

  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * @param key
   *   Key to get.
   * @returns
   *   The value at `key`.
   */
  data(key: string): unknown

  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * > 👉 **Note**: setting information cannot occur on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * @param key
   *   Key to set.
   * @param value
   *   Value to set.
   * @returns
   *   The processor that `data` is called on.
   */
  data(
    key: string,
    value: unknown
  ): Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>

  /**
   * Freeze a processor.
   *
   * Frozen processors are meant to be extended and not to be configured
   * directly.
   *
   * When a processor is frozen it cannot be unfrozen.
   * New processors working the same way can be created by calling the
   * processor.
   *
   * It’s possible to freeze processors explicitly by calling `.freeze()`.
   * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
   * `.stringify()`, `.process()`, or `.processSync()` are called.
   *
   *
   * @returns
   *   The processor that `freeze` was called on.
   */
  freeze(): FrozenProcessor<
    ParseTree,
    HeadTree,
    TailTree,
    CompileTree,
    CompileResult
  >
}

/**
 * **Plugins** configure the processors they are applied on in the following
 * ways:
 *
 * *   they change the processor, such as the parser, the compiler, or by
 *     configuring data
 * *   they specify how to handle trees and files
 *
 * Plugins are a concept.
 * They materialize as `Attacher`s.
 *
 * Attachers are materialized plugins.
 * They are functions that can receive options and configure the processor.
 *
 * Attachers change the processor, such as the parser, the compiler, by
 * configuring data, or by specifying how the tree and file are handled.
 *
 * > 👉 **Note**: attachers are called when the processor is *frozen*,
 * > not when they are applied.
 *
 * @typeParam Parameters
 *   Arguments passed to the plugin.
 * @typeParam Input
 *   Value that is expected as input.
 *
 *   *   If the plugin returns a {@link Transformer `Transformer`}, this
 *       should be the node it expects.
 *   *   If the plugin sets a {@link Parser `Parser`}, this should be
 *       `string`.
 *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be the
 *       node it expects.
 * @typeParam Output
 *   Value that is yielded as output.
 *
 *   *   If the plugin returns a {@link Transformer `Transformer`}, this
 *       should be the node that that yields.
 *   *   If the plugin sets a {@link Parser `Parser`}, this should be the
 *       node that it yields.
 *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be
 *       result it yields.
 * @this
 *   Processor the attacher is applied to.
 * @param parameters
 *   Arguments passed to the plugin.
 *
 *   Plugins typically receive one options object, but could receive other and
 *   more values.
 * @returns
 *   Optional transform.
 */
export type Plugin<
  Parameters extends unknown[] = [],
  Input extends Node | string | undefined = undefined,
  Output = Input
> = (
  this: Processor,
  ...parameters: Parameters
) => Input extends string
  ? // Parser.
    Output extends Node | undefined
    ? undefined | void
    : never
  : Output extends CompileResults
  ? // Compiler
    Input extends Node | undefined
    ? undefined | void
    : never
  :
      | Transformer<
          Input extends Node ? Input : Node,
          Output extends Node ? Output : Node
        >
      | undefined
      | void

/**
 * Presets are sharable configuration.
 *
 * They can contain plugins and settings.
 */
export type Preset = {
  /**
   * List of plugins and presets.
   */
  plugins?: PluggableList

  /**
   * Shared settings for parsers and compilers.
   */
  settings?: Record<string, unknown>
}

/**
 * Tuple of a plugin and its setting(s).
 * The first item is a plugin, the rest are its parameters.
 *
 * @typeParam Parameters
 *   Arguments passed to the plugin.
 * @typeParam Input
 *   Value that is expected as input.
 *
 *   *   If the plugin returns a {@link Transformer `Transformer`}, this
 *       should be the node it expects.
 *   *   If the plugin sets a {@link Parser `Parser`}, this should be
 *       `string`.
 *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be the
 *       node it expects.
 * @typeParam Output
 *   Value that is yielded as output.
 *
 *   *   If the plugin returns a {@link Transformer `Transformer`}, this
 *       should be the node that that yields.
 *   *   If the plugin sets a {@link Parser `Parser`}, this should be the
 *       node that it yields.
 *   *   If the plugin sets a {@link Compiler `Compiler`}, this should be
 *       result it yields.
 */
export type PluginTuple<
  Parameters extends unknown[] = [],
  Input extends Node | string | undefined = undefined,
  Output = undefined
> = [Plugin<Parameters, Input, Output>, ...Parameters]

/**
 * A union of the different ways to add plugins and settings.
 */
export type Pluggable =
  | Plugin<any[], any, any>
  | PluginTuple<any[], any, any>
  | Preset

/**
 * A list of plugins and presets.
 */
export type PluggableList = Pluggable[]

// To do: remove?
/**
 * Attacher.
 *
 * @deprecated
 *   Please use `Plugin`.
 */
export type Attacher<
  Parameters extends unknown[] = unknown[],
  Input extends Node | string = Node,
  Output extends CompileResults | Node = Input
> = Plugin<Parameters, Input, Output>

/**
 * Transformers handle syntax trees and files.
 *
 * They are functions that are called each time a syntax tree and file are
 * passed through the run phase.
 * When an error occurs in them (either because it’s thrown, returned,
 * rejected, or passed to `next`), the process stops.
 *
 * The run phase is handled by [`trough`][trough], see its documentation for
 * the exact semantics of these functions.
 *
 * [trough]: https://github.com/wooorm/trough#function-fninput-next
 *
 * @typeParam Input
 *   Node type that the transformer expects.
 * @typeParam Output
 *   Node type that the transformer yields.
 * @param tree
 *   Tree to handle.
 * @param file
 *   File to handle.
 * @param next
 *   Callback.
 * @returns
 *   If you accept `next`, nothing.
 *   Otherwise:
 *
 *   *   `Error` — fatal error to stop the process
 *   *   `Promise<undefined>` or `undefined` — the next transformer keeps using
 *       same tree
 *   *   `Promise<Node>` or `Node` — new, changed, tree
 */
export type Transformer<
  Input extends Node = Node,
  Output extends Node = Input
> = (
  tree: Input,
  file: VFile,
  next: TransformCallback<Output>
) =>
  | Promise<Output | undefined | void>
  | Promise<never> // For some reason this is needed separately.
  | Output
  | Error
  | undefined
  | void

/**
 * If the signature of a `transformer` accepts a third argument, the
 * transformer may perform asynchronous operations, and must call `next()`.
 *
 * @typeParam Tree
 *   Node type that the transformer yields.
 * @param error
 *   Fatal error to stop the process (optional).
 * @param tree
 *   New, changed, tree (optional).
 * @param file
 *   New, changed, file (optional).
 * @returns
 *   Nothing.
 */
export type TransformCallback<Output extends Node = Node> = (
  error?: Error | undefined,
  tree?: Output,
  file?: VFile | undefined
) => undefined

/**
 * A **parser** handles the parsing of text to a syntax tree.
 *
 * It is used in the parse phase and is called with a `string` and
 * {@link VFile `VFile`} of the document to parse.
 *
 * `Parser` can be a normal function, in which case it must return the syntax
 * tree representation of the given file ({@link Node `Node`}).
 *
 * `Parser` can also be a constructor function (a function with a `parse`
 * field in its `prototype`), in which case it is constructed with `new`.
 * Instances must have a `parse` method that is called without arguments and must
 * return a {@link Node `Node`}.
 *
 * @typeParam Tree
 *   The node that the parser yields.
 */
export type Parser<Tree extends Node = Node> =
  | ParserClass<Tree>
  | ParserFunction<Tree>

/**
 * A class to parse files.
 *
 * @typeParam Tree
 *   The node that the parser yields.
 */
export class ParserClass<Tree extends Node = Node> {
  prototype: {
    /**
     * Parse a file.
     *
     * @returns
     *   Parsed tree.
     */
    parse(): Tree
  }

  /**
   * Constructor.
   *
   * @param document
   *   Document to parse.
   * @param file
   *   File associated with `document`.
   * @returns
   *   Instance.
   */
  constructor(document: string, file: VFile)
}

/**
 * Regular function to parse a file.
 *
 * @typeParam Tree
 *   The node that the parser yields.
 * @param document
 *   Document to parse.
 * @param file
 *   File associated with `document`.
 * @returns
 *   Node representing the given file.
 */
export type ParserFunction<Tree extends Node = Node> = (
  document: string,
  file: VFile
) => Tree

/**
 * A **compiler** handles the compiling of a syntax tree to something else (in
 * most cases, text).
 *
 * It is used in the stringify phase and called with a {@link Node `Node`}
 * and {@link VFile `VFile`} representation of the document to compile.
 *
 * `Compiler` can be a normal function, in which case it should return the
 * textual representation of the given tree (`string`).
 *
 * `Compiler` can also be a constructor function (a function with a `compile`
 * field in its `prototype`), in which case it is constructed with `new`.
 * Instances must have a `compile` method that is called without arguments and
 * should return a `string`.
 *
 * > 👉 **Note**: unified typically compiles by serializing: most compilers
 * > return `string` (or `Uint8Array`).
 * > Some compilers, such as the one configured with
 * > [`rehype-react`][rehype-react], return other values (in this case, a
 * > React tree).
 * > If you’re using a compiler that doesn’t serialize, expect different result
 * > values.
 * >
 * > To register custom results in TypeScript, add them to
 * > {@link CompileResultMap `CompileResultMap`}.
 *
 * [rehype-react]: https://github.com/rehypejs/rehype-react
 *
 * @typeParam Tree
 *   The node that the compiler receives.
 * @typeParam Result
 *   The thing that the compiler yields.
 */
export type Compiler<Tree extends Node = Node, Result = unknown> =
  | CompilerClass<Tree, Result>
  | CompilerFunction<Tree, Result>

/**
 * A class to compile trees.
 *
 * @typeParam Tree
 *   The node that the compiler receives.
 * @typeParam Result
 *   The thing that the compiler yields.
 */
export class CompilerClass<Tree extends Node = Node, Result = unknown> {
  prototype: {
    /**
     * Compile a tree.
     *
     * @returns
     *   New content: compiled text (`string` or `Uint8Array`, for
     *   `file.value`) or something else (for `file.result`).
     */
    compile(): Result
  }

  /**
   * Constructor.
   *
   * @param tree
   *   Tree to compile.
   * @param file
   *   File associated with `tree`.
   * @returns
   *   Instance.
   */
  constructor(tree: Tree, file: VFile)
}

/**
 * Regular function to compile a tree.
 *
 * @typeParam Tree
 *   The node that the compiler receives.
 * @typeParam Result
 *   The thing that the compiler yields.
 * @param tree
 *   Tree to compile.
 * @param file
 *   File associated with `tree`.
 * @returns
 *   New content: compiled text (`string` or `Uint8Array`, for `file.value`) or
 *   something else (for `file.result`).
 */
export type CompilerFunction<
  Tree extends Node = Node,
  Result = CompileResults
> = (tree: Tree, file: VFile) => Result

/**
 * Callback called when transformers are done.
 *
 * Called with either an error or results.

 *
 * @typeParam Tree
 *   The tree that the callback receives.
 * @param error
 *   Fatal error.
 * @param tree
 *   Transformed tree.
 * @param file
 *   File.
 * @returns
 *   Nothing.
 */
export type RunCallback<Tree extends Node = Node> = (
  error?: Error | undefined,
  tree?: Tree | undefined,
  file?: VFile | undefined
) => undefined

/**
 * Callback called when the process is done.
 *
 * Called with either an error or a result.
 *
 * @typeParam File
 *   The file that the callback receives.
 * @param error
 *   Fatal error.
 * @param file
 *   Processed file.
 * @returns
 *   Nothing.
 */
export type ProcessCallback<File extends VFile = VFile> = (
  error?: Error | undefined,
  file?: File | undefined
) => undefined

/**
 * A frozen processor.
 */
export function unified(): Processor
