/**
 * @typedef {import('unified').Plugin} Plugin
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {SimpleCompiler, SimpleParser} from './util/simple.js'

test('freeze()', async (t) => {
  const frozen = unified()
    .use(function () {
      // Note: TS has a bug so setting `this.Parser` and such doesn’t work,
      // but assigning is fine.
      Object.assign(this, {
        Parser: SimpleParser,
        Compiler: SimpleCompiler
      })
    })
    .freeze()
  const unfrozen = frozen()

  assert.doesNotThrow(() => {
    unfrozen.data()
  }, '`data` can be called on unfrozen interfaces')

  assert.throws(
    () => {
      frozen.data('foo', 'bar')
    },
    /Cannot call `data` on a frozen processor/,
    '`data` cannot be called on frozen interfaces'
  )

  assert.throws(
    () => {
      // @ts-expect-error: `use` does not exist on frozen processors.
      frozen.use()
    },
    /Cannot call `use` on a frozen processor/,
    '`use` cannot be called on frozen interfaces'
  )

  assert.doesNotThrow(() => {
    frozen.parse()
  }, '`parse` can be called on frozen interfaces')

  assert.doesNotThrow(() => {
    frozen.stringify({type: 'foo'})
  }, '`stringify` can be called on frozen interfaces')

  assert.doesNotThrow(() => {
    frozen.runSync({type: 'foo'})
  }, '`runSync` can be called on frozen interfaces')

  assert.doesNotThrow(() => {
    frozen.run({type: 'foo'}, () => {})
  }, '`run` can be called on frozen interfaces')

  assert.doesNotThrow(() => {
    frozen.processSync('')
  }, '`processSync` can be called on frozen interfaces')

  assert.doesNotThrow(() => {
    frozen.process('', () => {})
  }, '`process` can be called on frozen interfaces')

  await t.test('should freeze once, even for nested calls', () => {
    let index = 0
    const processor = unified()
      .use(() => {
        assert.ok(true, 'Expected: ' + String(index++))
      })
      .use({plugins: [freezingPlugin]})
      .use({plugins: [freezingPlugin]})
      .freeze()

    processor().freeze()

    /**
     * @this {import('../index.js').Processor}
     * @type {Plugin}
     */
    function freezingPlugin() {
      this.freeze()
    }
  })
})
