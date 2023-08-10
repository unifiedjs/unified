import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {SimpleCompiler, SimpleParser} from './util/simple.js'

test('`processSync`', async function (t) {
  await t.test('should throw w/o `Parser`', async function () {
    assert.throws(function () {
      unified().processSync('')
    }, /Cannot `processSync` without `Parser`/)
  })

  await t.test('should throw w/o `Compiler`', async function () {
    assert.throws(function () {
      const processor = unified()
      processor.Parser = SimpleParser
      processor.processSync('')
    }, /Cannot `processSync` without `Compiler`/)
  })

  await t.test('should support `processSync`', async function () {
    const processor = unified()

    processor.Parser = SimpleParser
    processor.Compiler = SimpleCompiler

    assert.equal(processor.processSync('alpha').toString(), 'alpha')
  })

  await t.test(
    'should throw transform errors from `processSync`',
    async function () {
      assert.throws(function () {
        unified()
          .use(function () {
            this.Parser = SimpleParser
            this.Compiler = SimpleCompiler

            return function () {
              return new Error('bravo')
            }
          })
          .processSync('delta')
      }, /Error: bravo/)
    }
  )
})
