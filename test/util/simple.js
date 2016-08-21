/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Test suite for `unified`.
 */

'use strict';

/* Expose. */
exports.Parser = Parser;
exports.Compiler = Compiler;

Compiler.prototype.compile = compile;
Parser.prototype.parse = parse;

/* Simple Compiler. */
function Compiler() {}

function compile(node) {
  return node.value;
}

/* Simple Parser. */
function Parser(file) {
  this.value = file.toString();
}

function parse() {
  return {type: 'text', value: this.value};
}
