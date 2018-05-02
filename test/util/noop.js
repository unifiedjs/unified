'use strict'

exports = noop
module.exports = exports
exports.Parser = Parser
exports.Compiler = Compiler

function noop() {}
function Compiler() {}
function Parser() {}

Parser.prototype.parse = noop
Compiler.prototype.compile = noop

/* Coverage: */

/* eslint-disable no-new */
noop()
new Parser()
new Compiler()
/* eslint-enable no-new */
