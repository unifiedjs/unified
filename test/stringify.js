/**
 * @typedef {import('unist').Node} Node
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {VFile} from 'vfile'
import {unified} from 'unified'

test('stringify(node[, file])', () => {
  const processor = unified()
  const givenFile = new VFile('charlie')
  const givenNode = {type: 'delta'}

  assert.throws(
    () => {
      processor.stringify({type: 'x'})
    },
    /Cannot `stringify` without `Compiler`/,
    'should throw without `Compiler`'
  )

  processor.Compiler = function (node, file) {
    assert.equal(node, givenNode, 'should pass a node')
    assert.ok('message' in file, 'should pass a file')
  }

  // `prototype`s are objects.
  // type-coverage:ignore-next-line
  processor.Compiler.prototype.compile = function () {
    assert.equal(arguments.length, 0, 'should not pass anything to `compile`')
    return 'echo'
  }

  assert.equal(
    processor.stringify(givenNode, givenFile),
    'echo',
    'should return the result `Compiler#compile` returns'
  )

  processor.Compiler = function (node, file) {
    assert.equal(node, givenNode, 'should pass a node')
    assert.ok('message' in file, 'should pass a file')
    return 'echo'
  }

  assert.equal(
    processor.stringify(givenNode, givenFile),
    'echo',
    'should return the result `compiler` returns if it’s not a constructor'
  )

  processor.Compiler = (node, file) => {
    assert.equal(node, givenNode, 'should pass a node')
    assert.ok('message' in file, 'should pass a file')
    return 'echo'
  }

  assert.equal(
    processor.stringify(givenNode, givenFile),
    'echo',
    'should return the result `compiler` returns if it’s an arrow function'
  )

  processor.Compiler = class ESCompiler {
    /**
     * @param {Node} node
     * @param {VFile} file
     */
    constructor(node, file) {
      assert.equal(node, givenNode, 'should pass a node')
      assert.ok('message' in file, 'should pass a file')
    }

    compile() {
      assert.equal(arguments.length, 0, 'should not pass anything to `compile`')
      return 'echo'
    }
  }

  assert.equal(
    processor.stringify(givenNode, givenFile),
    'echo',
    'should return the result `Compiler#compile` returns on an ES class'
  )
})
