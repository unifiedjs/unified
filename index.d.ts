import type {VFileValue} from 'vfile'
import type {CompileResults} from './lib/index.js'

export type {
  // `CompileResultMap` is typed and exposed below.
  CompileResults,
  Compiler,
  CompilerClass,
  CompilerFunction,
  Pluggable,
  PluggableList,
  Plugin,
  // To do: remove next major.
  Plugin as Attacher,
  PluginTuple,
  Parser,
  ParserClass,
  ParserFunction,
  Preset,
  ProcessCallback,
  Processor,
  RunCallback,
  TransformCallback,
  Transformer
} from './lib/index.js'

export {unified} from './lib/index.js'

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
export interface CompileResultMap {
  // Note: if `Value` from `VFile` is changed, this should too.
  Uint8Array: Uint8Array
  string: string
  // Empties.
  null: null
}
