'use strict'

var test = require('tape')
var vfile = require('vfile')
var unified = require('..')

test('async function transformer () {}', function(t) {
  var f
  var n
  var e

  t.plan(5)

  f = vfile('alpha')
  n = {type: 'bravo'}
  e = {type: 'charlie'}

  unified()
    .use(plugin)
    .run(n, f, function(err, a, file) {
      t.error(err, 'should’t fail')
      t.equal(a, e, 'passes given tree to `done`')
      t.equal(file, f, 'passes given file to `done`')
    })

  function plugin() {
    return transformer
  }

  async function transformer(tree, file) {
    t.equal(tree, n, 'passes correct tree to an async function')
    t.equal(file, f, 'passes correct file to an async function')
    return e
  }
})
