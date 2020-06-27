// TypeScript Version: 4.0

import {Node} from 'unist'
import {VFile, VFileCompatible} from 'vfile'

declare namespace unified {
  /**
   * Processor allows plugins, parsers, and compilers to be chained together to transform content.
   *
   * @typeParam P Processor settings. Useful when packaging unified with a preset parser and compiler.
   */
  interface Processor<P = Settings> {
    /**
     * Clone current processor
     *
     * @returns New unfrozen processor which is configured to function the same as its ancestor.
     * But when the descendant processor is configured in the future it does not affect the ancestral processor.
     */
    (): Processor<P>

    /**
     * Configure the processor to use a plugin and optionally configure that plugin with options.
     *
     * @param plugin unified plugin
     * @param settings Configuration for plugin
     * @typeParam S Plugin settings
     * @returns The processor on which use is invoked
     */
    use<S extends any[] = [Settings?]>(
      plugin: Plugin<P, S>,
      ...settings: S
    ): Processor<P>

    /**
     * Configure the processor with a preset to use
     *
     * @param preset `Object` with an plugins (set to list), and/or an optional settings object
     * @typeParam S1 Plugin settings
     * @typeParam S20 Plugin settings
     */
    use<
      S1 extends any[] = [Settings?],
      S2 extends any[] = [Settings?],
      S3 extends any[] = [Settings?],
      S4 extends any[] = [Settings?],
      S5 extends any[] = [Settings?],
      S6 extends any[] = [Settings?],
      S7 extends any[] = [Settings?],
      S8 extends any[] = [Settings?],
      S9 extends any[] = [Settings?],
      S10 extends any[] = [Settings?],
      S11 extends any[] = [Settings?],
      S12 extends any[] = [Settings?],
      S13 extends any[] = [Settings?],
      S14 extends any[] = [Settings?],
      S15 extends any[] = [Settings?],
      S16 extends any[] = [Settings?],
      S17 extends any[] = [Settings?],
      S18 extends any[] = [Settings?],
      S19 extends any[] = [Settings?],
      S20 extends any[] = [Settings?]
    >(
      preset: Preset<
        P,
        S1,
        S2,
        S3,
        S4,
        S5,
        S6,
        S7,
        S8,
        S9,
        S10,
        S11,
        S12,
        S13,
        S14,
        S15,
        S16,
        S17,
        S18,
        S19,
        S20
      >
    ): Processor<P>

    /**
     * Configure using a tuple of plugin and setting(s)
     *
     * @param pluginTuple pairs, plugin and settings in an array
     * @typeParam S Plugin settings
     */
    use<S extends any[] = [Settings?]>(
      pluginTuple: PluginTuple<P, S>
    ): Processor<P>

    /**
     * A list of plugins and presets to be applied to processor
     *
     * @param list List of plugins, presets, and pairs
     * @typeParam S1 Plugin settings
     * @typeParam S20 Plugin settings
     */
    use<
      S1 extends any[] = [Settings?],
      S2 extends any[] = [Settings?],
      S3 extends any[] = [Settings?],
      S4 extends any[] = [Settings?],
      S5 extends any[] = [Settings?],
      S6 extends any[] = [Settings?],
      S7 extends any[] = [Settings?],
      S8 extends any[] = [Settings?],
      S9 extends any[] = [Settings?],
      S10 extends any[] = [Settings?],
      S11 extends any[] = [Settings?],
      S12 extends any[] = [Settings?],
      S13 extends any[] = [Settings?],
      S14 extends any[] = [Settings?],
      S15 extends any[] = [Settings?],
      S16 extends any[] = [Settings?],
      S17 extends any[] = [Settings?],
      S18 extends any[] = [Settings?],
      S19 extends any[] = [Settings?],
      S20 extends any[] = [Settings?]
    >(
      list: PluggableList<
        P,
        S1,
        S2,
        S3,
        S4,
        S5,
        S6,
        S7,
        S8,
        S9,
        S10,
        S11,
        S12,
        S13,
        S14,
        S15,
        S16,
        S17,
        S18,
        S19,
        S20
      >
    ): Processor<P>

    /**
     * Configuration passed to a frozen processor
     *
     * @param processorSettings Settings passed to processor
     */
    use(processorSettings: ProcessorSettings<P>): Processor<P>

    /**
     * Parse text to a syntax tree.
     *
     * @param file VFile or anything which can be given to vfile()
     * @returns Syntax tree representation of input.
     */
    parse(file: VFileCompatible): Node

    /**
     * Function handling the parsing of text to a syntax tree.
     * Used in the parse phase in the process and invoked with a `string` and `VFile` representation of the document to parse.
     *
     * `Parser` can be a normal function in which case it must return a `Node`: the syntax tree representation of the given file.
     *
     * `Parser` can also be a constructor function (a function with keys in its `prototype`) in which case it’s invoked with `new`.
     * Instances must have a parse method which is invoked without arguments and must return a `Node`.
     */
    Parser: ParserConstructor | ParserFunction

    /**
     * Compile a syntax tree to text.
     *
     * @param node unist node
     * @param file `VFile` or anything which can be given to `vfile()`
     * @returns String representation of the syntax tree file
     */
    stringify(node: Node, file?: VFileCompatible): string

    /**
     * Function handling the compilation of syntax tree to a text.
     * Used in the stringify phase in the process and invoked with a `Node` and `VFile` representation of the document to stringify.
     *
     * `Compiler` can be a normal function in which case it must return a `string`: the text representation of the given syntax tree.
     *
     * `Compiler` can also be a constructor function (a function with keys in its `prototype`) in which case it’s invoked with `new`.
     * Instances must have a `compile` method which is invoked without arguments and must return a `string`.
     */
    Compiler: CompilerConstructor | CompilerFunction

    /**
     * Transform a syntax tree by applying plugins to it.
     *
     * @param node Node to transform
     * @returns `Promise` if `done` is not given. Rejected with an error, or resolved with the resulting syntax tree.
     */
    run(node: Node): Promise<Node>

    /**
     * Transform a syntax tree by applying plugins to it.
     *
     * @param node Node to transform
     * @param file `VFile` or anything which can be given to `vfile()`
     * @returns `Promise` if `done` is not given. Rejected with an error, or resolved with the resulting syntax tree.
     */
    run(node: Node, file: VFileCompatible): Promise<Node>

    /**
     * Transform a syntax tree by applying plugins to it.
     *
     * @param node Node to transform
     * @param done Invoked when transformation is complete.
     */
    run(node: Node, done: RunCallback): void

    /**
     * Transform a syntax tree by applying plugins to it.
     *
     * @param node Node to transform
     * @param file `VFile` or anything which can be given to `vfile()`
     * @param done Invoked when transformation is complete.
     */
    run(node: Node, file: VFileCompatible, done: RunCallback): void

    /**
     * Transform a syntax tree by applying plugins to it.
     *
     * If asynchronous plugins are configured an error is thrown.
     *
     * @param node Node to transform
     * @param file `VFile` or anything which can be given to `vfile()`
     * @returns The given syntax tree.
     */
    runSync(node: Node, file?: VFileCompatible): Node

    /**
     * Process the given representation of a file as configured on the processor. The process invokes `parse`, `run`, and `stringify` internally.
     * @param file `VFile` or anything which can be given to `vfile()`
     * @returns `Promise` if `done` is not given.
     * Rejected with an error or resolved with the resulting file.
     */
    process(file: VFileCompatible): Promise<VFile>

    /**
     * Process the given representation of a file as configured on the processor. The process invokes `parse`, `run`, and `stringify` internally.
     * @param file `VFile` or anything which can be given to `vfile()`
     * @param done Invoked when the process is complete. Invoked with a fatal error, if any, and the VFile.
     */
    process(file: VFileCompatible, done: ProcessCallback): void

    /**
     * Process the given representation of a file as configured on the processor. The process invokes `parse`, `run`, and `stringify` internally.
     *
     * If asynchronous plugins are configured an error is thrown.
     *
     * @param file `VFile` or anything which can be given to `vfile()`
     * @returns Virtual file with modified contents.
     */
    processSync(file: VFileCompatible): VFile

    /**
     * Get or set information in an in-memory key-value store accessible to all phases of the process.
     * An example is a list of HTML elements which are self-closing, which is needed when parsing, transforming, and compiling HTML.
     *
     * @returns key-value store object
     */
    data(): {[key: string]: unknown}

    /**
     * @param key Identifier
     * @returns If getting, the value at key
     */
    data(key: string): unknown

    /**
     * @param value Value to set. Omit if getting key
     * @returns If setting, the processor on which data is invoked
     */
    data(key: string, value: any): Processor<P>

    /**
     * Freeze a processor. Frozen processors are meant to be extended and not to be configured or processed directly.
     *
     * Once a processor is frozen it cannot be unfrozen. New processors functioning just like it can be created by invoking the processor.
     *
     * It’s possible to freeze processors explicitly, by calling `.freeze()`, but `.parse()`, `.run()`, `.stringify()`, and `.process()` call `.freeze()` to freeze a processor too.
     *
     * @returns The processor on which freeze is invoked.
     */
    freeze(): Processor<P>
  }

  /**
   * A Plugin (Attacher) is the thing passed to `use`.
   * It configures the processor and in turn can receive options.
   *
   * Attachers can configure processors, such as by interacting with parsers and compilers, linking them to other processors, or by specifying how the syntax tree is handled.
   *
   * @param settings Configuration
   * @typeParam P Processor settings
   * @typeParam S Plugin settings
   * @returns Optional Transformer.
   */
  type Plugin<P = Settings, S extends any[] = [Settings?]> = Attacher<P, S>

  /**
   * Configuration passed to a Plugin or Processor
   */
  interface Settings {
    [key: string]: unknown
  }

  /**
   * Presets provide a potentially sharable way to configure processors.
   * They can contain multiple plugins and optionally settings as well.
   *
   * @typeParam P Processor settings
   * @typeParam S1 Plugin settings
   * @typeParam S20 Plugin settings
   */
  interface Preset<
    P = Settings,
    S1 extends any[] = [Settings?],
    S2 extends any[] = [Settings?],
    S3 extends any[] = [Settings?],
    S4 extends any[] = [Settings?],
    S5 extends any[] = [Settings?],
    S6 extends any[] = [Settings?],
    S7 extends any[] = [Settings?],
    S8 extends any[] = [Settings?],
    S9 extends any[] = [Settings?],
    S10 extends any[] = [Settings?],
    S11 extends any[] = [Settings?],
    S12 extends any[] = [Settings?],
    S13 extends any[] = [Settings?],
    S14 extends any[] = [Settings?],
    S15 extends any[] = [Settings?],
    S16 extends any[] = [Settings?],
    S17 extends any[] = [Settings?],
    S18 extends any[] = [Settings?],
    S19 extends any[] = [Settings?],
    S20 extends any[] = [Settings?]
  > {
    plugins: PluggableList<
      P,
      S1,
      S2,
      S3,
      S4,
      S5,
      S6,
      S7,
      S8,
      S9,
      S10,
      S11,
      S12,
      S13,
      S14,
      S15,
      S16,
      S17,
      S18,
      S19,
      S20
    >
    settings?: Settings
  }

  /**
   * Settings can be passed directly to the processor
   *
   * @typeParam P Settings applied to a processor. Useful when packaging unified with a preset parser and compiler.
   */
  interface ProcessorSettings<P = Settings> {
    settings: P
  }

  /**
   * A pairing of a plugin with its settings
   *
   * @typeParam P Processor settings
   * @typeParam S Plugin settings
   */
  type PluginTuple<P = Settings, S extends any[] = [Settings?]> = [
    Plugin<P, S>,
    ...S
  ]

  /**
   * A union of the different ways to add plugins to unified
   *
   * @typeParam P Processor settings
   * @typeParam S1 Plugin settings
   * @typeParam S20 Plugin settings
   */
  type Pluggable<
    P = Settings,
    S1 extends any[] = [Settings?],
    S2 extends any[] = [Settings?],
    S3 extends any[] = [Settings?],
    S4 extends any[] = [Settings?],
    S5 extends any[] = [Settings?],
    S6 extends any[] = [Settings?],
    S7 extends any[] = [Settings?],
    S8 extends any[] = [Settings?],
    S9 extends any[] = [Settings?],
    S10 extends any[] = [Settings?],
    S11 extends any[] = [Settings?],
    S12 extends any[] = [Settings?],
    S13 extends any[] = [Settings?],
    S14 extends any[] = [Settings?],
    S15 extends any[] = [Settings?],
    S16 extends any[] = [Settings?],
    S17 extends any[] = [Settings?],
    S18 extends any[] = [Settings?],
    S19 extends any[] = [Settings?],
    S20 extends any[] = [Settings?]
  > =
    | Plugin<P, S1>
    | PluginTuple<P, S1>
    | Preset<
        P,
        S1,
        S2,
        S3,
        S4,
        S5,
        S6,
        S7,
        S8,
        S9,
        S10,
        S11,
        S12,
        S13,
        S14,
        S15,
        S16,
        S17,
        S18,
        S19,
        S20
      >

  /**
   * A list of plugins and presets
   *
   * @typeParam P Processor settings
   * @typeParam S1 Plugin settings
   * @typeParam S20 Plugin settings
   */
  type PluggableList<
    P = Settings,
    S1 extends any[] = [Settings?],
    S2 extends any[] = [Settings?],
    S3 extends any[] = [Settings?],
    S4 extends any[] = [Settings?],
    S5 extends any[] = [Settings?],
    S6 extends any[] = [Settings?],
    S7 extends any[] = [Settings?],
    S8 extends any[] = [Settings?],
    S9 extends any[] = [Settings?],
    S10 extends any[] = [Settings?],
    S11 extends any[] = [Settings?],
    S12 extends any[] = [Settings?],
    S13 extends any[] = [Settings?],
    S14 extends any[] = [Settings?],
    S15 extends any[] = [Settings?],
    S16 extends any[] = [Settings?],
    S17 extends any[] = [Settings?],
    S18 extends any[] = [Settings?],
    S19 extends any[] = [Settings?],
    S20 extends any[] = [Settings?]
  > = [
    Pluggable<P, S1>?,
    Pluggable<P, S2>?,
    Pluggable<P, S3>?,
    Pluggable<P, S4>?,
    Pluggable<P, S5>?,
    Pluggable<P, S6>?,
    Pluggable<P, S7>?,
    Pluggable<P, S8>?,
    Pluggable<P, S9>?,
    Pluggable<P, S10>?,
    Pluggable<P, S11>?,
    Pluggable<P, S12>?,
    Pluggable<P, S13>?,
    Pluggable<P, S14>?,
    Pluggable<P, S15>?,
    Pluggable<P, S16>?,
    Pluggable<P, S17>?,
    Pluggable<P, S18>?,
    Pluggable<P, S19>?,
    Pluggable<P, S20>?,
    ...Array<Pluggable<P, any[]>>
  ]

  /**
   * An attacher is the thing passed to `use`.
   * It configures the processor and in turn can receive options.
   *
   * Attachers can configure processors, such as by interacting with parsers and compilers, linking them to other processors, or by specifying how the syntax tree is handled.
   *
   * @param settings Configuration
   * @typeParam P Processor settings
   * @typeParam S1 Plugin settings
   * @typeParam S20 Plugin settings
   * @returns Optional Transformer.
   */
  type Attacher<P = Settings, S extends any[] = [Settings?]> = (
    this: Processor<P>,
    ...settings: S
  ) => Transformer | void

  /**
   * Transformers modify the syntax tree or metadata of a file. A transformer is a function which is invoked each time a file is passed through the transform phase.
   * If an error occurs (either because it’s thrown, returned, rejected, or passed to `next`), the process stops.
   *
   * The transformation process in unified is handled by `trough`, see it’s documentation for the exact semantics of transformers.
   *
   * @param node Node or tree to be transformed
   * @param file File associated with node or tree
   * @param next If the signature of a transformer includes `next` (third argument), the function may finish asynchronous, and must invoke `next()`.
   * @returns
   * - `void` — If nothing is returned, the next transformer keeps using same tree.
   * - `Error` — Can be returned to stop the process
   * - `Node` — Can be returned and results in further transformations and `stringify`s to be performed on the new tree
   * - `Promise` — If a promise is returned, the function is asynchronous, and must be resolved (optionally with a `Node`) or rejected (optionally with an `Error`)
   */
  type Transformer = (
    node: Node,
    file: VFile,
    next?: (
      error: Error | null,
      tree: Node,
      file: VFile
    ) => Record<string, unknown>
  ) => Error | Node | Promise<Node> | void | Promise<void>

  /**
   * Transform file contents into an AST
   */
  interface Parser {
    /**
     * Transform file contents into an AST
     *
     * @returns Parsed AST node/tree
     */
    parse(): Node
  }

  /**
   * A constructor function (a function with keys in its `prototype`) or class that implements a
   * `parse` method.
   */
  type ParserConstructor = new (text: string, file: VFile) => Parser

  /**
   * Transform file contents into an AST
   *
   * @param text Text to transform into AST node(s)
   * @param file File associated with text
   * @returns Parsed AST node/tree
   */
  type ParserFunction = (text: string, file: VFile) => Node

  /**
   * Transform an AST node/tree into text
   */
  interface Compiler {
    /**
     * Transform an AST node/tree into text
     *
     * @returns Compiled text
     */
    compile(): string
  }

  /**
   * A constructor function (a function with keys in its `prototype`) or class that implements a
   * `compile` method.
   */
  type CompilerConstructor = new (node: Node, file: VFile) => Compiler

  /**
   * Transform an AST node/tree into text
   *
   * @param node Node/tree to be stringified
   * @param file File associated with node
   * @returns Compiled text
   */
  type CompilerFunction = (node: Node, file: VFile) => string

  /**
   * Access results from transforms
   *
   * @param error Error if any occurred
   * @param node Transformed AST tree/node
   * @param vfile File associated with node
   */
  type RunCallback = (error: Error | null, node: Node, file: VFile) => void

  /**
   * Access results from transforms
   *
   * @param error Error if any occurred
   * @param vfile File with updated content
   */
  type ProcessCallback = (error: Error | null, file: VFile) => void
}

/**
 * Unified processor allows plugins, parsers, and compilers to be chained together to transform content.
 *
 * @typeParam P Processor settings. Useful when packaging unified with a preset parser and compiler.
 */
declare function unified<P = unified.Settings>(): unified.Processor<P>
export = unified
