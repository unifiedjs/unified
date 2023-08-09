/**
 * @typedef {import('unist').Literal} Literal
 * @typedef {import('../../index.js').Parser} Parser
 * @typedef {import('../../index.js').Compiler} Compiler
 */

/** @type {Parser} */
export class SimpleParser {
  /** @param {string} doc */
  constructor(doc) {
    /** @type {string} */
    this.value = doc
  }

  /** @returns {Literal} */
  parse() {
    return {type: 'text', value: this.value}
  }
}

/** @type {Compiler} */
export class SimpleCompiler {
  /** @param {Literal} node */
  constructor(node) {
    /** @type {Literal} */
    this.node = node
  }

  compile() {
    return this.node.value
  }
}
