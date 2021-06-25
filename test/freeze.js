import test from 'tape'
import {SimpleCompiler, SimpleParser} from './util/simple.js'
import {unified} from '../index.js'

test('freeze()', (t) => {
  const frozen = unified().use(config).freeze()
  const unfrozen = frozen()

  function config() {
    this.Parser = SimpleParser
    this.Compiler = SimpleCompiler
  }

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
      .use(plugin)
      .use({plugins: [freezingPlugin]})
      .use({plugins: [freezingPlugin]})
      .freeze()

    processor().freeze()

    function plugin() {
      t.pass('Expected: ' + String(index++))
    }

    function freezingPlugin() {
      this.freeze()
    }
  })

  t.end()
})
