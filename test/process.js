import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {VFile} from 'vfile'
import {SimpleCompiler, SimpleParser} from './util/simple.js'

test('`process`', async function (t) {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}

  await t.test('should throw w/o `Parser`', async function () {
    assert.throws(function () {
      unified().process('')
    }, /Cannot `process` without `Parser`/)
  })

  await t.test('should throw w/o `Compiler`', async function () {
    assert.throws(function () {
      const processor = unified()
      processor.Parser = SimpleParser
      processor.process('')
    }, /Cannot `process` without `Compiler`/)
  })

  await t.test('should pass/yield expected values', async function () {
    const processor = unified()

    processor.Parser = function (doc, file) {
      assert.equal(typeof doc, 'string')
      assert.equal(file, givenFile)
      assert.equal(arguments.length, 2)
      return givenNode
    }

    processor.Compiler = function (tree, file) {
      assert.equal(tree, givenNode)
      assert.equal(file, givenFile)
      assert.equal(arguments.length, 2)
      return 'charlie'
    }

    processor.use(function () {
      return function (tree, file) {
        assert.equal(tree, givenNode)
        assert.equal(file, givenFile)
        assert.equal(arguments.length, 2)
      }
    })

    await new Promise(function (resolve) {
      processor.process(givenFile, function (error, file) {
        assert.ifError(error)
        assert.equal(String(file), 'charlie')
        resolve(undefined)
      })
    })
  })

  await t.test('should rethrow errors in `done` throws', async function () {
    const processor = unified()

    processor.Parser = SimpleParser
    processor.Compiler = SimpleCompiler

    assert.throws(function () {
      processor.process(givenFile, function () {
        throw new Error('Alfred')
      })
    }, /^Error: Alfred$/)
  })

  await t.test(
    'should support `process` w/o `done` (promise)',
    async function () {
      const processor = unified()

      processor.Parser = SimpleParser
      processor.Compiler = SimpleCompiler

      await new Promise(function (resolve, reject) {
        processor.process(givenFile).then(
          function (file) {
            assert.equal(String(file), 'charlie')
            resolve(undefined)
          },
          /**
           * @param {unknown} error
           */
          function (error) {
            reject(error)
          }
        )
      })
    }
  )
})
