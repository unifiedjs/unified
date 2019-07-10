// TypeScript Version: 3.0

import {Node} from 'unist'
import {VFile, VFileContents, VFileOptions} from 'vfile'
import vfile = require('vfile')

declare namespace unified {
  interface Processor {
    /**
     * @returns New unfrozen processor which is configured to function the same as its ancestor. But when the descendant processor is configured in the future it does not affect the ancestral processor.
     */
    (): Processor

    /**
     * Configure the processor to use a plugin and optionally configure that plugin with options.
     *
     * @param plugin unified plugin
     * @param options Configuration for plugin
     * @param extraOptions Additional configuration for plugin
     * @returns The processor on which use is invoked
     */
    use<T = Settings, S = undefined>(
      plugin: Plugin<T, S>,
      options?: T,
      extraOptions?: S
    ): Processor

    /**
     * @param preset `Object` with an optional plugins (set to list), and/or an optional settings object
     */
    use(preset: Preset): Processor

    /**
     * @param pluginTuple pairs, plugin and options in an array
     */
    use<T = Settings>(pluginTuple: PluginTuple<T>): Processor

    /**
     * @param pluginTriple plugin, options, and extraOptions in an array
     */
    use<T = Settings, S = undefined>(
      pluginTriple: PluginTriple<T, S>
    ): Processor

    /**
     * @param list List of plugins, presets, and pairs
     */
    use(list: PluggableList): Processor

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
     * `Parser` can also be a constructor function (a function with keys in its `prototype`) in which case it’s invoked with `new`. Instances must have a parse method which is invoked without arguments and must return a `Node`.
     */
    Parser: ParserFunction | typeof Parser

    /**
     * Compile a syntax tree to text.
     *
     * @param node
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
    Compiler: CompilerFunction | typeof Compiler

    /**
     * Transform a syntax tree by applying plugins to it.
     *
     * @param node
     * @param file `VFile` or anything which can be given to `vfile()`
     * @param done Invoked when transformation is complete.
     * Either invoked with an error or a syntax tree and a file.
     * @returns `Promise` if `done` is not given. Rejected with an error, or resolved with the resulting syntax tree.
     */
    run(node: Node): Promise<Node>
    run(node: Node, file: VFileCompatible): Promise<Node>
    run(node: Node, done: RunCallback): void
    run(node: Node, file: VFileCompatible, done: RunCallback): void

    /**
     * Transform a syntax tree by applying plugins to it.
     *
     * If asynchronous plugins are configured an error is thrown.
     *
     * @param node
     * @param file `VFile` or anything which can be given to `vfile()`
     * @returns The given syntax tree.
     */
    runSync(node: Node, file?: VFileCompatible): Node

    /**
     * Process the given representation of a file as configured on the processor. The process invokes `parse`, `run`, and `stringify` internally.
     * @param file
     * @param done Invoked when the process is complete. Invoked with a fatal error, if any, and the VFile.
     * @returns `Promise` if `done` is not given.
     * Rejected with an error or resolved with the resulting file.
     */
    process(file: VFileCompatible): Promise<VFile>
    process(file: VFileCompatible, done: ProcessCallback): void

    /**
     * Process the given representation of a file as configured on the processor. The process invokes `parse`, `run`, and `stringify` internally.
     *
     * If asynchronous plugins are configured an error is thrown.
     *
     * @param file
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
    data(key: string, value: any): Processor

    /**
     * Freeze a processor. Frozen processors are meant to be extended and not to be configured or processed directly.
     *
     * Once a processor is frozen it cannot be unfrozen. New processors functioning just like it can be created by invoking the processor.
     *
     * It’s possible to freeze processors explicitly, by calling `.freeze()`, but `.parse()`, `.run()`, `.stringify()`, and `.process()` call `.freeze()` to freeze a processor too.
     *
     * @returns The processor on which freeze is invoked.
     */
    freeze(): Processor
  }

  type Plugin<T = Settings, S = undefined> = Attacher<T, S>
  type Settings = {
    [key: string]: unknown
  }
  /**
   * Presets provide a potentially sharable way to configure processors.
   * They can contain multiple plugins and optionally settings as well.
   */
  interface Preset {
    plugins?: PluggableList
    settings?: Settings
  }
  type PluginTuple<T = Settings> = [Plugin<T>, T]
  type PluginTriple<T = Settings, S = undefined> = [Plugin<T, S>, T, S]
  type Pluggable<T = Settings, S = undefined> =
    | Plugin<T>
    | Preset
    | PluginTuple<T>
    | PluginTriple<T, S>
  type PluggableList = Array<Pluggable<any, any>>

  /**
   * An attacher is the thing passed to `use`.
   * It configures the processor and in turn can receive options.
   *
   * Attachers can configure processors, such as by interacting with parsers and compilers, linking them to other processors, or by specifying how the syntax tree is handled.
   *
   * @this Processor context object is set to the invoked on processor.
   * @param options Configuration
   * @param extraOptions Secondary configuration
   * @returns Optional.
   */
  interface Attacher<T = Settings, S = undefined> {
    (this: Processor, options?: T, extraOptions?: S): Transformer | void
  }

  /**
   * Transformers modify the syntax tree or metadata of a file. A transformer is a function which is invoked each time a file is passed through the transform phase.
   * If an error occurs (either because it’s thrown, returned, rejected, or passed to `next`), the process stops.
   *
   * The transformation process in unified is handled by `trough`, see it’s documentation for the exact semantics of transformers.
   *
   * @param node
   * @param file
   * @param next If the signature of a transformer includes `next` (third argument), the function may finish asynchronous, and must invoke `next()`.
   * @returns
   * - `Error` — Can be returned to stop the process
   * - `Node` — Can be returned and results in further transformations and `stringify`s to be performed on the new tree
   * - `Promise` — If a promise is returned, the function is asynchronous, and must be resolved (optionally with a `Node`) or rejected (optionally with an `Error`)
   */
  interface Transformer {
    (
      node: Node,
      file: VFileCompatible,
      next?: (error: Error | null, tree: Node, file: VFile) => {}
    ): Error | Node | Promise<Node>
  }

  class Parser {
    parse(file: VFileCompatible): Node
  }

  type ParserFunction = (file: VFileCompatible) => Node

  class Compiler {
    compile(node: Node, file?: VFileCompatible): string
  }
  type CompilerFunction = (node: Node, file?: VFileCompatible) => string

  type RunCallback = (error: Error | null, node: Node, file: VFile) => void

  type ProcessCallback = (error: Error | null, file: VFile) => void

  type VFileCompatible = VFile | VFileOptions | VFileContents
}

/**
 * Object describing how to process text.
 */
declare function unified(): unified.Processor
export = unified
