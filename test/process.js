/**
 * @typedef {import('..').YieldingTransformer} YieldingTransformer
 * @typedef {import('..').Parser} Parser
 * @typedef {import('..').Compiler} Compiler
 * @typedef {import('unist').Literal} Literal
 * @typedef {import('unist').Node} Node
 */

import test from 'tape'
import {VFile} from 'vfile'
import {SimpleCompiler, SimpleParser} from './util/simple.js'
import {unified} from '../index.js'

test('process(file, done)', (t) => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}

  t.plan(11)

  t.throws(
    () => {
      unified().process('')
    },
    /Cannot `process` without `Parser`/,
    'should throw without `Parser`'
  )

  t.throws(
    () => {
      const processor = unified()
      processor.Parser = SimpleParser
      processor.process('')
    },
    /Cannot `process` without `Compiler`/,
    'should throw without `Compiler`'
  )

  unified()
    .use(function () {
      Object.assign(this, {
        /** @type {Parser} */
        Parser(doc, file) {
          t.equal(typeof doc, 'string', 'should pass `doc` to `Parser`')
          t.equal(file, givenFile, 'should pass `file` to `Parser`')
          return givenNode
        }
      })
    })
    .use(() => {
      /** @type {YieldingTransformer} */
      return function (tree, file) {
        t.equal(tree, givenNode, 'should pass `tree` to transformers')
        t.equal(file, givenFile, 'should pass `file` to transformers')
      }
    })
    .use(function () {
      Object.assign(this, {
        /** @type {Compiler} */
        Compiler(tree, file) {
          t.equal(tree, givenNode, 'should pass `tree` to `Compiler`')
          t.equal(file, givenFile, 'should pass `file` to `Compiler`')
          return 'charlie'
        }
      })
    })
    .process(givenFile, (error, file) => {
      t.error(error, 'shouldn’t fail')

      t.equal(
        String(file),
        'charlie',
        'should store the result of `compile()` on `file`'
      )
    })

  t.throws(() => {
    unified()
      .use(function () {
        Object.assign(this, {Parser: SimpleParser, Compiler: SimpleCompiler})
      })
      .process(givenFile, () => {
        throw new Error('Alfred')
      })
  }, /^Error: Alfred$/)
})

test('process(file)', (t) => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}

  t.plan(7)

  unified()
    .use(function () {
      Object.assign(this, {
        /** @type {Parser} */
        Parser(doc, file) {
          t.equal(typeof doc, 'string', 'should pass `doc` to `Parser`')
          t.equal(file, givenFile, 'should pass `file` to `Parser`')
          return givenNode
        }
      })
    })
    .use(() => {
      /** @type {YieldingTransformer} */
      return function (tree, file) {
        t.equal(tree, givenNode, 'should pass `tree` to transformers')
        t.equal(file, givenFile, 'should pass `file` to transformers')
      }
    })
    .use(function () {
      Object.assign(this, {
        /** @type {Compiler} */
        Compiler(tree, file) {
          t.equal(tree, givenNode, 'should pass `tree` to `Compiler`')
          t.equal(file, givenFile, 'should pass `file` to `Compiler`')
          return 'charlie'
        }
      })
    })
    .process(givenFile)
    .then(
      (file) => {
        t.equal(file.toString(), 'charlie', 'should resolve the file')
      },
      () => {
        t.fail('should resolve, not reject, the file')
      }
    )
})

test('processSync(file)', (t) => {
  t.plan(4)

  t.throws(
    () => {
      unified().processSync('')
    },
    /Cannot `processSync` without `Parser`/,
    'should throw without `Parser`'
  )

  t.throws(
    () => {
      const processor = unified()
      processor.Parser = SimpleParser
      processor.processSync('')
    },
    /Cannot `processSync` without `Compiler`/,
    'should throw without `Compiler`'
  )

  t.throws(
    () => {
      unified()
        .use(function () {
          Object.assign(this, {Parser: SimpleParser, Compiler: SimpleCompiler})
          return function () {
            return new Error('bravo')
          }
        })
        .processSync('delta')
    },
    /Error: bravo/,
    'should throw error from `processSync`'
  )

  t.equal(
    unified()
      .use(function () {
        Object.assign(this, {Parser: SimpleParser, Compiler: SimpleCompiler})
        /** @type {YieldingTransformer} */
        return function (node) {
          const text = /** @type {Literal} */ (node)
          text.value = 'alpha'
        }
      })
      .processSync('delta')
      .toString(),
    'alpha',
    'should pass the result file'
  )
})

test('compilers', (t) => {
  t.plan(4)

  t.equal(
    unified()
      .use(function () {
        Object.assign(this, {
          Parser: SimpleParser,
          Compiler() {
            return 'bravo'
          }
        })
      })
      .processSync('alpha').value,
    'bravo',
    'should compile strings'
  )

  t.deepEqual(
    unified()
      .use(function () {
        Object.assign(this, {
          Parser: SimpleParser,
          Compiler() {
            return Buffer.from('bravo')
          }
        })
      })
      .processSync('alpha').value,
    Buffer.from('bravo'),
    'should compile buffers'
  )

  t.deepEqual(
    unified()
      .use(function () {
        Object.assign(this, {
          Parser: SimpleParser,
          Compiler() {
            return null
          }
        })
      })
      .processSync('alpha').value,
    'alpha',
    'should compile null'
  )

  t.deepEqual(
    unified()
      .use(function () {
        Object.assign(this, {
          Parser: SimpleParser,
          Compiler() {
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
})
