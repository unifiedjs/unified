/**
 * @typedef {import('..').Plugin} Plugin
 */

import test from 'tape'
import {unified} from '../index.js'
import {SimpleCompiler, SimpleParser} from './util/simple.js'

test('freeze()', (t) => {
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

  t.doesNotThrow(() => {
    unfrozen.data()
  }, '`data` can be called on unfrozen interfaces')

  t.throws(
    () => {
      frozen.data('foo', 'bar')
    },
    /Cannot call `data` on a frozen processor/,
    '`data` cannot be called on frozen interfaces'
  )

  t.throws(
    () => {
      // @ts-expect-error: `use` does not exist on frozen processors.
      frozen.use()
    },
    /Cannot call `use` on a frozen processor/,
    '`use` cannot be called on frozen interfaces'
  )

  t.doesNotThrow(() => {
    frozen.parse()
  }, '`parse` can be called on frozen interfaces')

  t.doesNotThrow(() => {
    frozen.stringify({type: 'foo'})
  }, '`stringify` can be called on frozen interfaces')

  t.doesNotThrow(() => {
    frozen.runSync({type: 'foo'})
  }, '`runSync` can be called on frozen interfaces')

  t.doesNotThrow(() => {
    frozen.run({type: 'foo'}, () => {})
  }, '`run` can be called on frozen interfaces')

  t.doesNotThrow(() => {
    frozen.processSync('')
  }, '`processSync` can be called on frozen interfaces')

  t.doesNotThrow(() => {
    frozen.process('', () => {})
  }, '`process` can be called on frozen interfaces')

  t.test('should freeze once, even for nested calls', (t) => {
    t.plan(2)

    let index = 0
    const processor = unified()
      .use(() => {
        t.pass('Expected: ' + String(index++))
      })
      .use({plugins: [freezingPlugin]})
      .use({plugins: [freezingPlugin]})
      .freeze()

    processor().freeze()

    /** @type {Plugin} */
    function freezingPlugin() {
      this.freeze()
    }
  })

  t.end()
})
