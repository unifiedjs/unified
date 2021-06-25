import test from 'tape'
import {VFile} from 'vfile'
import {NoopCompiler, NoopParser} from './util/noop.js'
import {SimpleCompiler, SimpleParser} from './util/simple.js'
import {unified} from '../index.js'

test('process(file, done)', function (t) {
  var givenFile = new VFile('alpha')
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
      processor.Parser = NoopParser
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
    .process(givenFile, function (error, file) {
      t.error(error, 'shouldn’t fail')

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
      this.Parser = SimpleParser
      this.Compiler = SimpleCompiler
    }
  }, /^Error: Alfred$/)
})

test('process(file)', function (t) {
  var givenFile = new VFile('alpha')
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
      processor.Parser = NoopParser
      processor.processSync()
    },
    /Cannot `processSync` without `Compiler`/,
    'should throw without `Compiler`'
  )

  t.throws(
    function () {
      unified().use(parse).use(plugin).use(compile).processSync('delta')

      function parse() {
        this.Parser = SimpleParser
      }

      function compile() {
        this.Compiler = NoopCompiler
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
        this.Parser = SimpleParser
      })
      .use(function () {
        return transformer
        function transformer(node) {
          node.value = 'alpha'
        }
      })
      .use(function () {
        this.Compiler = SimpleCompiler
      })
      .processSync('delta')
      .toString(),
    'alpha',
    'should pass the result file'
  )
})

test('compilers', function (t) {
  t.plan(4)

  t.equal(
    unified()
      .use(function () {
        this.Parser = SimpleParser
        this.Compiler = string
      })
      .processSync('alpha').value,
    'bravo',
    'should compile strings'
  )

  t.deepEqual(
    unified()
      .use(function () {
        this.Parser = SimpleParser
        this.Compiler = buffer
      })
      .processSync('alpha').value,
    Buffer.from('bravo'),
    'should compile buffers'
  )

  t.deepEqual(
    unified()
      .use(function () {
        this.Parser = SimpleParser
        this.Compiler = nullish
      })
      .processSync('alpha').value,
    'alpha',
    'should compile null'
  )

  t.deepEqual(
    unified()
      .use(function () {
        this.Parser = SimpleParser
        this.Compiler = nonText
      })
      .processSync('alpha').result,
    {
      _owner: null,
      type: 'p',
      ref: null,
      key: 'h-1',
      props: {children: ['bravo']}
    },
    'should compile non-text'
  )

  function nullish() {
    return null
  }

  function string() {
    return 'bravo'
  }

  function buffer() {
    return Buffer.from('bravo')
  }

  function nonText() {
    // Somewhat like a React node.
    return {
      _owner: null,
      type: 'p',
      ref: null,
      key: 'h-1',
      props: {children: ['bravo']}
    }
  }
})
