/**
 * @import {Literal, Node} from 'unist'
 */

// Make references to the above types visible in VS Code.
''

/**
 * @param {string} value
 * @returns {Literal}
 */
export function simpleParser(value) {
  return /** @type {Literal} */ ({type: 'text', value})
}

/**
 * @param {Node} node
 * @returns {string}
 */
export function simpleCompiler(node) {
  return 'value' in node && typeof node.value === 'string' ? node.value : ''
}
