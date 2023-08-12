import process from 'node:process'
import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {VFile} from 'vfile'

test('`runSync`', async function (t) {
  const givenFile = new VFile('alpha')
  const givenNode = {type: 'bravo'}
  const otherNode = {type: 'charlie'}
  const givenError = new Error('delta')

  await t.test('should throw w/o `tree`', async function () {
    assert.throws(function () {
      unified()
        // @ts-expect-error: check how missing `node` is handled.
        .runSync()
    }, /Expected node, got `undefined`/)
  })

  await t.test('should pass/yield expected values', async function () {
    assert.equal(unified().runSync(givenNode, givenFile), givenNode)
  })

  await t.test(
    'should throw an error returned from a sync transformer',
    async function () {
      assert.throws(function () {
        unified()
          .use(function () {
            return function () {
              return givenError
            }
          })
          .runSync(givenNode)
      }, givenError)
    }
  )

  await t.test(
    'should yield a tree when returned from a sync transformer',
    async function () {
      assert.equal(
        unified()
          .use(function () {
            return function () {
              return otherNode
            }
          })
          .runSync(givenNode),
        otherNode
      )
    }
  )

  await t.test(
    'should throw an error when passed to a transformer’s `next` (sync)',
    async function () {
      assert.throws(function () {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              next(givenError)
            }
          })
          .runSync(givenNode)
      }, givenError)
    }
  )

  await t.test(
    'should throw and leave an error uncaught when passed to a transformer’s `next` (async)',
    async function () {
      await new Promise(function (resolve) {
        // @ts-expect-error: prevent the test runner from warning.
        const events = /** @type {Record<string, unknown>} */ (process._events)
        const current = events.uncaughtException
        events.uncaughtException = undefined

        process.once('uncaughtException', function (error) {
          assert.equal(error, givenError)
          events.uncaughtException = current
          resolve(undefined)
        })

        assert.throws(function () {
          unified()
            .use(function () {
              return function (_1, _2, next) {
                setImmediate(tick)

                function tick() {
                  next(givenError)
                }
              }
            })
            .runSync(givenNode)
        }, /`runSync` finished async. Use `run` instead/)
      })
    }
  )

  await t.test(
    'should yield a tree when passed to a transformer’s `next` (sync)',
    async function () {
      assert.equal(
        unified()
          .use(function () {
            return function (_1, _2, next) {
              next(undefined, otherNode)
            }
          })
          .runSync(givenNode),
        otherNode
      )
    }
  )

  await t.test(
    'should throw and ignore a tree when passed to a transformer’s `next` (async)',
    async function () {
      assert.throws(function () {
        unified()
          .use(function () {
            return function (_1, _2, next) {
              setImmediate(tick)

              function tick() {
                next(undefined, otherNode)
              }
            }
          })
          .runSync(givenNode)
      }, /`runSync` finished async. Use `run` instead/)
    }
  )

  await t.test(
    'should throw and leave an error unhandled when rejected from a transformer',
    async function () {
      await new Promise(function (resolve) {
        // @ts-expect-error: prevent the test runner from warning.
        const events = /** @type {Record<string, unknown>} */ (process._events)
        const current = events.unhandledRejection
        events.unhandledRejection = undefined

        process.once('unhandledRejection', function (error) {
          assert.equal(error, givenError)
          events.unhandledRejection = current
          resolve(undefined)
        })

        assert.throws(function () {
          unified()
            .use(function () {
              return async function () {
                throw givenError
              }
            })
            .runSync(givenNode)
        }, /`runSync` finished async. Use `run` instead/)
      })
    }
  )

  await t.test(
    'should throw and ignore a tree when resolved from a transformer',
    async function () {
      assert.throws(function () {
        unified()
          .use(function () {
            return function () {
              return new Promise(function (resolve) {
                resolve(otherNode)
              })
            }
          })
          .runSync(givenNode)
      }, /`runSync` finished async. Use `run` instead/)
    }
  )
})
