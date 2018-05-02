'use strict'

var test = require('tape')
var unified = require('..')

/* Plugins. */
test('use(plugin[, options])', function(t) {
  t.test('should ignore missing values', function(st) {
    var p = unified()
    st.equal(p.use(), p, 'missing')
    st.equal(p.use(null), p, '`null`')
    st.equal(p.use(undefined), p, '`undefined`')
    st.end()
  })

  t.test('should throw when given invalid values', function(st) {
    st.throws(
      function() {
        unified().use(false)
      },
      /^Error: Expected usable value, not `false`$/,
      '`false`'
    )

    st.throws(
      function() {
        unified().use(true)
      },
      /^Error: Expected usable value, not `true`$/,
      '`true`'
    )

    st.throws(
      function() {
        unified().use('alfred')
      },
      /^Error: Expected usable value, not `alfred`$/,
      '`string`'
    )

    st.end()
  })

  t.test('should support plugin and options', function(st) {
    var p = unified()
    var o = {}

    st.plan(2)

    p
      .use(function(options) {
        st.equal(
          this,
          p,
          'should invoke a plugin with `processor` as the context'
        )
        st.equal(options, o, 'should invoke a plugin with `options`')
      }, o)
      .freeze()
  })

  t.test('should support a list of plugins', function(st) {
    var p = unified()

    st.plan(2)

    p
      .use([
        function() {
          st.equal(this, p, 'should support a list of plugins (#1)')
        },
        function() {
          st.equal(this, p, 'should support a list of plugins (#2)')
        }
      ])
      .freeze()
  })

  t.test('should support a list of one plugin', function(st) {
    var p = unified()

    st.plan(1)

    p
      .use([
        function() {
          st.equal(this, p, 'should support a list of plugins (#2)')
        }
      ])
      .freeze()
  })

  t.test('should support a list of plugins and arguments', function(st) {
    var p = unified()
    var o = {}

    st.plan(2)

    p
      .use([
        [
          function(options) {
            st.equal(options, o, 'should support arguments with options')
          },
          o
        ],
        [
          function() {
            st.equal(this, p, 'should support a arguments without options')
          }
        ]
      ])
      .freeze()
  })

  t.test('should throw when given invalid values in lists', function(st) {
    st.throws(
      function() {
        unified().use([false])
      },
      /^Error: Expected usable value, not `false`$/,
      '`false`'
    )

    st.throws(
      function() {
        unified().use([true])
      },
      /^Error: Expected usable value, not `true`$/,
      '`true`'
    )

    st.throws(
      function() {
        unified().use(['alfred'])
      },
      /^Error: Expected usable value, not `alfred`$/,
      '`string`'
    )

    st.end()
  })

  t.test('should reconfigure objects', function(st) {
    var a = {foo: true, bar: true}
    var b = {foo: false, qux: true}

    st.plan(4)

    unified()
      .use(change, 'this')
      .use(change, b)
      .freeze()
    unified()
      .use(change)
      .use(change, b)
      .freeze()
    unified()
      .use(change, [1, 2, 3])
      .use(change, b)
      .freeze()
    unified()
      .use(merge, a)
      .use(merge, b)
      .freeze()

    function change(options) {
      st.deepEqual(options, {foo: false, qux: true}, 'should reconfigure (set)')
    }

    function merge(options) {
      st.deepEqual(
        options,
        {foo: false, bar: true, qux: true},
        'should reconfigure (merge)'
      )
    }
  })

  t.test('should reconfigure strings', function(st) {
    st.plan(4)

    unified()
      .use(plugin, 'this')
      .use(plugin, 'that')
      .freeze()
    unified()
      .use(plugin)
      .use(plugin, 'that')
      .freeze()
    unified()
      .use(plugin, [1, 2, 3])
      .use(plugin, 'that')
      .freeze()
    unified()
      .use(plugin, {foo: 'bar'})
      .use(plugin, 'that')
      .freeze()

    function plugin(options) {
      st.equal(options, 'that', 'should reconfigure')
    }
  })

  t.test('should reconfigure arrays', function(st) {
    st.plan(4)

    unified()
      .use(plugin, [1, 2, 3])
      .use(plugin, [4, 5, 6])
      .freeze()
    unified()
      .use(plugin)
      .use(plugin, [4, 5, 6])
      .freeze()
    unified()
      .use(plugin, {foo: 'true'})
      .use(plugin, [4, 5, 6])
      .freeze()
    unified()
      .use(plugin, 'foo')
      .use(plugin, [4, 5, 6])
      .freeze()

    function plugin(options) {
      st.deepEqual(options, [4, 5, 6], 'should reconfigure')
    }
  })

  t.test('should reconfigure to turn off', function(st) {
    var p = unified()

    st.doesNotThrow(function() {
      p.use([[plugin], [plugin, false]]).freeze()

      function plugin() {
        throw new Error('Error')
      }
    })

    st.end()
  })

  t.test('should reconfigure to turn on (boolean)', function(st) {
    var p = unified()

    st.plan(1)

    p.use([[plugin, false], [plugin, true]]).freeze()

    function plugin() {
      st.pass('should reconfigure')
    }
  })

  t.test('should reconfigure to turn on (options)', function(st) {
    var p = unified()

    st.plan(1)

    p.use([[plugin, false], [plugin, {foo: true}]]).freeze()

    function plugin(options) {
      st.deepEqual(options, {foo: true}, 'should reconfigure')
    }
  })

  t.test('should attach transformers', function(st) {
    var p = unified()
    var n = {type: 'test'}

    st.plan(3)

    p
      .use(function() {
        return function(node, file) {
          st.equal(node, n, 'should attach a transformer (#1)')
          st.ok('message' in file, 'should attach a transformer (#2)')

          throw new Error('Alpha bravo charlie')
        }
      })
      .freeze()

    st.throws(
      function() {
        p.runSync(n)
      },
      /Error: Alpha bravo charlie/,
      'should attach a transformer (#3)'
    )
  })

  t.end()
})

test('use(preset)', function(t) {
  t.throws(
    function() {
      unified().use({plugins: false})
    },
    /^Error: Expected a list of plugins, not `false`$/,
    'should throw on invalid `plugins` (1)'
  )

  t.throws(
    function() {
      unified().use({plugins: {foo: true}})
    },
    /^Error: Expected a list of plugins, not `\[object Object]`$/,
    'should throw on invalid `plugins` (2)'
  )

  t.test('should support empty presets', function(st) {
    var p = unified()
      .use({})
      .freeze()
    st.equal(p.attachers.length, 0)
    st.end()
  })

  t.test('should support presets with empty plugins', function(st) {
    var p = unified()
      .use({plugins: []})
      .freeze()
    st.equal(p.attachers.length, 0)
    st.end()
  })

  t.test('should support presets with empty settings', function(st) {
    var p = unified()
      .use({settings: {}})
      .freeze()
    st.deepEqual(p.data(), {settings: {}})
    st.end()
  })

  t.test('should support presets with a plugin', function(st) {
    st.plan(2)

    var p = unified()
      .use({plugins: [plugin]})
      .freeze()

    st.equal(p.attachers.length, 1)

    function plugin() {
      st.pass()
    }
  })

  t.test('should support presets with plugins', function(st) {
    var p = unified()
      .use({plugins: [a, b]})
      .freeze()

    st.plan(3)
    st.equal(p.attachers.length, 2)

    function a() {
      st.pass()
    }

    function b() {
      st.pass()
    }
  })

  t.test('should support presets with settings', function(st) {
    var p = unified()
      .use({settings: {foo: true}})
      .freeze()
    st.deepEqual(p.data('settings'), {foo: true})
    st.end()
  })

  t.test('should merge multiple presets with settings', function(st) {
    var data = unified()
      .use({settings: {foo: true, bar: true}})
      .use({settings: {qux: true, foo: false}})
      .data()

    st.deepEqual(data.settings, {foo: false, bar: true, qux: true})
    st.end()
  })

  t.test('should support extending presets', function(st) {
    var p = unified()
      .use({settings: {alpha: true}, plugins: [a, b]})
      .freeze()
    var q = p().freeze()

    st.plan(7)
    st.equal(p.attachers.length, 2, '1')
    st.equal(q.attachers.length, 2, '2')
    st.deepEqual(q.data('settings'), {alpha: true}, '3')

    function a() {
      st.pass('a')
    }

    function b() {
      st.pass('b')
    }
  })

  t.test('should support presets with plugins as a matrix', function(st) {
    var one = {}
    var two = {}
    var p = unified()
      .use({plugins: [[a, one], [b, two]]})
      .freeze()
    var q = p().freeze()

    st.plan(6)
    st.equal(p.attachers.length, 2, '1')
    st.equal(q.attachers.length, 2, '2')

    function a(options) {
      st.equal(options, one, 'a')
    }

    function b(options) {
      st.equal(options, two, 'b')
    }
  })

  t.test('should support nested presets', function(st) {
    var one = {}
    var two = {}
    var p1 = {plugins: [[a, one]]}
    var p2 = {plugins: [[b, two]]}
    var p = unified()
      .use({plugins: [p1, p2]})
      .freeze()
    var q = p().freeze()

    st.plan(6)
    st.equal(p.attachers.length, 2, '1')
    st.equal(q.attachers.length, 2, '2')

    function a(options) {
      st.equal(options, one, 'a')
    }

    function b(options) {
      st.equal(options, two, 'b')
    }
  })

  t.end()
})
