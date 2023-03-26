/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('vfile').VFile} VFile
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'

test('parse(file)', () => {
  const processor = unified()
  const givenNode = {type: 'delta'}

  assert.throws(
    () => {
      processor.parse('')
    },
    /Cannot `parse` without `Parser`/,
    'should throw without `Parser`'
  )

  processor.Parser = function (doc, file) {
    assert.equal(typeof doc, 'string', 'should pass a document')
    assert.ok('message' in file, 'should pass a file')
  }

  processor.Parser.prototype.parse = function () {
    assert.equal(arguments.length, 0, 'should not pass anything to `parse`')
    return givenNode
  }

  assert.equal(
    processor.parse('charlie'),
    givenNode,
    'should return the result `Parser#parse` returns'
  )

  processor.Parser = function (doc, file) {
    assert.equal(typeof doc, 'string', 'should pass a document')
    assert.ok('message' in file, 'should pass a file')
    return givenNode
  }

  assert.equal(
    processor.parse('charlie'),
    givenNode,
    'should return the result `Parser` returns if it’s not a constructor'
  )

  processor.Parser = (doc, file) => {
    assert.equal(typeof doc, 'string', 'should pass a document')
    assert.ok('message' in file, 'should pass a file')
    return givenNode
  }

  assert.equal(
    processor.parse('charlie'),
    givenNode,
    'should return the result `parser` returns if it’s an arrow function'
  )

  processor.Parser = class ESParser {
    /**
     * @param {string} doc
     * @param {VFile} file
     */
    constructor(doc, file) {
      assert.equal(typeof doc, 'string', 'should pass a document')
      assert.ok('message' in file, 'should pass a file')
    }

    /** @returns {Node} */
    parse() {
      assert.equal(arguments.length, 0, 'should not pass anything to `parse`')
      return givenNode
    }
  }

  assert.equal(
    processor.parse('charlie'),
    givenNode,
    'should return the result `Parser#parse` returns on an ES class'
  )
})
