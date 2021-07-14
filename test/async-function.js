import test from 'tape'
import {VFile} from 'vfile'
import {unified} from '../index.js'

test('async function transformer () {}', (t) => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const modifiedNode = {type: 'charlie'}

  t.plan(5)

  unified()
    .use(() => {
      return async function (tree, file) {
        t.equal(tree, givenNode, 'passes correct tree to an async function')
        t.equal(file, givenFile, 'passes correct file to an async function')
        return modifiedNode
      }
    })
    .run(givenNode, givenFile, (error, tree, file) => {
      t.error(error, 'should’t fail')
      t.equal(tree, modifiedNode, 'passes given tree to `done`')
      t.equal(file, givenFile, 'passes given file to `done`')
    })
})
