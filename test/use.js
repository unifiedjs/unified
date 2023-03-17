/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('vfile').VFile} VFile
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from '../index.js'

test('use(plugin[, options])', async (t) => {
  await t.test('should ignore missing values', () => {
    const processor = unified()
    // @ts-expect-error: runtime feature.
    assert.equal(processor.use(), processor, 'missing')
    // @ts-expect-error: runtime feature.
    assert.equal(processor.use(null), processor, '`null`')
    // @ts-expect-error: runtime feature.
    assert.equal(processor.use(undefined), processor, '`undefined`')
  })

  await t.test('should throw when given invalid values', () => {
    assert.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use(false)
      },
      /^TypeError: Expected usable value, not `false`$/,
      '`false`'
    )

    assert.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use(true)
      },
      /^TypeError: Expected usable value, not `true`$/,
      '`true`'
    )

    assert.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use('alfred')
      },
      /^TypeError: Expected usable value, not `alfred`$/,
      '`string`'
    )
  })

  await t.test('should support plugin and options', () => {
    const processor = unified()
    const givenOptions = {}

    processor
      .use(function (options) {
        assert.equal(
          this,
          processor,
          'should call a plugin with `processor` as the context'
        )
        assert.equal(
          options,
          givenOptions,
          'should call a plugin with `options`'
        )
      }, givenOptions)
      .freeze()
  })

  await t.test('should support a list of plugins', () => {
    const processor = unified()

    processor
      .use([
        function () {
          assert.equal(this, processor, 'should support a list of plugins (#1)')
        },
        function () {
          assert.equal(this, processor, 'should support a list of plugins (#2)')
        }
      ])
      .freeze()
  })

  await t.test('should support a list of one plugin', () => {
    const processor = unified()

    processor
      .use([
        function () {
          assert.equal(this, processor, 'should support a list of plugins (#2)')
        }
      ])
      .freeze()
  })

  await t.test('should support a list of plugins and arguments', () => {
    const processor = unified()
    const givenOptions = {}

    processor
      .use([
        [
          /** @param {unknown} options */
          function (options) {
            assert.equal(
              options,
              givenOptions,
              'should support arguments with options'
            )
          },
          givenOptions
        ],
        [
          function () {
            assert.equal(
              this,
              processor,
              'should support a arguments without options'
            )
          }
        ]
      ])
      .freeze()
  })

  await t.test('should throw when given invalid values in lists', () => {
    assert.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use([false])
      },
      /^TypeError: Expected usable value, not `false`$/,
      '`false`'
    )

    assert.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use([true])
      },
      /^TypeError: Expected usable value, not `true`$/,
      '`true`'
    )

    assert.throws(
      () => {
        // @ts-expect-error: runtime.
        unified().use(['alfred'])
      },
      /^TypeError: Expected usable value, not `alfred`$/,
      '`string`'
    )
  })

  await t.test('should reconfigure objects', () => {
    const leftOptions = {foo: true, bar: true}
    const rightOptions = {foo: false, qux: true}

    unified().use(change, 'this').use(change, rightOptions).freeze()
    unified().use(change).use(change, rightOptions).freeze()
    unified().use(change, [1, 2, 3]).use(change, rightOptions).freeze()
    unified().use(merge, leftOptions).use(merge, rightOptions).freeze()

    /** @param {unknown} [options] */
    function change(options) {
      assert.deepEqual(
        options,
        {foo: false, qux: true},
        'should reconfigure (set)'
      )
    }

    /** @param {Record<string, boolean>} options */
    function merge(options) {
      assert.deepEqual(
        options,
        {foo: false, bar: true, qux: true},
        'should reconfigure (merge)'
      )
    }
  })

  await t.test('should reconfigure strings', () => {
    unified().use(plugin, 'this').use(plugin, 'that').freeze()
    unified().use(plugin).use(plugin, 'that').freeze()
    unified().use(plugin, [1, 2, 3]).use(plugin, 'that').freeze()
    unified().use(plugin, {foo: 'bar'}).use(plugin, 'that').freeze()

    /** @param {unknown} [options] */
    function plugin(options) {
      assert.equal(options, 'that', 'should reconfigure')
    }
  })

  await t.test('should reconfigure arrays', () => {
    unified().use(plugin, [1, 2, 3]).use(plugin, [4, 5, 6]).freeze()
    unified().use(plugin).use(plugin, [4, 5, 6]).freeze()
    unified().use(plugin, {foo: 'true'}).use(plugin, [4, 5, 6]).freeze()
    unified().use(plugin, 'foo').use(plugin, [4, 5, 6]).freeze()

    /** @param {unknown} [options] */
    function plugin(options) {
      assert.deepEqual(options, [4, 5, 6], 'should reconfigure')
    }
  })

  await t.test('should reconfigure to turn off', () => {
    const processor = unified()

    assert.doesNotThrow(() => {
      processor.use([[plugin], [plugin, false]]).freeze()

      function plugin() {
        throw new Error('Error')
      }
    })
  })

  await t.test('should reconfigure to turn on (boolean)', () => {
    const processor = unified()
    let called = false

    processor
      .use([
        [plugin, false],
        [plugin, true]
      ])
      .freeze()

    assert.ok(called, 'should reconfigure')

    function plugin() {
      called = true
    }
  })

  await t.test('should reconfigure to turn on (options)', () => {
    const processor = unified()

    processor
      .use([
        [plugin, false],
        [plugin, {foo: true}]
      ])
      .freeze()

    /** @param {unknown} [options] */
    function plugin(options) {
      assert.deepEqual(options, {foo: true}, 'should reconfigure')
    }
  })

  await t.test('should attach transformers', () => {
    const processor = unified()
    const givenNode = {type: 'test'}
    const condition = true

    processor
      .use(
        () =>
          /**
           * @param {Node} node
           * @param {VFile} file
           */
          function (node, file) {
            assert.equal(node, givenNode, 'should attach a transformer (#1)')
            assert.ok('message' in file, 'should attach a transformer (#2)')

            if (condition) {
              throw new Error('Alpha bravo charlie')
            }
          }
      )
      .freeze()

    assert.throws(
      () => {
        processor.runSync(givenNode)
      },
      /Error: Alpha bravo charlie/,
      'should attach a transformer (#3)'
    )
  })
})

test('use(preset)', async (t) => {
  assert.throws(
    () => {
      // @ts-expect-error: runtime.
      unified().use({plugins: false})
    },
    /^TypeError: Expected a list of plugins, not `false`$/,
    'should throw on invalid `plugins` (1)'
  )

  assert.throws(
    () => {
      // @ts-expect-error: runtime.
      unified().use({plugins: {foo: true}})
    },
    /^TypeError: Expected a list of plugins, not `\[object Object]`$/,
    'should throw on invalid `plugins` (2)'
  )

  await t.test('should support empty presets', () => {
    const processor = unified().use({}).freeze()
    assert.equal(processor.attachers.length, 0)
  })

  await t.test('should support presets with empty plugins', () => {
    const processor = unified().use({plugins: []}).freeze()
    assert.equal(processor.attachers.length, 0)
  })

  await t.test('should support presets with empty settings', () => {
    const processor = unified().use({settings: {}}).freeze()
    assert.deepEqual(processor.data(), {settings: {}})
  })

  await t.test('should support presets with a plugin', () => {
    let called = false
    const processor = unified()
      .use({plugins: [plugin]})
      .freeze()

    assert.equal(processor.attachers.length, 1)
    assert.ok(called)

    function plugin() {
      called = true
    }
  })

  await t.test('should support presets with plugins', () => {
    let calls = 0
    const processor = unified()
      .use({plugins: [plugin1, plugin2]})
      .freeze()

    assert.equal(processor.attachers.length, 2)
    assert.equal(calls, 2)

    function plugin1() {
      calls++
    }

    function plugin2() {
      calls++
    }
  })

  await t.test('should support presets with settings', () => {
    const processor = unified()
      .use({settings: {foo: true}})
      .freeze()
    assert.deepEqual(processor.data('settings'), {foo: true})
  })

  await t.test('should merge multiple presets with settings', () => {
    const data = unified()
      .use({settings: {foo: true, bar: true}})
      .use({settings: {qux: true, foo: false}})
      .data()

    assert.deepEqual(data.settings, {foo: false, bar: true, qux: true})
  })

  await t.test('should support extending presets', () => {
    let calls = 0
    const processor = unified()
      .use({settings: {alpha: true}, plugins: [plugin1, plugin2]})
      .freeze()
    const otherProcessor = processor().freeze()

    assert.equal(processor.attachers.length, 2, '1')
    assert.equal(otherProcessor.attachers.length, 2, '2')
    assert.deepEqual(otherProcessor.data('settings'), {alpha: true}, '3')
    assert.equal(calls, 4)

    function plugin1() {
      calls++
    }

    function plugin2() {
      calls++
    }
  })

  await t.test('should support presets with plugins as a matrix', () => {
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

    assert.equal(processor.attachers.length, 2, '1')
    assert.equal(otherProcessor.attachers.length, 2, '2')

    /**
     * @param {unknown} options
     */
    function plugin1(options) {
      assert.equal(options, one, 'a')
    }

    /**
     * @param {unknown} options
     */
    function plugin2(options) {
      assert.equal(options, two, 'b')
    }
  })

  await t.test('should support nested presets', () => {
    const one = {}
    const two = {}
    const processor = unified()
      .use({
        plugins: [{plugins: [[plugin1, one]]}, {plugins: [[plugin2, two]]}]
      })
      .freeze()
    const otherProcessor = processor().freeze()

    assert.equal(processor.attachers.length, 2, '1')
    assert.equal(otherProcessor.attachers.length, 2, '2')

    /** @param {unknown} [options] */
    function plugin1(options) {
      assert.equal(options, one, 'a')
    }

    /** @param {unknown} [options] */
    function plugin2(options) {
      assert.equal(options, two, 'b')
    }
  })
})
