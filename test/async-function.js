/**
 * @typedef {import('unist').Node} Node
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {VFile} from 'vfile'
import {unified} from 'unified'

test('async function transformer () {}', () => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const modifiedNode = {type: 'charlie'}

  unified()
    .use(() => async function () {})
    .use(
      // Note: TS JS doesn’t understand the `Promise<undefined>` w/o explicit type.
      /** @type {import('../index.js').Plugin<[]>} */
      () =>
        async function () {
          return undefined
        }
    )
    .use(() => async (tree, file) => {
      assert.equal(tree, givenNode, 'passes correct tree to an async function')
      assert.equal(file, givenFile, 'passes correct file to an async function')
      return modifiedNode
    })
    .run(givenNode, givenFile, (error, tree, file) => {
      assert.ifError(error)
      assert.equal(tree, modifiedNode, 'passes given tree to `done`')
      assert.equal(file, givenFile, 'passes given file to `done`')
    })
})
