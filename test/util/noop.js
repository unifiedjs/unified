/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Test suite for `unified`.
 */

'use strict';

/* Expose. */
module.exports = exports = noop;
exports.Parser = Parser;
exports.Compiler = Compiler;

function noop() {}
function Compiler() {}
function Parser() {}

Parser.prototype.parse = noop;
Compiler.prototype.compile = noop;

/* Coverage: */

/* eslint-disable no-new */
noop();
new Parser();
new Compiler();
/* eslint-enable no-new */
