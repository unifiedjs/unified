'use strict';

var test = require('tape');
var unified = require('..');

test('parse(file)', function (t) {
  var p = unified();
  var n;

  t.plan(5);

  t.throws(
    function () {
      p.parse('');
    },
    /Cannot `parse` without `Parser`/,
    'should throw without `Parser`'
  );

  n = {type: 'delta'};

  p.Parser = function (doc, file) {
    t.ok(typeof doc, 'string', 'should pass a document');
    t.ok('message' in file, 'should pass a file');
  };

  p.Parser.prototype.parse = function () {
    t.equal(arguments.length, 0, 'should not pass anything to `parse`');
    return n;
  };

  t.equal(p.parse('charlie'), n, 'should return the result `Parser#parse` returns');
});
