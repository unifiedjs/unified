import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {simpleCompiler, simpleParser} from './util/simple.js'

test('`processSync`', async function (t) {
  await t.test('should throw w/o `Parser`', async function () {
    assert.throws(function () {
      unified().processSync('')
    }, /Cannot `processSync` without `Parser`/)
  })

  await t.test('should throw w/o `Compiler`', async function () {
    assert.throws(function () {
      const processor = unified()
      processor.Parser = simpleParser
      processor.processSync('')
    }, /Cannot `processSync` without `Compiler`/)
  })

  await t.test('should support `processSync`', async function () {
    const processor = unified()

    processor.Parser = simpleParser
    processor.Compiler = simpleCompiler

    assert.equal(processor.processSync('alpha').toString(), 'alpha')
  })

  await t.test(
    'should throw transform errors from `processSync`',
    async function () {
      assert.throws(function () {
        const processor = unified()
        processor.Parser = simpleParser
        processor.Compiler = simpleCompiler

        processor
          .use(function () {
            return function () {
              return new Error('bravo')
            }
          })
          .processSync('delta')
      }, /Error: bravo/)

      assert.throws(function () {
        unified()
          .use(parse)
          .use(compile)
          .use(function () {
            return function () {
              return new Error('bravo')
            }
          })
          .processSync('delta')
      }, /Error: bravo/)
    }
  )
})

// `this` in JS is buggy in TS.
/**
 * @type {import('unified').Plugin<[], string, import('unist').Node>}
 */
function parse() {
  // type-coverage:ignore-next-line -- something with TS being wrong.
  this.Parser = simpleParser
}

// `this` in JS is buggy in TS.
/**
 * @type {import('unified').Plugin<[], import('unist').Node, string>}
 */
function compile() {
  // type-coverage:ignore-next-line -- something with TS being wrong.
  this.Compiler = simpleCompiler
}
