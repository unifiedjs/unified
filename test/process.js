'use strict'

var test = require('tape')
var vfile = require('vfile')
var simple = require('./util/simple')
var noop = require('./util/noop')
var unified = require('..')

test('process(file, done)', function (t) {
  var givenFile = vfile('alpha')
  var givenNode = {type: 'bravo'}

  t.plan(11)

  t.throws(
    function () {
      unified().process()
    },
    /Cannot `process` without `Parser`/,
    'should throw without `Parser`'
  )

  t.throws(
    function () {
      var processor = unified()
      processor.Parser = noop.Parser
      processor.process()
    },
    /Cannot `process` without `Compiler`/,
    'should throw without `Compiler`'
  )

  unified()
    .use(function () {
      this.Parser = Parser
      Parser.prototype.parse = parse

      function Parser(doc, file) {
        t.equal(typeof doc, 'string', 'should pass `doc` to `Parser`')
        t.equal(file, givenFile, 'should pass `file` to `Parser`')
      }

      function parse() {
        return givenNode
      }
    })
    .use(function () {
      return transformer
      function transformer(tree, file) {
        t.equal(tree, givenNode, 'should pass `tree` to transformers')
        t.equal(file, givenFile, 'should pass `file` to transformers')
      }
    })
    .use(function () {
      this.Compiler = Compiler
      Compiler.prototype.compile = compile

      function Compiler(tree, file) {
        t.equal(tree, givenNode, 'should pass `tree` to `Compiler`')
        t.equal(file, givenFile, 'should pass `file` to `Compiler`')
      }

      function compile() {
        return 'charlie'
      }
    })
    .process(givenFile, function (err, file) {
      t.error(err, 'shouldn’t fail')

      t.equal(
        file.toString(),
        'charlie',
        'should store the result of `compile()` on `file`'
      )
    })

  t.throws(function () {
    unified().use(plugin).process(givenFile, cb)

    function cb() {
      throw new Error('Alfred')
    }

    function plugin() {
      this.Parser = simple.Parser
      this.Compiler = simple.Compiler
    }
  }, /^Error: Alfred$/)
})

test('process(file)', function (t) {
  var givenFile = vfile('alpha')
  var givenNode = {type: 'bravo'}

  t.plan(7)

  unified()
    .use(function () {
      this.Parser = Parser
      Parser.prototype.parse = parse

      function Parser(doc, file) {
        t.equal(typeof doc, 'string', 'should pass `doc` to `Parser`')
        t.equal(file, givenFile, 'should pass `file` to `Parser`')
      }

      function parse() {
        return givenNode
      }
    })
    .use(function () {
      return transformer
      function transformer(tree, file) {
        t.equal(tree, givenNode, 'should pass `tree` to transformers')
        t.equal(file, givenFile, 'should pass `file` to transformers')
      }
    })
    .use(function () {
      this.Compiler = Compiler
      Compiler.prototype.compile = compile

      function Compiler(tree, file) {
        t.equal(tree, givenNode, 'should pass `tree` to `Compiler`')
        t.equal(file, givenFile, 'should pass `file` to `Compiler`')
      }

      function compile() {
        return 'charlie'
      }
    })
    .process(givenFile)
    .then(
      function (file) {
        t.equal(file.toString(), 'charlie', 'should resolve the file')
      },
      function () {
        t.fail('should resolve, not reject, the file')
      }
    )
})

test('processSync(file)', function (t) {
  t.plan(4)

  t.throws(
    function () {
      unified().processSync()
    },
    /Cannot `processSync` without `Parser`/,
    'should throw without `Parser`'
  )

  t.throws(
    function () {
      var processor = unified()
      processor.Parser = noop.Parser
      processor.processSync()
    },
    /Cannot `processSync` without `Compiler`/,
    'should throw without `Compiler`'
  )

  t.throws(
    function () {
      unified().use(parse).use(plugin).use(compile).processSync('delta')

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
    },
    /Error: bravo/,
    'should throw error from `processSync`'
  )

  t.equal(
    unified()
      .use(function () {
        this.Parser = simple.Parser
      })
      .use(function () {
        return transformer
        function transformer(node) {
          node.value = 'alpha'
        }
      })
      .use(function () {
        this.Compiler = simple.Compiler
      })
      .processSync('delta')
      .toString(),
    'alpha',
    'should pass the result file'
  )
})
