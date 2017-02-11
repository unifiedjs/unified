'use strict';

var test = require('tape');
var vfile = require('vfile');
var simple = require('./util/simple');
var noop = require('./util/noop');
var unified = require('..');

test('process(file[, done])', function (t) {
  var p = unified();

  t.plan(4);

  t.throws(
    function () {
      p.process();
    },
    /Cannot `process` without `Parser`/,
    'should throw without `Parser`'
  );

  p.Parser = noop.Parser;

  t.throws(
    function () {
      p.process();
    },
    /Cannot `process` without `Compiler`/,
    'should throw without `Compiler`'
  );

  t.test('process(file, done)', function (st) {
    var f = vfile('alpha');
    var n = {type: 'bravo'};
    var p;

    st.plan(9);

    p = unified()
      .use(function () {
        function Parser(doc, file) {
          st.equal(typeof doc, 'string', 'should pass `doc` to `Parser`');
          st.equal(file, f, 'should pass `file` to `Parser`');
        }

        function parse() {
          return n;
        }

        Parser.prototype.parse = parse;
        this.Parser = Parser;
      })
      .use(function () {
        return function (tree, file) {
          st.equal(tree, n, 'should pass `tree` to transformers');
          st.equal(file, f, 'should pass `file` to transformers');
        };
      })
      .use(function () {
        function Compiler(tree, file) {
          st.equal(tree, n, 'should pass `tree` to `Compiler`');
          st.equal(file, f, 'should pass `file` to `Compiler`');
        }

        function compile() {
          return 'charlie';
        }

        Compiler.prototype.compile = compile;

        this.Compiler = Compiler;
      });

    p.process(f, function (err, file) {
      st.error(err);

      st.equal(
        file.toString(),
        'charlie',
        'should store the result of `compile()` on `file`'
      );
    });

    p = unified().use(function () {
      this.Parser = simple.Parser;
      this.Compiler = simple.Compiler;
    });

    st.throws(
      function () {
        p.process(f, function () {
          throw new Error('Err');
        });
      },
      /^Error: Err$/
    );
  });

  t.test('process(file)', function (st) {
    var p = unified()
      .use(function () {
        this.Parser = simple.Parser;
      })
      .use(function () {
        return function () {
          return new Error('bravo');
        };
      })
      .use(function () {
        this.Compiler = noop.Compiler;
      });

    st.throws(
      function () {
        p.process('delta');
      },
      /Error: bravo/,
      'should throw error from the process without `done`'
    );

    st.end();
  });
});
