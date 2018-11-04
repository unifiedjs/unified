'use strict'

var test = require('tape')
var simple = require('./util/simple')
var noop = require('./util/noop')
var unified = require('..')

test('templateTag`string`', function(t) {
  var n = {type: 'bravo'}

  t.plan(7)

  var tag = unified()
    .use(function() {
      this.Parser = Parser
      Parser.prototype.parse = parse

      function Parser(doc, file) {
        t.equal(typeof doc, 'string', 'should pass `doc` to `Parser`')
        t.equal(file.toString(), 'alpha', 'should pass file to `Parser`')
      }

      function parse() {
        return n
      }
    })
    .use(function() {
      return transformer
      function transformer(tree, file) {
        t.equal(tree, n, 'should pass `tree` to transformers')
        t.equal(file.toString(), 'alpha', 'should pass file to transformers')
      }
    })
    .use(function() {
      this.Compiler = Compiler
      Compiler.prototype.compile = compile

      function Compiler(tree, file) {
        t.equal(tree, n, 'should pass `tree` to `Compiler`')
        t.equal(file.toString(), 'alpha', 'should pass file to `Compiler`')
      }

      function compile() {
        return 'charlie'
      }
    }).templateTag

  tag`alpha`.then(
    function(file) {
      t.equal(file.toString(), 'charlie', 'should resolve the file')
    },
    function() {
      t.fail('should resolve, not reject, the file')
    }
  )
})

test('templateTagSync`string`', function(t) {
  t.plan(4)

  t.throws(
    function() {
      return unified().templateTagSync``
    },
    /Cannot `processSync` without `Parser`/,
    'should throw without `Parser`'
  )

  t.throws(
    function() {
      var p = unified()
      p.Parser = noop.Parser
      return p.templateTagSync``
    },
    /Cannot `processSync` without `Compiler`/,
    'should throw without `Compiler`'
  )

  t.throws(
    function() {
      var tag = unified()
        .use(parse)
        .use(plugin)
        .use(compile).templateTagSync

      function parse() {
        this.Parser = simple.Parser
      }
      function compile() {
        this.Compiler = noop.Compiler
      }
      function plugin() {
        return transformer
      }
      function transformer() {
        return new Error('bravo')
      }

      return tag`delta`
    },
    /Error: bravo/,
    'should throw error from `templateTagSync`'
  )

  t.equal(
    unified()
      .use(function() {
        this.Parser = simple.Parser
      })
      .use(function() {
        return transformer
        function transformer(node) {
          node.value = 'alpha'
        }
      })
      .use(function() {
        this.Compiler = simple.Compiler
      }).templateTagSync`delta`.toString(),
    'alpha',
    'should pass the result file'
  )
})
