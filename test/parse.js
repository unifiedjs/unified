/**
 * @typedef {import('unist').Node} Node
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {VFile} from 'vfile'

test('`parse`', async function (t) {
  const givenNode = {type: 'alpha'}

  await t.test('should throw without `Parser`', async function () {
    assert.throws(function () {
      unified().parse('')
    }, /Cannot `parse` without `Parser`/)
  })

  await t.test('should support a plain function', async function () {
    const processor = unified()

    processor.Parser = function (doc, file) {
      assert.equal(typeof doc, 'string')
      assert.ok(file instanceof VFile)
      assert.equal(arguments.length, 2)
      return givenNode
    }

    assert.equal(processor.parse('charlie'), givenNode)
  })

  await t.test('should support an arrow function', async function () {
    const processor = unified()

    // Note: arrow function intended (which doesn’t have a prototype).
    processor.Parser = (doc, file) => {
      assert.equal(typeof doc, 'string')
      assert.ok(file instanceof VFile)
      return givenNode
    }

    assert.equal(processor.parse('charlie'), givenNode)
  })

  await t.test('should support a class', async function () {
    const processor = unified()

    processor.Parser = class {
      /**
       * @param {string} doc
       * @param {VFile} file
       */
      constructor(doc, file) {
        assert.equal(typeof doc, 'string')
        assert.ok(file instanceof VFile)
        assert.equal(arguments.length, 2)
      }

      /**
       * @returns {Node}
       */
      parse() {
        assert.equal(arguments.length, 0)
        return givenNode
      }
    }

    assert.equal(processor.parse('charlie'), givenNode)
  })

  await t.test(
    'should support a constructor w/ `parse` in prototype',
    async function () {
      const processor = unified()

      /**
       * @constructor
       * @param {string} doc
       * @param {VFile} file
       */
      function Parser(doc, file) {
        assert.equal(typeof doc, 'string')
        assert.ok(file instanceof VFile)
        assert.equal(arguments.length, 2)
      }

      /**
       * @returns {Node}
       */
      // type-coverage:ignore-next-line -- for some reason TS does understand `Parser.prototype`, but not `Compiler.prototype`.
      Parser.prototype.parse = function () {
        assert.equal(arguments.length, 0)
        return givenNode
      }

      processor.Parser = Parser

      assert.equal(processor.parse('charlie'), givenNode)
    }
  )
})
