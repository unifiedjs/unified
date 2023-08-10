/**
 * @typedef {import('unist').Node} Node
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {VFile} from 'vfile'

test('`stringify`', async function (t) {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}

  await t.test('should throw without `Compiler`', async function () {
    assert.throws(function () {
      unified().stringify(givenNode)
    }, /Cannot `stringify` without `Compiler`/)
  })

  await t.test('should support a plain function', async function () {
    const processor = unified()

    processor.Compiler = function (node, file) {
      assert.equal(node, givenNode)
      assert.ok(file instanceof VFile)
      assert.equal(arguments.length, 2)
      return 'echo'
    }

    assert.equal(processor.stringify(givenNode, givenFile), 'echo')
  })

  await t.test('should support an arrow function', async function () {
    const processor = unified()

    // Note: arrow function intended (which doesn’t have a prototype).
    processor.Compiler = (node, file) => {
      assert.equal(node, givenNode, 'should pass a node')
      assert.ok(file instanceof VFile, 'should pass a file')
      return 'echo'
    }

    assert.equal(processor.stringify(givenNode, givenFile), 'echo')
  })

  await t.test('should support a class', async function () {
    const processor = unified()

    processor.Compiler = class {
      /**
       * @param {Node} node
       * @param {VFile} file
       */
      constructor(node, file) {
        assert.equal(node, givenNode)
        assert.ok(file instanceof VFile)
      }

      compile() {
        assert.equal(arguments.length, 0)
        return 'echo'
      }
    }

    assert.equal(processor.stringify(givenNode, givenFile), 'echo')
  })

  await t.test(
    'should support a constructor w/ `compile` in prototype',
    async function () {
      const processor = unified()

      processor.Compiler = function (node, file) {
        assert.equal(node, givenNode, 'should pass a node')
        assert.ok(file instanceof VFile, 'should pass a file')
        assert.equal(arguments.length, 2)
      }

      processor.Compiler.prototype.compile = function () {
        assert.equal(arguments.length, 0)
        return 'echo'
      }

      assert.equal(processor.stringify(givenNode, givenFile), 'echo')
    }
  )
})
