import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {VFile} from 'vfile'

test('`parse`', async function (t) {
  const givenNode = {type: 'alpha'}

  await t.test('should throw without `parser`', async function () {
    assert.throws(function () {
      unified().parse('')
    }, /Cannot `parse` without `parser`/)
  })

  await t.test('should support a plain function', async function () {
    const processor = unified()

    processor.parser = function (document, file) {
      assert.equal(typeof document, 'string')
      assert.ok(file instanceof VFile)
      assert.equal(arguments.length, 2)
      return givenNode
    }

    assert.equal(processor.parse('charlie'), givenNode)
  })

  await t.test('should support an arrow function', async function () {
    const processor = unified()

    // Note: arrow function intended (which doesn’t have a prototype).
    processor.parser = (document, file) => {
      assert.equal(typeof document, 'string')
      assert.ok(file instanceof VFile)
      return givenNode
    }

    assert.equal(processor.parse('charlie'), givenNode)
  })
})
