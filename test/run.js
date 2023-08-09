import process from 'node:process'
import assert from 'node:assert/strict'
import test from 'node:test'
import {VFile} from 'vfile'
import {unified} from 'unified'

test('run(node[, file], done)', async () => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const otherNode = {type: 'delta'}

  await new Promise((resolve) => {
    unified().run(givenNode, givenFile, (error, tree, file) => {
      assert.ifError(error)
      assert.equal(tree, givenNode, 'passes given tree to `done`')
      assert.equal(file, givenFile, 'passes given file to `done`')
      resolve(undefined)
    })
  })

  await new Promise((resolve) => {
    unified().run(givenNode, undefined, (error, _, file) => {
      assert.ifError(error)
      assert.equal(String(file), '', 'passes file to `done` if not given')
      resolve(undefined)
    })
  })

  await new Promise((resolve) => {
    unified().run(givenNode, (error, _, file) => {
      assert.ifError(error)
      assert.equal(String(file), '', 'passes file to `done` if omitted')
      resolve(undefined)
    })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function () {
            return new Error('charlie')
          }
      )
      .run(givenNode, (error) => {
        assert.equal(
          String(error),
          'Error: charlie',
          'should pass an error to `done` from a sync transformer'
        )
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(() => () => otherNode)
      .run(givenNode, (error, tree) => {
        assert.ifError(error)

        assert.equal(
          tree,
          otherNode,
          'should pass a new tree to `done`, when returned from a sync transformer'
        )
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            next(new Error('delta'))
          }
      )
      .run(givenNode, (error) => {
        assert.equal(
          String(error),
          'Error: delta',
          'should pass an error to `done`, if given to a sync transformer’s `next`'
        )
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            next()
            next(new Error('delta'))
          }
      )
      .run(givenNode, (error) => {
        assert.ifError(error)
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            next(null, otherNode)
          }
      )
      .run(givenNode, (error, tree) => {
        assert.ifError(error)

        assert.equal(
          tree,
          otherNode,
          'should pass a new tree to `done`, if given to a sync transformer’s `next`'
        )
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function () {
            return new Promise((_, reject) => {
              reject(new Error('delta'))
            })
          }
      )
      .run(givenNode, (error) => {
        assert.equal(
          String(error),
          'Error: delta',
          'should pass an error to `done` rejected from a sync transformer’s returned promise'
        )
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        // Note: TS JS doesn’t understand the promise w/o explicit type.
        /** @type {import('unified').Plugin<[]>} */
        () =>
          function () {
            return new Promise((resolve) => {
              resolve(otherNode)
            })
          }
      )
      .run(givenNode, (error, tree) => {
        assert.ifError(error)

        assert.equal(
          tree,
          otherNode,
          'should pass a new tree to `done`, when resolved sync transformer’s returned promise'
        )
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            setImmediate(tick)
            function tick() {
              next(null, otherNode)
            }
          }
      )
      .run(givenNode, (error, tree) => {
        assert.ifError(error)

        assert.equal(
          tree,
          otherNode,
          'should pass a new tree to `done` when given to `next` from an asynchroneous transformer'
        )
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            setImmediate(tick)
            function tick() {
              next(new Error('echo'))
            }
          }
      )
      .run(givenNode, (error) => {
        assert.equal(
          String(error),
          'Error: echo',
          'should pass an error to `done` given to `next` from an asynchroneous transformer'
        )
        resolve(undefined)
      })
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            setImmediate(tick)
            function tick() {
              next()
              next(new Error('echo'))
            }
          }
      )
      .run(givenNode, (error) => {
        assert.ifError(error)
        resolve(undefined)
      })
  })
})

test('run(node[, file])', async () => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const otherNode = {type: 'delta'}

  await new Promise((resolve) => {
    unified()
      .run(givenNode, givenFile)
      .then(
        (tree) => {
          assert.equal(tree, givenNode, 'should resolve the given tree')
          resolve(undefined)
        },
        () => {
          assert.fail('should resolve, not reject, when `file` is given')
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .run(givenNode, undefined)
      .then(
        (tree) => {
          assert.equal(tree, givenNode, 'should work if `file` is not given')
          resolve(undefined)
        },
        () => {
          assert.fail('should resolve, not reject, when `file` is not given')
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .run(givenNode)
      .then(
        (tree) => {
          assert.equal(tree, givenNode, 'should work if `file` is omitted')
          resolve(undefined)
        },
        () => {
          assert.fail('should resolve, not reject, when `file` is omitted')
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function () {
            return new Error('charlie')
          }
      )
      .run(givenNode)
      .then(
        () => {
          assert.fail(
            'should reject, not resolve, when an error is passed to `done` from a sync transformer'
          )
          resolve(undefined)
        },
        (/** @type {Error} */ error) => {
          assert.equal(
            String(error),
            'Error: charlie',
            'should reject when an error is returned from a sync transformer'
          )
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function () {
            return otherNode
          }
      )
      .run(givenNode)
      .then(
        (tree) => {
          assert.equal(
            tree,
            otherNode,
            'should resolve a new tree when returned from a sync transformer'
          )
          resolve(undefined)
        },
        () => {
          assert.fail(
            'should resolve, not reject, when a new tree is given from a sync transformer'
          )
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            next(new Error('delta'))
          }
      )
      .run(givenNode)
      .then(
        () => {
          assert.fail(
            'should reject, not resolve, if an error is given to a sync transformer’s `next`'
          )
          resolve(undefined)
        },
        (/** @type {Error} */ error) => {
          assert.equal(
            String(error),
            'Error: delta',
            'should reject, if an error is given to a sync transformer’s `next`'
          )
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            next()
            next(new Error('delta'))
          }
      )
      .run(givenNode)
      .then(
        function () {
          resolve(undefined)
        },
        () => {
          assert.fail(
            'should ignore multiple calls of `next` when called in a synchroneous transformer'
          )
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            next(null, otherNode)
          }
      )
      .run(givenNode)
      .then(
        (tree) => {
          assert.equal(
            tree,
            otherNode,
            'should resolve if a new tree is given to a sync transformer’s `next`'
          )
          resolve(undefined)
        },
        () => {
          assert.fail(
            'should resolve, not reject, if a new tree is given to a sync transformer’s `next`'
          )
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function () {
            return new Promise((_, reject) => {
              reject(new Error('delta'))
            })
          }
      )
      .run(givenNode)
      .then(
        () => {
          assert.fail(
            'should reject, not resolve, if an error is rejected from a sync transformer’s returned promise'
          )
          resolve(undefined)
        },
        function () {
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        // Note: TS JS doesn’t understand the promise w/o explicit type.
        /** @type {import('unified').Plugin<[]>} */
        () =>
          function () {
            return new Promise((resolve) => {
              resolve(otherNode)
            })
          }
      )
      .run(givenNode)
      .then(
        function () {
          resolve(undefined)
        },
        () => {
          assert.fail(
            'should resolve, not reject, a new tree if it’s resolved from a sync transformer’s returned promise'
          )
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            setImmediate(() => {
              next(null, otherNode)
            })
          }
      )
      .run(givenNode)
      .then(
        function () {
          resolve(undefined)
        },
        () => {
          assert.fail(
            'should resolve, not reject, if a new tree is given to `next` from an asynchroneous transformer'
          )
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            setImmediate(() => {
              next(new Error('echo'))
            })
          }
      )
      .run(givenNode)
      .then(
        () => {
          assert.fail(
            'should reject, not resolve, if an error is given to `next` from an asynchroneous transformer'
          )
          resolve(undefined)
        },
        function () {
          resolve(undefined)
        }
      )
  })

  await new Promise((resolve) => {
    unified()
      .use(
        () =>
          function (_, _1, next) {
            setImmediate(() => {
              next()
              next(new Error('echo'))
            })
          }
      )
      .run(givenNode)
      .then(
        function () {
          resolve(undefined)
        },
        () => {
          assert.fail(
            'should ignore multiple calls of `next` when called from an asynchroneous transformer'
          )
          resolve(undefined)
        }
      )
  })
})

test('runSync(node[, file])', async () => {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const otherNode = {type: 'delta'}

  assert.throws(
    () => {
      // @ts-expect-error: `node` is required.
      unified().runSync()
    },
    /Expected node, got `undefined`/,
    'should throw without node'
  )

  unified()
    .use(
      () =>
        function (tree, file) {
          assert.equal(tree, givenNode, 'passes given tree to transformers')
          assert.equal(file, givenFile, 'passes given file to transformers')
        }
    )
    .runSync(givenNode, givenFile)

  unified()
    .use(
      () =>
        function (_, file) {
          assert.equal(
            file.toString(),
            '',
            'passes files to transformers if not given'
          )
        }
    )
    .runSync(givenNode)

  assert.throws(
    () => {
      unified()
        .use(
          () =>
            function () {
              return new Error('charlie')
            }
        )
        .runSync(givenNode)
    },
    /charlie/,
    'should throw an error returned from a sync transformer'
  )

  assert.equal(
    unified()
      .use(
        () =>
          function () {
            return otherNode
          }
      )
      .runSync(givenNode),
    otherNode,
    'should return a new tree when returned from a sync transformer'
  )

  assert.throws(
    () => {
      unified()
        .use(
          () =>
            function (_, _1, next) {
              next(new Error('delta'))
            }
        )
        .runSync(givenNode)
    },
    /delta/,
    'should throw an error if given to a sync transformer’s `next`'
  )

  assert.equal(
    unified()
      .use(
        () =>
          function (_, _1, next) {
            next(null, otherNode)
          }
      )
      .runSync(givenNode),
    otherNode,
    'should return a new tree if given to a sync transformer’s `next`'
  )

  await new Promise((resolve) => {
    /** @type {unknown} */
    // @ts-expect-error: prevent the test runner from warning.
    const current = process._events.unhandledRejection
    // @ts-expect-error: prevent the test runner from warning.
    process._events.unhandledRejection = undefined

    process.once('unhandledRejection', function () {
      resolve(undefined)
      // @ts-expect-error: prevent the test runner from warning.
      process._events.unhandledRejection = current
    })

    assert.throws(
      () => {
        unified()
          .use(
            () =>
              function () {
                return new Promise((_, reject) => {
                  reject(new Error('delta'))
                })
              }
          )
          .runSync(givenNode)
      },
      /`runSync` finished async. Use `run` instead/,
      'should not support a promise returning transformer rejecting in `runSync`'
    )
  })

  assert.throws(
    () => {
      unified()
        .use(
          // Note: TS JS doesn’t understand the promise w/o explicit type.
          /** @type {import('unified').Plugin<[]>} */
          () =>
            function () {
              return new Promise((resolve) => {
                resolve(otherNode)
              })
            }
        )
        .runSync(givenNode)
    },
    /`runSync` finished async. Use `run` instead/,
    'should not support a promise returning transformer resolving in `runSync`'
  )

  await new Promise((resolve) => {
    assert.throws(
      () => {
        unified()
          .use(
            () =>
              function (_, _1, next) {
                setImmediate(() => {
                  next(null, otherNode)
                  setImmediate(() => {
                    resolve(undefined)
                  })
                })
              }
          )
          .runSync(givenNode)
      },
      /`runSync` finished async. Use `run` instead/,
      'should throw an error if an asynchroneous transformer is used but no `done` is given'
    )
  })
})
