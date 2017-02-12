'use strict';

var test = require('tape');
var unified = require('..');

/* Plugins. */
test('use(plugin[, options])', function (t) {
  var p = unified();
  var o = {};
  var n;

  t.plan(11);

  p.use(function (options) {
    t.equal(this, p, 'should invoke a plugin with `processor` as the context');
    t.equal(options, o, 'should invoke a plugin with `options`');
  }, o);

  p.use([
    function () {
      t.equal(this, p, 'should support a list of plugins (#1)');
    },
    function () {
      t.equal(this, p, 'should support a list of plugins (#2)');
    }
  ]);

  p.use([function () {
    t.equal(this, p, 'should support a list of one plugin');
  }]);

  p.use([function (options) {
    t.equal(options, o, 'should support a plugin--options tuple');
  }, o]);

  p.use([
    [function (options) {
      t.equal(options, o, 'should support a matrix (#1)');
    }, o],
    [function () {
      t.equal(this, p, 'should support a matrix (#2)');
    }]
  ]);

  n = {type: 'test'};

  p.use(function () {
    return function (node, file) {
      t.equal(node, n, 'should attach a transformer (#1)');
      t.ok('message' in file, 'should attach a transformer (#2)');

      throw new Error('Alpha bravo charlie');
    };
  });

  t.throws(
    function () {
      p.run(n);
    },
    /Error: Alpha bravo charlie/,
    'should attach a transformer (#3)'
  );

  t.end();
});

test('use(preset)', function (t) {
  t.test('should support empty presets', function (st) {
    var p = unified();

    st.equal(p.use({}), p, 'should support empty presets (1)');
    st.equal(p.attachers.length, 0, 'should support empty presets (2)');
    st.end();
  });

  t.test('should support presets with empty plugins', function (st) {
    var p = unified();
    var preset = {plugins: []};

    st.equal(p.use(preset), p, 'should support presets with empty plugins (1)');
    st.equal(p.attachers.length, 0, 'should support presets with empty plugins (2)');
    st.end();
  });

  t.test('should support presets with empty settings', function (st) {
    var p = unified();
    var preset = {settings: {}};

    st.equal(p.use(preset), p, 'should support presets with empty settings (1)');
    st.deepEqual(p.data(), {settings: {}}, 'should support presets with empty settings (2)');
    st.end();
  });

  t.test('should support presets with a plugin', function (st) {
    var p = unified();
    var preset = {plugins: [plugin]};

    st.plan(3);
    st.equal(p.use(preset), p, 'should support presets with a plugin (1)');
    st.equal(p.attachers.length, 1, 'should support presets with a plugin (2)');

    function plugin() {
      st.pass();
    }
  });

  t.test('should support presets with plugins', function (st) {
    var p = unified();
    var preset = {plugins: [a, b]};

    st.plan(4);
    st.equal(p.use(preset), p, 'should support presets with plugins (1)');
    st.equal(p.attachers.length, 2, 'should support presets with plugins (2)');

    function a() {
      st.pass();
    }

    function b() {
      st.pass();
    }
  });

  t.test('should support presets with settings', function (st) {
    var p = unified();
    var preset = {settings: {foo: true}};

    st.equal(p.use(preset), p, 'should support presets with settings (1)');
    st.deepEqual(p.data('settings'), {foo: true}, 'should support presets with settings (2)');
    st.end();
  });

  t.test('should merge multiple presets with settings', function (st) {
    var data = unified()
      .use({settings: {foo: true, bar: true}})
      .use({settings: {qux: true, foo: false}})
      .data();

    st.deepEqual(
      data.settings,
      {foo: false, bar: true, qux: true},
      'should merge multiple presets with settings'
    );

    st.end();
  });

  t.test('should support extending presets', function (st) {
    var p = unified().use({settings: {alpha: true}, plugins: [a, b]});
    var q = p();

    st.plan(7);
    st.equal(p.attachers.length, 2, 'should support extending presets (1)');
    st.equal(q.attachers.length, 2, 'should support extending presets (2)');
    st.deepEqual(q.data('settings'), {alpha: true}, 'should support extending presets (3)');

    function a() {
      st.pass();
    }

    function b() {
      st.pass();
    }
  });

  t.test('should support presets with plugins as a tuple', function (st) {
    var opts = {};
    var p = unified().use({plugins: [plugin, opts]});
    var q = p();

    st.plan(4);
    st.equal(p.attachers.length, 1, 'should support tuples (1)');
    st.equal(q.attachers.length, 1, 'should support tuples (2)');

    function plugin(options) {
      st.equal(options, opts, 'should pass options to plugin');
    }
  });

  t.test('should support presets with plugins as a matrix', function (st) {
    var one = {};
    var two = {};
    var p = unified().use({plugins: [[a, one], [b, two]]});
    var q = p();

    st.plan(6);
    st.equal(p.attachers.length, 2, 'should support matrices (1)');
    st.equal(q.attachers.length, 2, 'should support matrices (2)');

    function a(options) {
      st.equal(options, one, 'should pass options to plugin (1)');
    }

    function b(options) {
      st.equal(options, two, 'should pass options to plugin (2)');
    }
  });

  t.end();
});

/* Processors. */
test('use(processor)', function (t) {
  var p = unified();
  var q = unified();
  var o = {};
  var n;
  var res;
  var fixture;

  t.plan(12);

  res = p.use(q);

  t.equal(res, p, 'should return the origin processor');
  t.equal(p.attachers[0][0], q, 'should store attachers');

  p = unified();
  q = unified();

  fixture = q;

  q.use(function (options) {
    t.equal(this, fixture, 'should invoke a plugin with `processor` as the context');
    t.equal(options, o, 'should invoke a plugin with `options`');
  }, o);

  fixture = p;

  p.use(q);

  q = unified();
  p = unified().use(q);
  n = {type: 'test'};

  q.use(function () {
    return function (node, file) {
      t.equal(node, n, 'should attach a transformer (#1)');
      t.ok('message' in file, 'should attach a transformer (#2)');

      throw new Error('Alpha bravo charlie');
    };
  });

  p.use(q);

  t.throws(
    function () {
      p.run(n);
    },
    /Error: Alpha bravo charlie/,
    'should attach a transformer (#3)'
  );

  p = unified().use(function () {
    this.Parser = ParserA;
  });

  q = unified().use(function () {
    this.Parser = ParserB;
  });

  t.equal(p.Parser, ParserA);
  t.equal(q.Parser, ParserB);

  p.use(q);

  t.equal(p.Parser, ParserA);

  function ParserA() {}
  function ParserB() {}

  t.end();
});
