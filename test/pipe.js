'use strict';

var stream = require('stream');
var test = require('tape');
var simple = require('./util/simple');
var unified = require('..');

test('pipe(destination[, options])', function (t) {
  var p;
  var s;

  p = unified().use(function (processor) {
    processor.Parser = simple.Parser;
    processor.Compiler = simple.Compiler;
  });

  /* Not writable. */
  p.pipe(new stream.Readable());

  t.doesNotThrow(
    function () {
      p.end('foo');
    },
    'should not throw when piping to a non-writable stream'
  );

  p = unified().use(function (processor) {
    processor.Parser = simple.Parser;
    processor.Compiler = simple.Compiler;
  });

  s = new stream.PassThrough();
  s._isStdio = true;

  p.pipe(s);

  p.write('alpha');
  p.write('bravo');
  p.end('charlie');

  t.doesNotThrow(
    function () {
      s.write('delta');
    },
    'should not `end` stdio streams'
  );

  p = unified()
    .use(function (processor) {
      processor.Parser = simple.Parser;
      processor.Compiler = simple.Compiler;
    })
    .on('error', function (err) {
      t.equal(
        err.message,
        'Whoops!',
        'should pass errors'
      );
    });

  p.pipe(new stream.PassThrough());
  p.emit('error', new Error('Whoops!'));

  p = unified()
    .use(function (processor) {
      processor.Parser = simple.Parser;
      processor.Compiler = simple.Compiler;
    });

  p.pipe(new stream.PassThrough());

  t.throws(
    function () {
      p.emit('error', new Error('Whoops!'));
    },
    /Whoops!/,
    'should throw if errors are not listened to'
  );

  p = unified();

  p
    .use(function (processor) {
      processor.Parser = simple.Parser;
      processor.Compiler = simple.Compiler;
    })
    .pipe(new stream.PassThrough())
    .on('data', function (buf) {
      t.equal(
        String(buf),
        'alphabravocharlie',
        'should trigger `data` with the processed result'
      );
    })
    .on('error', /* istanbul ignore next */ function () {
      t.fail('should not trigger `error`');
    });

  p.write('alpha');
  p.write('bravo');
  p.end('charlie');

  p = unified();

  p
    .use(function (processor) {
      processor.Parser = simple.Parser;

      function Compiler(file, options) {
        this.options = options;
      }

      function compile(node) {
        return node.value + this.options.flag;
      }

      Compiler.prototype.compile = compile;

      processor.Compiler = Compiler;
    })
    .pipe(new stream.PassThrough(), {
      flag: 'echo'
    })
    .on('data', function (buf) {
      t.equal(String(buf), 'deltaecho', 'should pass options');
    });

  p.end('delta');

  t.throws(
    function () {
      p.end('foxtrot');
    },
    /Did not expect `write` after `end`/,
    'should throw on write after end'
  );

  t.end();
});
