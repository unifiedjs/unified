'use strict';

var test = require('tape');
var unified = require('..');

test('data(key[, value])', function (t) {
  var p = unified();

  t.equal(p.data('foo', 'bar'), p, 'should return self as setter');
  t.equal(p.data('foo'), 'bar', 'should return data as getter');

  t.equal(
    p.data('toString'),
    null,
    'should not return own inherited properties.'
  );

  t.deepEqual(
    p.data(),
    {foo: 'bar'},
    'should return the memory without arguments'
  );

  t.deepEqual(
    p.data({baz: 'qux'}),
    p,
    'should set the memory with just a value (#1)'
  );

  t.deepEqual(
    p.data(),
    {baz: 'qux'},
    'should set the memory with just a value (#2)'
  );

  t.end();
});
