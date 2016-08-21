/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Test suite for `unified`.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var vfile = require('vfile');
var simple = require('./util/simple');
var noop = require('./util/noop');
var unified = require('..');

/* Tests. */
test('process(file[, options][, done])', function (t) {
  var p = unified();

  t.plan(7);

  t.throws(
    function () {
      p.process();
    },
    /Cannot `process` without `Parser`/,
    'should throw without `Parser`'
  );

  p.Parser = noop;

  t.throws(
    function () {
      p.process();
    },
    /Cannot `process` without `Parser`/,
    'should throw without `Parser#parse`'
  );

  p.Parser = noop.Parser;

  t.throws(
    function () {
      p.process();
    },
    /Cannot `process` without `Compiler`/,
    'should throw without `Compiler`'
  );

  p.Compiler = noop;

  t.throws(
    function () {
      p.process();
    },
    /Cannot `process` without `Compiler`/,
    'should throw without `Compiler#compile`'
  );

  t.test('process(file, options, done)', function (st) {
    var f = vfile('alpha');
    var n = {type: 'bravo'};
    var o = {charlie: 'delta'};
    var p;

    st.plan(11);

    p = unified()
      .use(function (processor) {
        function Parser(file, options, processor) {
          st.equal(file, f, 'should pass `file` to `Parser`');
          st.equal(options, o, 'should pass `options` to `Parser`');
          st.equal(processor, p, 'should pass `processor` to `Parser`');
        }

        function parse() {
          return n;
        }

        Parser.prototype.parse = parse;
        processor.Parser = Parser;
      })
      .use(function () {
        return function (tree, file) {
          st.equal(tree, n, 'should pass `tree` to transformers');
          st.equal(file, f, 'should pass `file` to transformers');
        };
      })
      .use(function (processor) {
        function Compiler(file, options, processor) {
          st.equal(file, f, 'should pass `file` to `Compiler`');
          st.equal(options, o, 'should pass `options` to `Compiler`');
          st.equal(processor, p, 'should pass `processor` to `Compiler`');
        }

        function compile(tree) {
          st.equal(tree, n, 'should pass `tree` to `Compiler#compile`');

          return 'echo';
        }

        Compiler.prototype.compile = compile;

        processor.Compiler = Compiler;
      });

    p.process(f, o, function (err, file) {
      st.error(err);

      st.equal(
        file.toString(),
        'echo',
        'should store the result of `compile()` on `file`'
      );
    });
  });

  t.test('process(file, done)', function (st) {
    var f = vfile('alpha');
    var n = {type: 'bravo'};
    var p;

    st.plan(12);

    p = unified()
      .use(function (processor) {
        function Parser(file, options, processor) {
          st.equal(
            file,
            f,
            'should pass `file` to `Parser`'
          );

          st.deepEqual(
            options,
            {},
            'should pass empty `options` to `Parser`'
          );

          st.equal(
            processor,
            p,
            'should pass `processor` to `Parser`'
          );
        }

        function parse() {
          return n;
        }

        Parser.prototype.parse = parse;
        processor.Parser = Parser;
      })
      .use(function () {
        return function (tree, file) {
          st.equal(
            tree,
            n,
            'should pass `tree` to transformers'
          );

          st.equal(
            file,
            f,
            'should pass `file` to transformers'
          );
        };
      })
      .use(function (processor) {
        function Compiler(file, options, processor) {
          st.equal(
            file,
            f,
            'should pass `file` to `Compiler`'
          );

          st.deepEqual(
            options,
            {},
            'should pass empty `options` to `Compiler`'
          );

          st.equal(
            processor,
            p,
            'should pass `processor` to `Compiler`'
          );
        }

        function compile(tree) {
          st.equal(
            tree,
            n,
            'should pass `tree` to `Compiler#compile`'
          );

          return 'charlie';
        }

        Compiler.prototype.compile = compile;

        processor.Compiler = Compiler;
      });

    p.process(f, function (err, file) {
      st.error(err);

      st.equal(
        file.toString(),
        'charlie',
        'should store the result of `compile()` on `file`'
      );
    });

    p = unified().use(function (processor) {
      processor.Parser = simple.Parser;
      processor.Compiler = simple.Compiler;
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
      .use(function (processor) {
        processor.Parser = simple.Parser;
      })
      .use(function () {
        return function () {
          return new Error('bravo');
        };
      })
      .use(function (processor) {
        processor.Compiler = noop.Compiler;
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
