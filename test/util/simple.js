'use strict'

exports.Parser = Parser
exports.Compiler = Compiler

Compiler.prototype.compile = compile
Parser.prototype.parse = parse

function Compiler(node) {
  this.node = node
}

function compile() {
  return this.node.value
}

function Parser(file) {
  this.value = file.toString()
}

function parse() {
  return {type: 'text', value: this.value}
}
