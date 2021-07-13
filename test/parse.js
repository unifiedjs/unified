/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('vfile').VFile} VFile
 */

import test from 'tape'
import {unified} from '../index.js'

test('parse(file)', (t) => {
  const processor = unified()
  const givenNode = {type: 'delta'}

  t.plan(15)

  t.throws(
    () => {
      processor.parse('')
    },
    /Cannot `parse` without `Parser`/,
    'should throw without `Parser`'
  )

  processor.Parser = function (doc, file) {
    t.equal(typeof doc, 'string', 'should pass a document')
    t.ok('message' in file, 'should pass a file')
  }

  processor.Parser.prototype.parse = function () {
    t.equal(arguments.length, 0, 'should not pass anything to `parse`')
    return givenNode
  }

  t.equal(
    processor.parse('charlie'),
    givenNode,
    'should return the result `Parser#parse` returns'
  )

  processor.Parser = function (doc, file) {
    t.equal(typeof doc, 'string', 'should pass a document')
    t.ok('message' in file, 'should pass a file')
    return givenNode
  }

  t.equal(
    processor.parse('charlie'),
    givenNode,
    'should return the result `Parser` returns if it’s not a constructor'
  )

  processor.Parser = (doc, file) => {
    t.equal(typeof doc, 'string', 'should pass a document')
    t.ok('message' in file, 'should pass a file')
    return givenNode
  }

  t.equal(
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
      t.equal(typeof doc, 'string', 'should pass a document')
      t.ok('message' in file, 'should pass a file')
    }

    /** @returns {Node} */
    parse() {
      t.equal(arguments.length, 0, 'should not pass anything to `parse`')
      return givenNode
    }
  }

  t.equal(
    processor.parse('charlie'),
    givenNode,
    'should return the result `Parser#parse` returns on an ES class'
  )

  t.end()
})
