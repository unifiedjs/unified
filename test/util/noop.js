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

// Coverage:
noop()
new Parser() // eslint-disable-line no-new
new Compiler() // eslint-disable-line no-new
