/**
 * @typedef {import('..').YieldingTransformer} YieldingTransformer
 */

import test from 'tape'
import {VFile} from 'vfile'
import {unified} from '../index.js'

test('run(node[, file], done)', (t) => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const otherNode = {type: 'delta'}

  t.plan(21)

  unified().run(givenNode, givenFile, (error, tree, file) => {
    t.error(error, 'should’t fail')
    t.equal(tree, givenNode, 'passes given tree to `done`')
    t.equal(file, givenFile, 'passes given file to `done`')
  })

  unified().run(givenNode, undefined, (error, _, file) => {
    t.error(error, 'should’t fail')
    t.equal(String(file), '', 'passes file to `done` if not given')
  })

  unified().run(givenNode, (error, _, file) => {
    t.error(error, 'should’t fail')
    t.equal(String(file), '', 'passes file to `done` if omitted')
  })

  unified()
    .use(() => {
      return function () {
        return new Error('charlie')
      }
    })
    .run(givenNode, (error) => {
      t.equal(
        String(error),
        'Error: charlie',
        'should pass an error to `done` from a sync transformer'
      )
    })

  unified()
    .use(() => {
      return function () {
        return otherNode
      }
    })
    .run(givenNode, (error, tree) => {
      t.error(error, 'should’t fail')

      t.equal(
        tree,
        otherNode,
        'should pass a new tree to `done`, when returned from a sync transformer'
      )
    })

  unified()
    .use(() => {
      return function (_, _1, next) {
        next(new Error('delta'))
      }
    })
    .run(givenNode, (error) => {
      t.equal(
        String(error),
        'Error: delta',
        'should pass an error to `done`, if given to a sync transformer’s `next`'
      )
    })

  unified()
    .use(() => {
      return function (_, _1, next) {
        next()
        next(new Error('delta'))
      }
    })
    .run(givenNode, (error) => {
      t.error(
        error,
        'should ignore multiple calls of `next` when called in a synchroneous transformer'
      )
    })

  unified()
    .use(() => {
      return function (_, _1, next) {
        next(null, otherNode)
      }
    })
    .run(givenNode, (error, tree) => {
      t.error(error, 'should’t fail')

      t.equal(
        tree,
        otherNode,
        'should pass a new tree to `done`, if given to a sync transformer’s `next`'
      )
    })

  unified()
    .use(() => {
      return function () {
        return new Promise((_, reject) => {
          reject(new Error('delta'))
        })
      }
    })
    .run(givenNode, (error) => {
      t.equal(
        String(error),
        'Error: delta',
        'should pass an error to `done` rejected from a sync transformer’s returned promise'
      )
    })

  unified()
    .use(() => {
      return function () {
        return new Promise((resolve) => {
          resolve(otherNode)
        })
      }
    })
    .run(givenNode, (error, tree) => {
      t.error(error, 'should’t fail')

      t.equal(
        tree,
        otherNode,
        'should pass a new tree to `done`, when resolved sync transformer’s returned promise'
      )
    })

  unified()
    .use(() => {
      return function (_, _1, next) {
        setImmediate(tick)
        function tick() {
          next(null, otherNode)
        }
      }
    })
    .run(givenNode, (error, tree) => {
      t.error(error, 'should’t fail')

      t.equal(
        tree,
        otherNode,
        'should pass a new tree to `done` when given to `next` from an asynchroneous transformer'
      )
    })

  unified()
    .use(() => {
      return function (_, _1, next) {
        setImmediate(tick)
        function tick() {
          next(new Error('echo'))
        }
      }
    })
    .run(givenNode, (error) => {
      t.equal(
        String(error),
        'Error: echo',
        'should pass an error to `done` given to `next` from an asynchroneous transformer'
      )
    })

  unified()
    .use(() => {
      return function (_, _1, next) {
        setImmediate(tick)
        function tick() {
          next()
          next(new Error('echo'))
        }
      }
    })
    .run(givenNode, (error) => {
      t.error(
        error,
        'should ignore multiple calls of `next` when called from an asynchroneous transformer'
      )
    })
})

test('run(node[, file])', (t) => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const otherNode = {type: 'delta'}

  t.plan(13)

  unified()
    .run(givenNode, givenFile)
    .then(
      (tree) => {
        t.equal(tree, givenNode, 'should resolve the given tree')
      },
      () => {
        t.fail('should resolve, not reject, when `file` is given')
      }
    )

  unified()
    .run(givenNode, undefined)
    .then(
      (tree) => {
        t.equal(tree, givenNode, 'should work if `file` is not given')
      },
      () => {
        t.fail('should resolve, not reject, when `file` is not given')
      }
    )

  unified()
    .run(givenNode)
    .then(
      (tree) => {
        t.equal(tree, givenNode, 'should work if `file` is omitted')
      },
      () => {
        t.fail('should resolve, not reject, when `file` is omitted')
      }
    )

  unified()
    .use(() => {
      return function () {
        return new Error('charlie')
      }
    })
    .run(givenNode)
    .then(
      () => {
        t.fail(
          'should reject, not resolve, when an error is passed to `done` from a sync transformer'
        )
      },
      (/** @type {Error} */ error) => {
        t.equal(
          String(error),
          'Error: charlie',
          'should reject when an error is returned from a sync transformer'
        )
      }
    )

  unified()
    .use(() => {
      return function () {
        return otherNode
      }
    })
    .run(givenNode)
    .then(
      (tree) => {
        t.equal(
          tree,
          otherNode,
          'should resolve a new tree when returned from a sync transformer'
        )
      },
      () => {
        t.fail(
          'should resolve, not reject, when a new tree is given from a sync transformer'
        )
      }
    )

  unified()
    .use(() => {
      return function (_, _1, next) {
        next(new Error('delta'))
      }
    })
    .run(givenNode)
    .then(
      () => {
        t.fail(
          'should reject, not resolve, if an error is given to a sync transformer’s `next`'
        )
      },
      (/** @type {Error} */ error) => {
        t.equal(
          String(error),
          'Error: delta',
          'should reject, if an error is given to a sync transformer’s `next`'
        )
      }
    )

  unified()
    .use(() => {
      return function (_, _1, next) {
        next()
        next(new Error('delta'))
      }
    })
    .run(givenNode)
    .then(
      () => {
        t.pass(
          'should ignore multiple calls of `next` when called in a synchroneous transformer'
        )
      },
      () => {
        t.fail(
          'should ignore multiple calls of `next` when called in a synchroneous transformer'
        )
      }
    )

  unified()
    .use(() => {
      return function (_, _1, next) {
        next(null, otherNode)
      }
    })
    .run(givenNode)
    .then(
      (tree) => {
        t.equal(
          tree,
          otherNode,
          'should resolve if a new tree is given to a sync transformer’s `next`'
        )
      },
      () => {
        t.fail(
          'should resolve, not reject, if a new tree is given to a sync transformer’s `next`'
        )
      }
    )

  unified()
    .use(() => {
      return function () {
        return new Promise((_, reject) => {
          reject(new Error('delta'))
        })
      }
    })
    .run(givenNode)
    .then(
      () => {
        t.fail(
          'should reject, not resolve, if an error is rejected from a sync transformer’s returned promise'
        )
      },
      () => {
        t.pass(
          'should reject if an error is rejected from a sync transformer’s returned promise'
        )
      }
    )

  unified()
    .use(() => {
      return function () {
        return new Promise((resolve) => {
          resolve(otherNode)
        })
      }
    })
    .run(givenNode)
    .then(
      () => {
        t.pass(
          'should resolve a new tree if it’s resolved from a sync transformer’s returned promise'
        )
      },
      () => {
        t.fail(
          'should resolve, not reject, a new tree if it’s resolved from a sync transformer’s returned promise'
        )
      }
    )

  unified()
    .use(() => {
      return function (_, _1, next) {
        setImmediate(() => {
          next(null, otherNode)
        })
      }
    })
    .run(givenNode)
    .then(
      () => {
        t.pass(
          'should resolve a new tree if it’s given to `next` from an asynchroneous transformer'
        )
      },
      () => {
        t.fail(
          'should resolve, not reject, if a new tree is given to `next` from an asynchroneous transformer'
        )
      }
    )

  unified()
    .use(() => {
      return function (_, _1, next) {
        setImmediate(() => {
          next(new Error('echo'))
        })
      }
    })
    .run(givenNode)
    .then(
      () => {
        t.fail(
          'should reject, not resolve, if an error is given to `next` from an asynchroneous transformer'
        )
      },
      () => {
        t.pass(
          'should reject if an error is given to `next` from an asynchroneous transformer'
        )
      }
    )

  unified()
    .use(() => {
      return function (_, _1, next) {
        setImmediate(() => {
          next()
          next(new Error('echo'))
        })
      }
    })
    .run(givenNode)
    .then(
      () => {
        t.pass(
          'should ignore multiple calls of `next` when called from an asynchroneous transformer'
        )
      },
      () => {
        t.fail(
          'should ignore multiple calls of `next` when called from an asynchroneous transformer'
        )
      }
    )
})

test('runSync(node[, file])', (t) => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const otherNode = {type: 'delta'}

  t.plan(12)

  t.throws(
    () => {
      // @ts-expect-error: runtime.
      unified().runSync()
    },
    /Expected node, got `undefined`/,
    'should throw without node'
  )

  unified()
    .use(() => {
      /** @type {YieldingTransformer} */
      return function (tree, file) {
        t.equal(tree, givenNode, 'passes given tree to transformers')
        t.equal(file, givenFile, 'passes given file to transformers')
      }
    })
    .runSync(givenNode, givenFile)

  unified()
    .use(() => {
      /** @type {YieldingTransformer} */
      return function (_, file) {
        t.equal(
          file.toString(),
          '',
          'passes files to transformers if not given'
        )
      }
    })
    .runSync(givenNode)

  t.throws(
    () => {
      unified()
        .use(() => {
          return function () {
            return new Error('charlie')
          }
        })
        .runSync(givenNode)
    },
    /charlie/,
    'should throw an error returned from a sync transformer'
  )

  t.equal(
    unified()
      .use(() => {
        return function () {
          return otherNode
        }
      })
      .runSync(givenNode),
    otherNode,
    'should return a new tree when returned from a sync transformer'
  )

  t.throws(
    () => {
      unified()
        .use(() => {
          return function (_, _1, next) {
            next(new Error('delta'))
          }
        })
        .runSync(givenNode)
    },
    /delta/,
    'should throw an error if given to a sync transformer’s `next`'
  )

  t.equal(
    unified()
      .use(() => {
        return function (_, _1, next) {
          next(null, otherNode)
        }
      })
      .runSync(givenNode),
    otherNode,
    'should return a new tree if given to a sync transformer’s `next`'
  )

  t.throws(
    () => {
      unified()
        .use(() => {
          return function () {
            return new Promise((_, reject) => {
              reject(new Error('delta'))
            })
          }
        })
        .runSync(givenNode)
    },
    /`runSync` finished async. Use `run` instead/,
    'should not support a promise returning transformer rejecting in `runSync`'
  )

  t.throws(
    () => {
      unified()
        .use(() => {
          return function () {
            return new Promise((resolve) => {
              resolve(otherNode)
            })
          }
        })
        .runSync(givenNode)
    },
    /`runSync` finished async. Use `run` instead/,
    'should not support a promise returning transformer resolving in `runSync`'
  )

  process.on('uncaughtException', () => {
    t.pass(
      'should throw the actual error from a rejecting transformer in `runSync`'
    )
  })

  t.throws(
    () => {
      unified()
        .use(() => {
          return function (_, _1, next) {
            setImmediate(() => {
              next(null, otherNode)
            })
          }
        })
        .runSync(givenNode)
    },
    /`runSync` finished async. Use `run` instead/,
    'should throw an error if an asynchroneous transformer is used but no `done` is given'
  )
})
