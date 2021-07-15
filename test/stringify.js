/**
 * @typedef {import('unist').Node} Node
 */

import test from 'tape'
import {VFile} from 'vfile'
import {unified} from '../index.js'

test('stringify(node[, file])', (t) => {
  const processor = unified()
  const givenFile = new VFile('charlie')
  const givenNode = {type: 'delta'}

  t.plan(15)

  t.throws(
    () => {
      processor.stringify({type: 'x'})
    },
    /Cannot `stringify` without `Compiler`/,
    'should throw without `Compiler`'
  )

  processor.Compiler = function (node, file) {
    t.equal(node, givenNode, 'should pass a node')
    t.ok('message' in file, 'should pass a file')
  }

  // `prototype`s are objects.
  // type-coverage:ignore-next-line
  processor.Compiler.prototype.compile = function () {
    t.equal(arguments.length, 0, 'should not pass anything to `compile`')
    return 'echo'
  }

  t.equal(
    processor.stringify(givenNode, givenFile),
    'echo',
    'should return the result `Compiler#compile` returns'
  )

  processor.Compiler = function (node, file) {
    t.equal(node, givenNode, 'should pass a node')
    t.ok('message' in file, 'should pass a file')
    return 'echo'
  }

  t.equal(
    processor.stringify(givenNode, givenFile),
    'echo',
    'should return the result `compiler` returns if it’s not a constructor'
  )

  processor.Compiler = (node, file) => {
    t.equal(node, givenNode, 'should pass a node')
    t.ok('message' in file, 'should pass a file')
    return 'echo'
  }

  t.equal(
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
      t.equal(node, givenNode, 'should pass a node')
      t.ok('message' in file, 'should pass a file')
    }

    compile() {
      t.equal(arguments.length, 0, 'should not pass anything to `compile`')
      return 'echo'
    }
  }

  t.equal(
    processor.stringify(givenNode, givenFile),
    'echo',
    'should return the result `Compiler#compile` returns on an ES class'
  )
})
