/**
 * @typedef {import('..').YieldingTransformer} YieldingTransformer
 * @typedef {import('..').Preset} Preset
 */

import test from 'tape'
import {unified} from '../index.js'

test('use(plugin[, options])', (t) => {
  t.test('should ignore missing values', (t) => {
    const processor = unified()
    // @ts-expect-error: runtime feature.
    t.equal(processor.use(), processor, 'missing')
    // @ts-expect-error: runtime feature.
    t.equal(processor.use(null), processor, '`null`')
    // @ts-expect-error: runtime feature.
    t.equal(processor.use(undefined), processor, '`undefined`')
    t.end()
  })

  t.test('should throw when given invalid values', (t) => {
    t.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use(false)
      },
      /^TypeError: Expected usable value, not `false`$/,
      '`false`'
    )

    t.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use(true)
      },
      /^TypeError: Expected usable value, not `true`$/,
      '`true`'
    )

    t.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use('alfred')
      },
      /^TypeError: Expected usable value, not `alfred`$/,
      '`string`'
    )

    t.end()
  })

  t.test('should support plugin and options', (t) => {
    const processor = unified()
    const givenOptions = {}

    t.plan(2)

    processor
      .use(function (options) {
        t.equal(
          this,
          processor,
          'should call a plugin with `processor` as the context'
        )
        t.equal(options, givenOptions, 'should call a plugin with `options`')
      }, givenOptions)
      .freeze()
  })

  t.test('should support a list of plugins', (t) => {
    const processor = unified()

    t.plan(2)

    processor
      .use([
        function () {
          t.equal(this, processor, 'should support a list of plugins (#1)')
        },
        function () {
          t.equal(this, processor, 'should support a list of plugins (#2)')
        }
      ])
      .freeze()
  })

  t.test('should support a list of one plugin', (t) => {
    const processor = unified()

    t.plan(1)

    processor
      .use([
        function () {
          t.equal(this, processor, 'should support a list of plugins (#2)')
        }
      ])
      .freeze()
  })

  t.test('should support a list of plugins and arguments', (t) => {
    const processor = unified()
    const givenOptions = {}

    t.plan(2)

    processor
      .use([
        [
          /** @param {unknown} options */
          function (options) {
            t.equal(
              options,
              givenOptions,
              'should support arguments with options'
            )
          },
          givenOptions
        ],
        [
          function () {
            t.equal(
              this,
              processor,
              'should support a arguments without options'
            )
          }
        ]
      ])
      .freeze()
  })

  t.test('should throw when given invalid values in lists', (t) => {
    t.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use([false])
      },
      /^TypeError: Expected usable value, not `false`$/,
      '`false`'
    )

    t.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use([true])
      },
      /^TypeError: Expected usable value, not `true`$/,
      '`true`'
    )

    t.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use(['alfred'])
      },
      /^TypeError: Expected usable value, not `alfred`$/,
      '`string`'
    )

    t.end()
  })

  t.test('should reconfigure objects', (t) => {
    const leftOptions = {foo: true, bar: true}
    const rightOptions = {foo: false, qux: true}

    t.plan(4)

    unified().use(change, 'this').use(change, rightOptions).freeze()
    unified().use(change).use(change, rightOptions).freeze()
    unified().use(change, [1, 2, 3]).use(change, rightOptions).freeze()
    unified().use(merge, leftOptions).use(merge, rightOptions).freeze()

    /** @param {unknown} [options] */
    function change(options) {
      t.deepEqual(options, {foo: false, qux: true}, 'should reconfigure (set)')
    }

    /** @param {Record<string, boolean>} options */
    function merge(options) {
      t.deepEqual(
        options,
        {foo: false, bar: true, qux: true},
        'should reconfigure (merge)'
      )
    }
  })

  t.test('should reconfigure strings', (t) => {
    t.plan(4)

    unified().use(plugin, 'this').use(plugin, 'that').freeze()
    unified().use(plugin).use(plugin, 'that').freeze()
    unified().use(plugin, [1, 2, 3]).use(plugin, 'that').freeze()
    unified().use(plugin, {foo: 'bar'}).use(plugin, 'that').freeze()

    /** @param {unknown} [options] */
    function plugin(options) {
      t.equal(options, 'that', 'should reconfigure')
    }
  })

  t.test('should reconfigure arrays', (t) => {
    t.plan(4)

    unified().use(plugin, [1, 2, 3]).use(plugin, [4, 5, 6]).freeze()
    unified().use(plugin).use(plugin, [4, 5, 6]).freeze()
    unified().use(plugin, {foo: 'true'}).use(plugin, [4, 5, 6]).freeze()
    unified().use(plugin, 'foo').use(plugin, [4, 5, 6]).freeze()

    /** @param {unknown} [options] */
    function plugin(options) {
      t.deepEqual(options, [4, 5, 6], 'should reconfigure')
    }
  })

  t.test('should reconfigure to turn off', (t) => {
    const processor = unified()

    t.doesNotThrow(() => {
      processor.use([[plugin], [plugin, false]]).freeze()

      function plugin() {
        throw new Error('Error')
      }
    })

    t.end()
  })

  t.test('should reconfigure to turn on (boolean)', (t) => {
    const processor = unified()

    t.plan(1)

    processor
      .use([
        [plugin, false],
        [plugin, true]
      ])
      .freeze()

    function plugin() {
      t.pass('should reconfigure')
    }
  })

  t.test('should reconfigure to turn on (options)', (t) => {
    const processor = unified()

    t.plan(1)

    processor
      .use([
        [plugin, false],
        [plugin, {foo: true}]
      ])
      .freeze()

    /** @param {unknown} [options] */
    function plugin(options) {
      t.deepEqual(options, {foo: true}, 'should reconfigure')
    }
  })

  t.test('should attach transformers', (t) => {
    const processor = unified()
    const givenNode = {type: 'test'}

    t.plan(3)

    processor
      .use(() => {
        /** @type {YieldingTransformer} */
        return function (node, file) {
          t.equal(node, givenNode, 'should attach a transformer (#1)')
          t.ok('message' in file, 'should attach a transformer (#2)')

          throw new Error('Alpha bravo charlie')
        }
      })
      .freeze()

    t.throws(
      () => {
        processor.runSync(givenNode)
      },
      /Error: Alpha bravo charlie/,
      'should attach a transformer (#3)'
    )
  })

  t.end()
})

test('use(preset)', (t) => {
  t.throws(
    () => {
      // @ts-expect-error: runtime.
      unified().use({plugins: false})
    },
    /^TypeError: Expected a list of plugins, not `false`$/,
    'should throw on invalid `plugins` (1)'
  )

  t.throws(
    () => {
      // @ts-expect-error: runtime.
      unified().use({plugins: {foo: true}})
    },
    /^TypeError: Expected a list of plugins, not `\[object Object]`$/,
    'should throw on invalid `plugins` (2)'
  )

  t.test('should support empty presets', (t) => {
    const processor = unified().use({}).freeze()
    t.equal(processor.attachers.length, 0)
    t.end()
  })

  t.test('should support presets with empty plugins', (t) => {
    const processor = unified().use({plugins: []}).freeze()
    t.equal(processor.attachers.length, 0)
    t.end()
  })

  t.test('should support presets with empty settings', (t) => {
    const processor = unified().use({settings: {}}).freeze()
    t.deepEqual(processor.data(), {settings: {}})
    t.end()
  })

  t.test('should support presets with a plugin', (t) => {
    t.plan(2)

    const processor = unified()
      .use({plugins: [plugin]})
      .freeze()

    t.equal(processor.attachers.length, 1)

    function plugin() {
      t.pass()
    }
  })

  t.test('should support presets with plugins', (t) => {
    const processor = unified()
      .use({plugins: [plugin1, plugin2]})
      .freeze()

    t.plan(3)
    t.equal(processor.attachers.length, 2)

    function plugin1() {
      t.pass()
    }

    function plugin2() {
      t.pass()
    }
  })

  t.test('should support presets with settings', (t) => {
    const processor = unified()
      .use({settings: {foo: true}})
      .freeze()
    t.deepEqual(processor.data('settings'), {foo: true})
    t.end()
  })

  t.test('should merge multiple presets with settings', (t) => {
    const data = unified()
      .use({settings: {foo: true, bar: true}})
      .use({settings: {qux: true, foo: false}})
      .data()

    t.deepEqual(data.settings, {foo: false, bar: true, qux: true})
    t.end()
  })

  t.test('should support extending presets', (t) => {
    const processor = unified()
      .use({settings: {alpha: true}, plugins: [plugin1, plugin2]})
      .freeze()
    const otherProcessor = processor().freeze()

    t.plan(7)
    t.equal(processor.attachers.length, 2, '1')
    t.equal(otherProcessor.attachers.length, 2, '2')
    t.deepEqual(otherProcessor.data('settings'), {alpha: true}, '3')

    function plugin1() {
      t.pass('a')
    }

    function plugin2() {
      t.pass('b')
    }
  })

  t.test('should support presets with plugins as a matrix', (t) => {
    const one = {}
    const two = {}
    const processor = unified()
      .use({
        plugins: [
          [plugin1, one],
          [plugin2, two]
        ]
      })
      .freeze()
    const otherProcessor = processor().freeze()

    t.plan(6)
    t.equal(processor.attachers.length, 2, '1')
    t.equal(otherProcessor.attachers.length, 2, '2')

    /**
     * @param {unknown} options
     */
    function plugin1(options) {
      t.equal(options, one, 'a')
    }

    /**
     * @param {unknown} options
     */
    function plugin2(options) {
      t.equal(options, two, 'b')
    }
  })

  t.test('should support nested presets', (t) => {
    const one = {}
    const two = {}
    const processor = unified()
      .use({
        plugins: [{plugins: [[plugin1, one]]}, {plugins: [[plugin2, two]]}]
      })
      .freeze()
    const otherProcessor = processor().freeze()

    t.plan(6)
    t.equal(processor.attachers.length, 2, '1')
    t.equal(otherProcessor.attachers.length, 2, '2')

    /** @param {unknown} [options] */
    function plugin1(options) {
      t.equal(options, one, 'a')
    }

    /** @param {unknown} [options] */
    function plugin2(options) {
      t.equal(options, two, 'b')
    }
  })

  t.end()
})
