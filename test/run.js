'use strict'

var test = require('tape')
var vfile = require('vfile')
var unified = require('..')

test('run(node[, file], done)', function (t) {
  var givenFile = vfile('alpha')
  var givenNode = {type: 'bravo'}
  var otherNode = {type: 'delta'}

  t.plan(21)

  unified().run(givenNode, givenFile, function (err, tree, file) {
    t.error(err, 'should’t fail')
    t.equal(tree, givenNode, 'passes given tree to `done`')
    t.equal(file, givenFile, 'passes given file to `done`')
  })

  unified().run(givenNode, null, function (err, tree, file) {
    t.error(err, 'should’t fail')
    t.equal(file.toString(), '', 'passes file to `done` if not given')
  })

  unified().run(givenNode, function (err, tree, file) {
    t.error(err, 'should’t fail')
    t.equal(file.toString(), '', 'passes file to `done` if omitted')
  })

  unified()
    .use(function () {
      return transformer
      function transformer() {
        return new Error('charlie')
      }
    })
    .run(givenNode, function (err) {
      t.equal(
        String(err),
        'Error: charlie',
        'should pass an error to `done` from a sync transformer'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer() {
        return otherNode
      }
    })
    .run(givenNode, function (err, tree) {
      t.error(err, 'should’t fail')

      t.equal(
        tree,
        otherNode,
        'should pass a new tree to `done`, when returned from a sync transformer'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        next(new Error('delta'))
      }
    })
    .run(givenNode, function (err) {
      t.equal(
        String(err),
        'Error: delta',
        'should pass an error to `done`, if given to a sync transformer’s `next`'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        next()
        next(new Error('delta'))
      }
    })
    .run(givenNode, function (err) {
      t.error(
        err,
        'should ignore multiple invocations of `next`when invoked in a synchroneous transformer'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        next(null, otherNode)
      }
    })
    .run(givenNode, function (err, tree) {
      t.error(err, 'should’t fail')

      t.equal(
        tree,
        otherNode,
        'should pass a new tree to `done`, if given to a sync transformer’s `next`'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer() {
        return {then: executor}
      }

      function executor(resolve, reject) {
        reject(new Error('delta'))
      }
    })
    .run(givenNode, function (err) {
      t.equal(
        String(err),
        'Error: delta',
        'should pass an error to `done` rejected from a sync transformer’s returned promise'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer() {
        return {then: executor}
      }

      function executor(resolve) {
        resolve(otherNode)
      }
    })
    .run(givenNode, function (err, tree) {
      t.error(err, 'should’t fail')

      t.equal(
        tree,
        otherNode,
        'should pass a new tree to `done`, when resolved sync transformer’s returned promise'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        setImmediate(tick)
        function tick() {
          next(null, otherNode)
        }
      }
    })
    .run(givenNode, function (err, tree) {
      t.error(err, 'should’t fail')

      t.equal(
        tree,
        otherNode,
        'should pass a new tree to `done` when given to `next` from an asynchroneous transformer'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        setImmediate(tick)
        function tick() {
          next(new Error('echo'))
        }
      }
    })
    .run(givenNode, function (err) {
      t.equal(
        String(err),
        'Error: echo',
        'should pass an error to `done` given to `next` from an asynchroneous transformer'
      )
    })

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        setImmediate(tick)
        function tick() {
          next()
          next(new Error('echo'))
        }
      }
    })
    .run(givenNode, function (err) {
      t.error(
        err,
        'should ignore multiple invocations of `next`when invoked from an asynchroneous transformer'
      )
    })
})

test('run(node[, file])', function (t) {
  var givenFile = vfile('alpha')
  var givenNode = {type: 'bravo'}
  var otherNode = {type: 'delta'}

  t.plan(13)

  unified()
    .run(givenNode, givenFile)
    .then(
      function (tree) {
        t.equal(tree, givenNode, 'should resolve the given tree')
      },
      function () {
        t.fail('should resolve, not reject, when `file` is given')
      }
    )

  unified()
    .run(givenNode, null)
    .then(
      function (tree) {
        t.equal(tree, givenNode, 'should work if `file` is not given')
      },
      function () {
        t.fail('should resolve, not reject, when `file` is not given')
      }
    )

  unified()
    .run(givenNode)
    .then(
      function (tree) {
        t.equal(tree, givenNode, 'should work if `file` is omitted')
      },
      function () {
        t.fail('should resolve, not reject, when `file` is omitted')
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer() {
        return new Error('charlie')
      }
    })
    .run(givenNode)
    .then(
      function () {
        t.fail(
          'should reject, not resolve, when an error is passed to `done` from a sync transformer'
        )
      },
      function (err) {
        t.equal(
          String(err),
          'Error: charlie',
          'should reject when an error is returned from a sync transformer'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer() {
        return otherNode
      }
    })
    .run(givenNode)
    .then(
      function (tree) {
        t.equal(
          tree,
          otherNode,
          'should resolve a new tree when returned from a sync transformer'
        )
      },
      function () {
        t.fail(
          'should resolve, not reject, when a new tree is given from a sync transformer'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        next(new Error('delta'))
      }
    })
    .run(givenNode)
    .then(
      function () {
        t.fail(
          'should reject, not resolve, if an error is given to a sync transformer’s `next`'
        )
      },
      function (err) {
        t.equal(
          String(err),
          'Error: delta',
          'should reject, if an error is given to a sync transformer’s `next`'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        next()
        next(new Error('delta'))
      }
    })
    .run(givenNode)
    .then(
      function () {
        t.pass(
          'should ignore multiple invocations of `next`when invoked in a synchroneous transformer'
        )
      },
      function () {
        t.fail(
          'should ignore multiple invocations of `next`when invoked in a synchroneous transformer'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        next(null, otherNode)
      }
    })
    .run(givenNode)
    .then(
      function (tree) {
        t.equal(
          tree,
          otherNode,
          'should resolve if a new tree is given to a sync transformer’s `next`'
        )
      },
      function () {
        t.fail(
          'should resolve, not reject, if a new tree is given to a sync transformer’s `next`'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer() {
        return {then: executor}
      }

      function executor(resolve, reject) {
        reject(new Error('delta'))
      }
    })
    .run(givenNode)
    .then(
      function () {
        t.fail(
          'should reject, not resolve, if an error is rejected from a sync transformer’s returned promise'
        )
      },
      function () {
        t.pass(
          'should reject if an error is rejected from a sync transformer’s returned promise'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer() {
        return {then: executor}
      }

      function executor(resolve) {
        resolve(otherNode)
      }
    })
    .run(givenNode)
    .then(
      function () {
        t.pass(
          'should resolve a new tree if it’s resolved from a sync transformer’s returned promise'
        )
      },
      function () {
        t.fail(
          'should resolve, not reject, a new tree if it’s resolved from a sync transformer’s returned promise'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        setImmediate(tick)
        function tick() {
          next(null, otherNode)
        }
      }
    })
    .run(givenNode)
    .then(
      function () {
        t.pass(
          'should resolve a new tree if it’s given to `next` from an asynchroneous transformer'
        )
      },
      function () {
        t.fail(
          'should resolve, not reject, if a new tree is given to `next` from an asynchroneous transformer'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        setImmediate(tick)
        function tick() {
          next(new Error('echo'))
        }
      }
    })
    .run(givenNode)
    .then(
      function () {
        t.fail(
          'should reject, not resolve, if an error is given to `next` from an asynchroneous transformer'
        )
      },
      function () {
        t.pass(
          'should reject if an error is given to `next` from an asynchroneous transformer'
        )
      }
    )

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file, next) {
        setImmediate(tick)
        function tick() {
          next()
          next(new Error('echo'))
        }
      }
    })
    .run(givenNode)
    .then(
      function () {
        t.pass(
          'should ignore multiple invocations of `next`when invoked from an asynchroneous transformer'
        )
      },
      function () {
        t.fail(
          'should ignore multiple invocations of `next`when invoked from an asynchroneous transformer'
        )
      }
    )
})

test('runSync(node[, file])', function (t) {
  var givenFile = vfile('alpha')
  var givenNode = {type: 'bravo'}
  var otherNode = {type: 'delta'}

  t.plan(11)

  t.throws(
    function () {
      unified().runSync()
    },
    /Expected node, got `undefined`/,
    'should throw without node'
  )

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file) {
        t.equal(tree, givenNode, 'passes given tree to transformers')
        t.equal(file, givenFile, 'passes given file to transformers')
      }
    })
    .runSync(givenNode, givenFile)

  unified()
    .use(function () {
      return transformer
      function transformer(tree, file) {
        t.equal(
          file.toString(),
          '',
          'passes files to transformers if not given'
        )
      }
    })
    .runSync(givenNode)

  t.throws(
    function () {
      unified().use(plugin).runSync(givenNode)

      function plugin() {
        return transformer
      }

      function transformer() {
        return new Error('charlie')
      }
    },
    /charlie/,
    'should throw an error returned from a sync transformer'
  )

  t.equal(
    unified()
      .use(function () {
        return transformer
        function transformer() {
          return otherNode
        }
      })
      .runSync(givenNode),
    otherNode,
    'should return a new tree when returned from a sync transformer'
  )

  t.throws(
    function () {
      unified().use(plugin).runSync(givenNode)

      function plugin() {
        return transformer
      }

      function transformer(tree, file, next) {
        next(new Error('delta'))
      }
    },
    /delta/,
    'should throw an error if given to a sync transformer’s `next`'
  )

  t.equal(
    unified()
      .use(function () {
        return transformer
        function transformer(tree, file, next) {
          next(null, otherNode)
        }
      })
      .runSync(givenNode),
    otherNode,
    'should return a new tree if given to a sync transformer’s `next`'
  )

  t.throws(
    function () {
      unified().use(plugin).runSync(givenNode)

      function plugin() {
        return transformer
      }

      function transformer() {
        return {then: executor}
      }

      function executor(resolve, reject) {
        reject(new Error('delta'))
      }
    },
    /delta/,
    'should throw an error rejected from a sync transformer’s returned promise'
  )

  t.equal(
    unified()
      .use(function () {
        return transformer
        function transformer() {
          return {then: executor}
        }

        function executor(resolve) {
          resolve(otherNode)
        }
      })
      .runSync(givenNode),
    otherNode,
    'should return a new tree resolved from a sync transformer’s returned promise'
  )

  t.throws(
    function () {
      unified().use(plugin).runSync(givenNode)

      function plugin() {
        return transformer
      }

      function transformer(tree, file, next) {
        setImmediate(tick)
        function tick() {
          next(null, otherNode)
        }
      }
    },
    /`runSync` finished async. Use `run` instead/,
    'should throw an error if an asynchroneous transformer is used but no `done` is given'
  )
})
