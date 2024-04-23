import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {VFile} from 'vfile'
import {simpleCompiler, simpleParser} from './util/simple.js'

test('`process`', async function (t) {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}

  await t.test('should throw w/o `parser`', async function () {
    assert.throws(function () {
      unified().process('')
    }, /Cannot `process` without `parser`/)
  })

  await t.test('should throw w/o `compiler`', async function () {
    assert.throws(function () {
      const processor = unified()
      processor.parser = simpleParser
      processor.process('')
    }, /Cannot `process` without `compiler`/)
  })

  await t.test('should pass/yield expected values', async function () {
    const processor = unified()

    processor.parser = function (document, file) {
      assert.equal(typeof document, 'string')
      assert.equal(file, givenFile)
      assert.equal(arguments.length, 2)
      return givenNode
    }

    processor.compiler = function (tree, file) {
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

    processor.parser = simpleParser
    processor.compiler = simpleCompiler

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

      processor.parser = simpleParser
      processor.compiler = simpleCompiler

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
