/**
 * @typedef {import('unist').Literal<string>} Literal
 * @typedef {import('unist').Node} Node
 * @typedef {import('../index.js').Parser} Parser
 * @typedef {import('../index.js').Compiler} Compiler
 */

import {Buffer} from 'node:buffer'
import assert from 'node:assert/strict'
import test from 'node:test'
import {VFile} from 'vfile'
import {unified} from '../index.js'
import {SimpleCompiler, SimpleParser} from './util/simple.js'

test('process(file, done)', () => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}

  assert.throws(
    () => {
      unified().process('')
    },
    /Cannot `process` without `Parser`/,
    'should throw without `Parser`'
  )

  assert.throws(
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
          assert.equal(typeof doc, 'string', 'should pass `doc` to `Parser`')
          assert.equal(file, givenFile, 'should pass `file` to `Parser`')
          return givenNode
        }
      })
    })
    .use(
      () =>
        /**
         * @param {Node} tree
         * @param {VFile} file
         */
        function (tree, file) {
          assert.equal(tree, givenNode, 'should pass `tree` to transformers')
          assert.equal(file, givenFile, 'should pass `file` to transformers')
        }
    )
    .use(function () {
      Object.assign(this, {
        /** @type {Compiler} */
        Compiler(tree, file) {
          assert.equal(tree, givenNode, 'should pass `tree` to `Compiler`')
          assert.equal(file, givenFile, 'should pass `file` to `Compiler`')
          return 'charlie'
        }
      })
    })
    .process(givenFile, (error, file) => {
      assert.ifError(error)

      assert.equal(
        String(file),
        'charlie',
        'should store the result of `compile()` on `file`'
      )
    })

  assert.throws(() => {
    unified()
      .use(function () {
        Object.assign(this, {Parser: SimpleParser, Compiler: SimpleCompiler})
      })
      .process(givenFile, () => {
        throw new Error('Alfred')
      })
  }, /^Error: Alfred$/)
})

test('process(file)', () => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}

  unified()
    .use(function () {
      Object.assign(this, {
        /** @type {Parser} */
        Parser(doc, file) {
          assert.equal(typeof doc, 'string', 'should pass `doc` to `Parser`')
          assert.equal(file, givenFile, 'should pass `file` to `Parser`')
          return givenNode
        }
      })
    })
    .use(
      () =>
        /**
         * @param {Node} tree
         * @param {VFile} file
         */
        function (tree, file) {
          assert.equal(tree, givenNode, 'should pass `tree` to transformers')
          assert.equal(file, givenFile, 'should pass `file` to transformers')
        }
    )
    .use(function () {
      Object.assign(this, {
        /** @type {Compiler} */
        Compiler(tree, file) {
          assert.equal(tree, givenNode, 'should pass `tree` to `Compiler`')
          assert.equal(file, givenFile, 'should pass `file` to `Compiler`')
          return 'charlie'
        }
      })
    })
    .process(givenFile)
    .then(
      (file) => {
        assert.equal(file.toString(), 'charlie', 'should resolve the file')
      },
      () => {
        assert.fail('should resolve, not reject, the file')
      }
    )
})

test('processSync(file)', () => {
  assert.throws(
    () => {
      unified().processSync('')
    },
    /Cannot `processSync` without `Parser`/,
    'should throw without `Parser`'
  )

  assert.throws(
    () => {
      const processor = unified()
      processor.Parser = SimpleParser
      processor.processSync('')
    },
    /Cannot `processSync` without `Compiler`/,
    'should throw without `Compiler`'
  )

  assert.throws(
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

  assert.equal(
    unified()
      .use(function () {
        Object.assign(this, {Parser: SimpleParser, Compiler: SimpleCompiler})
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

test('compilers', () => {
  assert.equal(
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

  assert.deepEqual(
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

  assert.deepEqual(
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

  assert.deepEqual(
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
