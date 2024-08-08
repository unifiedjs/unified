/**
 * @import {Plugin} from 'unified'
 * @import {Node} from 'unist'
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {simpleCompiler, simpleParser} from './util/simple.js'

test('`freeze`', async function (t) {
  const frozen = unified().use(parse).use(compile).freeze()

  const unfrozen = frozen()

  await t.test('data', async function (t) {
    await t.test(
      'should be able to call `data()` (getter) when not frozen',
      async function () {
        unfrozen.data()
      }
    )

    await t.test(
      'should be able to call `data()` (getter) when frozen',
      async function () {
        frozen.data()
      }
    )

    await t.test(
      'should be able to call `data(key)` (getter) when not frozen',
      async function () {
        unfrozen.data('x')
      }
    )

    await t.test(
      'should be able to call `data(key)` (getter) when frozen',
      async function () {
        frozen.data('x')
      }
    )

    await t.test(
      'should be able to call `data(value)` (setter) when not frozen',
      async function () {
        unfrozen.data({foo: 'bar'})
      }
    )

    await t.test(
      'should not be able to call `data(value)` (setter) when frozen',
      async function () {
        assert.throws(function () {
          frozen.data({foo: 'bar'})
        }, /Cannot call `data` on a frozen processor/)
      }
    )

    await t.test(
      'should be able to call `data(key, value)` (setter) when not frozen',
      async function () {
        unfrozen.data('foo', 'bar')
      }
    )

    await t.test(
      'should not be able to call `data(key, value)` (setter) when frozen',
      async function () {
        assert.throws(function () {
          frozen.data('foo', 'bar')
        }, /Cannot call `data` on a frozen processor/)
      }
    )
  })

  await t.test('parse', async function (t) {
    await t.test(
      'should be able to call `parse` when not frozen',
      async function () {
        unfrozen.parse()
      }
    )

    await t.test(
      'should be able to call `parse` when frozen',
      async function () {
        frozen.parse()
      }
    )
  })

  await t.test('stringify', async function (t) {
    await t.test(
      'should be able to call `stringify` when not frozen',
      async function () {
        unfrozen.stringify({type: 'foo'})
      }
    )

    await t.test(
      'should be able to call `stringify` when frozen',
      async function () {
        frozen.stringify({type: 'foo'})
      }
    )
  })

  await t.test('run', async function (t) {
    await t.test(
      'should be able to call `run` when not frozen',
      async function () {
        await unfrozen.run({type: 'foo'})
      }
    )

    await t.test('should be able to call `run` when frozen', async function () {
      await frozen.run({type: 'foo'})
    })
  })

  await t.test('runSync', async function (t) {
    await t.test(
      'should be able to call `runSync` when not frozen',
      async function () {
        unfrozen.runSync({type: 'foo'})
      }
    )

    await t.test(
      'should be able to call `runSync` when frozen',
      async function () {
        frozen.runSync({type: 'foo'})
      }
    )
  })

  await t.test('process', async function (t) {
    await t.test(
      'should be able to call `process` when not frozen',
      async function () {
        await unfrozen.process('')
      }
    )

    await t.test(
      'should be able to call `process` when frozen',
      async function () {
        await frozen.process('')
      }
    )
  })

  await t.test('processSync', async function (t) {
    await t.test(
      'should be able to call `processSync` when not frozen',
      async function () {
        unfrozen.processSync('')
      }
    )

    await t.test(
      'should be able to call `processSync` when frozen',
      async function () {
        frozen.processSync('')
      }
    )
  })

  await t.test('freeze', async function (t) {
    await t.test(
      'should be able to call `freeze` when not frozen',
      async function () {
        unfrozen.freeze()
      }
    )

    await t.test(
      'should be able to call `freeze` when frozen',
      async function () {
        frozen.freeze()
      }
    )

    await t.test('should freeze once, even for nested calls', function () {
      let index = 0

      const processor = unified()
        .use(function () {
          index++
        })
        .use({
          plugins: [
            function () {
              this.freeze()
            }
          ]
        })
        .use({
          plugins: [
            function () {
              this.freeze()
            }
          ]
        })
        .freeze()
        // To show it doesn’t do anything.
        .freeze()

      assert.equal(index, 1)

      processor()
        .freeze()
        // To show it doesn’t do anything.
        .freeze()

      assert.equal(index, 2)
    })
  })
})

// `this` in JS is buggy in TS.
/**
 * @type {Plugin<[], string, Node>}
 */
function parse() {
  this.parser = simpleParser
}

// `this` in JS is buggy in TS.
/**
 * @type {Plugin<[], Node, string>}
 */
function compile() {
  this.compiler = simpleCompiler
}
