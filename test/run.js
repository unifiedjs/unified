import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {VFile} from 'vfile'

test('`run`', async function (t) {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const otherNode = {type: 'charlie'}
  const givenError = new Error('delta')

  await t.test('should pass/yield expected values', async function () {
    await new Promise(function (resolve) {
      unified().run(givenNode, givenFile, function (error, tree, file) {
        assert.equal(error, undefined)
        assert.equal(tree, givenNode)
        assert.equal(file, givenFile)
        assert.equal(arguments.length, 3)
        resolve(undefined)
      })
    })
  })

  await t.test('should pass a file if implicitly not given', async function () {
    await new Promise(function (resolve) {
      unified().run(givenNode, function (error, _, file) {
        assert.equal(error, undefined)
        assert.ok(file instanceof VFile)
        resolve(undefined)
      })
    })
  })

  await t.test('should pass a file if explicitly not given', async function () {
    await new Promise(function (resolve) {
      unified().run(givenNode, undefined, function (error, _, file) {
        assert.equal(error, undefined)
        assert.ok(file instanceof VFile)
        resolve(undefined)
      })
    })
  })

  await t.test(
    'should yield an error returned from a sync transformer',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function () {
              return givenError
            }
          })
          .run(givenNode, function (error) {
            assert.equal(error, givenError)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should yield a tree when returned from a sync transformer',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function () {
              return otherNode
            }
          })
          .run(givenNode, function (error, tree) {
            assert.equal(error, undefined)
            assert.equal(tree, otherNode)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should yield an error when passed to a transformer’s `next` (sync)',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              next(givenError)
            }
          })
          .run(givenNode, function (error) {
            assert.equal(error, givenError)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should yield an error when passed to a transformer’s `next` (async)',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              setImmediate(tick)
              function tick() {
                next(givenError)
              }
            }
          })
          .run(givenNode, function (error) {
            assert.equal(error, givenError)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should yield a tree when passed to a transformer’s `next` (sync)',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              next(undefined, otherNode)
            }
          })
          .run(givenNode, function (error, tree) {
            assert.equal(error, undefined)
            assert.equal(tree, otherNode)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should yield a tree when passed to a transformer’s `next` (async)',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              setImmediate(tick)
              function tick() {
                next(undefined, otherNode)
              }
            }
          })
          .run(givenNode, function (error, tree) {
            assert.equal(error, undefined)
            assert.equal(tree, otherNode)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should yield an error when rejected from a transformer',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function () {
              return new Promise(function (resolve, reject) {
                reject(givenError)
              })
            }
          })
          .run(givenNode, function (error) {
            assert.equal(error, givenError)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should yield a tree when resolved from a transformer',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function () {
              return new Promise(function (resolve) {
                resolve(otherNode)
              })
            }
          })
          .run(givenNode, function (error, tree) {
            assert.equal(error, undefined)
            assert.equal(tree, otherNode)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should swallow further errors when passed to a transformer’s `next` (sync)',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              next()
              // To do: should this actually throw?
              next(new Error('delta'))
            }
          })
          .run(givenNode, function (error) {
            assert.equal(error, undefined)
            resolve(undefined)
          })
      })
    }
  )

  await t.test(
    'should swallow further errors when passed to a transformer’s `next` (async)',
    async function () {
      await new Promise(function (resolve) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              setImmediate(tick1)

              function tick1() {
                next()
                setImmediate(tick2)
              }

              function tick2() {
                next(new Error('echo'))
              }
            }
          })
          .run(givenNode, function (error) {
            assert.equal(error, undefined)
            resolve(undefined)
          })
      })
    }
  )

  // To do: test to swallow further trees?

  await t.test('should support `async function`s', async function () {
    await new Promise(function (resolve) {
      unified()
        // Async transformer w/o return statement.
        .use(function () {
          return async function () {}
        })
        // Async transformer w/ explicit `undefined`.
        .use(function () {
          return async function () {
            return undefined
          }
        })
        .use(function () {
          return async function (tree, file) {
            assert.equal(tree, givenNode)
            assert.equal(file, givenFile)
            assert.equal(arguments.length, 2)
            return otherNode
          }
        })
        .run(givenNode, givenFile, function (error, tree, file) {
          assert.equal(error, undefined)
          assert.equal(tree, otherNode)
          assert.equal(file, givenFile)
          resolve(undefined)
        })
    })
  })

  await t.test(
    'should pass/yield expected values (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .run(givenNode, givenFile)
          .then(function (tree) {
            assert.equal(tree, givenNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test(
    'should pass a file if implicitly not given (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .run(givenNode, undefined)
          .then(function (tree) {
            assert.equal(tree, givenNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test(
    'should pass a file if explicitly not given (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .run(givenNode)
          .then(function (tree) {
            assert.equal(tree, givenNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test(
    'should yield an error returned from a sync transformer (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function () {
              return givenError
            }
          })
          .run(givenNode)
          .then(
            function () {
              reject(new Error('should reject'))
            },
            /**
             * @param {unknown} error
             */
            function (error) {
              assert.equal(error, givenError)
              resolve(undefined)
            }
          )
      })
    }
  )

  await t.test(
    'should yield a tree when returned from a sync transformer (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function () {
              return otherNode
            }
          })
          .run(givenNode)
          .then(function (tree) {
            assert.equal(tree, otherNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test(
    'should yield an error when passed to a transformer’s `next` (sync) (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              next(givenError)
            }
          })
          .run(givenNode)
          .then(
            function () {
              reject(new Error('should reject'))
            },
            /**
             * @param {unknown} error
             */
            function (error) {
              assert.equal(error, givenError)
              resolve(undefined)
            }
          )
      })
    }
  )

  await t.test(
    'should yield an error when passed to a transformer’s `next` (async) (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              setImmediate(function () {
                next(givenError)
              })
            }
          })
          .run(givenNode)
          .then(
            function () {
              reject(new Error('should reject'))
            },
            /**
             * @param {unknown} error
             */
            function (error) {
              assert.equal(error, givenError)
              resolve(undefined)
            }
          )
      })
    }
  )

  await t.test(
    'should yield a tree when passed to a transformer’s `next` (sync) (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              next(undefined, otherNode)
            }
          })
          .run(givenNode)
          .then(function (tree) {
            assert.equal(tree, otherNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test(
    'should yield a tree when passed to a transformer’s `next` (async) (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              setImmediate(function () {
                next(undefined, otherNode)
              })
            }
          })
          .run(givenNode)
          .then(function (tree) {
            assert.equal(tree, otherNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test(
    'should yield an error when rejected from a transformer (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function () {
              return new Promise(function (resolve, reject) {
                reject(givenError)
              })
            }
          })
          .run(givenNode)
          .then(
            function () {
              reject(new Error('should reject'))
            },
            /**
             * @param {unknown} error
             */
            function (error) {
              assert.equal(error, givenError)
              resolve(undefined)
            }
          )
      })
    }
  )

  await t.test(
    'should yield a tree when resolved from a transformer (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function () {
              return new Promise(function (resolve) {
                resolve(otherNode)
              })
            }
          })
          .run(givenNode)
          .then(function (tree) {
            assert.equal(tree, otherNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test(
    'should swallow further errors when passed to a transformer’s `next` (sync) (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              next()
              next(givenError)
            }
          })
          .run(givenNode)
          .then(function (tree) {
            assert.equal(tree, givenNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test(
    'should swallow further errors when passed to a transformer’s `next` (async) (promise)',
    async function () {
      await new Promise(function (resolve, reject) {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              setImmediate(function () {
                next()
                next(givenError)
              })
            }
          })
          .run(givenNode)
          .then(function (tree) {
            assert.equal(tree, givenNode)
            resolve(undefined)
          }, reject)
      })
    }
  )

  await t.test('should support `async function`s (promise)', async function () {
    await new Promise(function (resolve, reject) {
      unified()
        // Async transformer w/o return statement.
        .use(function () {
          return async function () {}
        })
        // Async transformer w/ explicit `undefined`.
        .use(function () {
          return async function () {
            return undefined
          }
        })
        .use(function () {
          return async function (tree, file) {
            assert.equal(tree, givenNode)
            assert.equal(file, givenFile)
            assert.equal(arguments.length, 2)
            return otherNode
          }
        })
        .run(givenNode, givenFile)
        .then(function (tree) {
          assert.equal(tree, otherNode)
          resolve(undefined)
        }, reject)
    })
  })
})
