'use strict';

/* eslint-env node, mocha */

/*
 * Dependencies.
 */

var assert = require('assert');
var VFile = require('vfile');
var unified = require('./');

/**
 * No-operation.
 */
function noop() {}

noop.compile = noop;
noop.parse = noop;

/*
 * Methods.
 */

var equal = assert.strictEqual;
var dequal = assert.deepEqual;

/*
 * Tests.
 */

describe('unified()', function () {
    var Processor;
    var proto;

    it('should create a new constructor', function () {
        Processor = unified({
            'name': 'foo',
            'Parser': noop,
            'Compiler': noop
        });

        equal(typeof Processor, 'function');

        proto = Processor.prototype;

        equal(typeof proto, 'object');
    });

    it('should expose the correct methods', function () {
        equal(typeof proto.use, 'function');
        equal(typeof proto.parse, 'function');
        equal(typeof proto.run, 'function');
        equal(typeof proto.stringify, 'function');
        equal(typeof proto.process, 'function');
    });

    it('should expose the correct functions', function () {
        equal(typeof Processor.use, 'function');
        equal(typeof Processor.parse, 'function');
        equal(typeof Processor.run, 'function');
        equal(typeof Processor.stringify, 'function');
        equal(typeof Processor.process, 'function');
    });

    describe('Processor', function () {
        it('should create an instance', function () {
            assert(new Processor() instanceof Processor);
        });

        it('should create an instance when without `new`', function () {
            /* eslint-disable new-cap */
            assert(Processor() instanceof Processor);
            /* eslint-enable new-cap */
        });

        it('should create an instance when without `new`', function () {
            /* eslint-disable new-cap */
            assert(Processor() instanceof Processor);
            /* eslint-enable new-cap */
        });

        it('should use the given processor', function () {
            var p;
            var q;

            /**
             * Example plugin.
             */
            function plugin() {
                return noop;
            }

            p = new Processor().use(plugin);
            q = new Processor(p);

            dequal(p.ware.attachers, [plugin]);
            dequal(p.ware.fns, [noop]);
            dequal(q.ware.attachers, [plugin]);
            dequal(q.ware.fns, [noop]);
        });
    });

    describe('Processor#use()', function () {
        it('should return itself', function () {
            var p = new Processor();

            assert(p.use(noop), p);
        });

        it('should return a new instance when without context', function () {
            assert(Processor.use(noop) instanceof Processor);
        });

        it('should invoke the attacher', function (done) {
            var p = new Processor();

            /**
             * Example plugin.
             */
            function plugin(context, one, two, three) {
                assert(context, p);
                assert(one, 1);
                assert(two, 2);
                assert(three, 3);

                done();
            }

            p.use(plugin, 1, 2, 3);

            dequal(p.ware.attachers, [plugin]);
        });

        it('should be able to return a transformer', function () {
            var p = new Processor();

            /**
             * Example plugin.
             */
            function plugin() {
                return noop;
            }

            p.use(plugin);

            dequal(p.ware.attachers, [plugin]);
            dequal(p.ware.fns, [noop]);
        });
    });

    describe('Processor#parse()', function () {
        it('should invoke the parser', function (done) {
            var self;
            var node = {
                'type': 'baz',
                'value': 'qux'
            };

            /**
             * Example Parser.
             */
            function Parser(file, options) {
                self = this;

                equal(file.toString(), 'foo');
                equal(options, 'bar');
            }

            /**
             * Example parse methods.
             */
            function parse() {
                equal(this, self);

                done();

                return node;
            }

            Parser.prototype.parse = parse;

            Processor.Parser = Parser;

            dequal(Processor.parse('foo', 'bar'), node);

            Processor.Parser = noop;
        });

        it('should invoke the bound parser when none is available on the ' +
            'context object',
            function (done) {
                /**
                 * Example parser.
                 */
                function Bound() {}

                Bound.prototype.parse = done;

                var parse = unified({
                    'name': 'foo',
                    'Parser': Bound,
                    'Compiler': noop
                }).parse;

                parse();
            }
        );
    });

    describe('Processor#run()', function () {
        it('should invoke a transformer', function (done) {
            var tree = {
                'type': 'foo',
                'value': 'bar'
            };

            /**
             * Example transformer.
             */
            function transformer() {
                done();
            }

            /**
             * Example attacher.
             */
            function attacher() {
                return transformer;
            }

            equal(new Processor().use(attacher).run(tree), tree);
        });

        it('should throw without node', function () {
            assert.throws(function () {
                new Processor().run();
            }, /Expected node, got undefined/);
        });

        it('should invoke `done`', function (done) {
            var node = {
                'type': 'foo',
                'value': 'bar'
            };

            new Processor().run(node, function (err, tree, file) {
                equal(err, null);
                equal(tree, node);
                equal(file.toString(), '');

                done(err);
            });
        });

        it('should work with a file', function (done) {
            var vfile = new VFile();
            var node = {
                'type': 'foo',
                'value': 'bar'
            };

            vfile.namespace('foo').tree = node;

            new Processor().run(vfile, function (err, tree, file) {
                equal(err, null);
                equal(tree, node);
                equal(file, vfile);

                done(err);
            });
        });

        it('should work with a file and a node', function (done) {
            var vfile = new VFile();
            var node = {
                'type': 'foo',
                'value': 'bar'
            };

            vfile.namespace('foo').tree = node;

            new Processor().run(node, vfile, function (err, tree, file) {
                equal(err, null);
                equal(tree, node);
                equal(file, vfile);

                done(err);
            });
        });

        it('should work when used as a function', function (done) {
            var node = {
                'type': 'foo',
                'value': 'bar'
            };

            Processor.run(node, function (err) {
                done(err);
            });
        });
    });

    describe('Processor#stringify()', function () {
        it('should invoke with node and settings', function (done) {
            var self;
            var node = {
                'type': 'baz',
                'value': 'qux'
            };

            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                self = this;

                equal(file.namespace('foo').tree, node);
                equal(options, 'bar');
            }

            /**
             * Example `compile`.
             */
            function compile() {
                equal(this, self);

                done();

                return 'qux';
            }

            Compiler.prototype.compile = compile;

            Processor.Compiler = Compiler;

            equal(Processor.stringify(node, 'bar'), 'qux');

            Processor.Compiler = noop;
        });

        it('should work with a file and settings', function (done) {
            var vfile = new VFile();
            var settings = {
                'qux': 'quux'
            };
            var tree = {
                'type': 'foo',
                'value': 'bar'
            };

            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                equal(file, vfile);
                equal(options, settings);
            }

            Compiler.prototype.compile = done;

            vfile.namespace('foo').tree = tree;

            Processor.Compiler = Compiler;

            Processor.stringify(vfile, settings);

            Processor.Compiler = noop;
        });

        it('should work with just a node', function (done) {
            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                equal(options, undefined);
            }

            Compiler.prototype.compile = done;

            Processor.Compiler = Compiler;

            Processor.stringify({
                'type': 'baz',
                'value': 'qux'
            });

            Processor.Compiler = noop;
        });

        it('should with just a node', function (done) {
            var vfile = new VFile();
            var tree = {
                'type': 'foo',
                'value': 'bar'
            };

            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                equal(file, vfile);
                equal(options, undefined);
            }

            Compiler.prototype.compile = done;

            Processor.Compiler = Compiler;

            vfile.namespace('foo').tree = tree;

            Processor.stringify(vfile);

            Processor.Compiler = noop;
        });

        it('should with all arguments', function (done) {
            var vfile = new VFile();
            var settings = {
                'qux': 'quux'
            };
            var tree = {
                'type': 'foo',
                'value': 'bar'
            };

            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                equal(file, vfile);
                equal(options, settings);
            }

            Compiler.prototype.compile = done;

            Processor.Compiler = Compiler;

            vfile.namespace('foo').tree = tree;

            Processor.stringify(tree, vfile, settings);

            Processor.Compiler = noop;
        });

        it('should throw without node', function () {
            assert.throws(function () {
                Processor.stringify(new VFile());
            }, /Expected node, got null/);

            assert.throws(function () {
                Processor.stringify();
            }, /Expected node, got undefined/);
        });

        it('should invoke the bound compiler when none is available on the ' +
            'context object',
            function (done) {
                /**
                 * Example `Processor`.
                 */
                function Bound() {}

                Bound.prototype.compile = done;

                var stringify = unified({
                    'name': 'foo',
                    'Parser': noop,
                    'Compiler': Bound
                }).stringify;

                stringify({
                    'type': 'foo',
                    'value': 'bar'
                });
            }
        );
    });

    describe('Processor#process()', function () {
        it('should support a value', function () {
            var Processor2;
            var isParsed;
            var isCompiled;

            /**
             * Example `Parser`.
             */
            function Parser() {}

            /**
             * Example `parse` function.
             */
            function parse() {
                isParsed = true;
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler() {}

            /**
             * Example `compile`.
             */
            function compile() {
                isCompiled = true;
                return 'bar';
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            Processor2 = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            });

            equal(new Processor2().process('bar'), 'bar');
            equal(isParsed, true);
            equal(isCompiled, true);
        });

        it('should support a value and settings', function () {
            var settings;
            var Processor2;
            var isParsed;
            var isCompiled;

            /**
             * Example `Parser`.
             */
            function Parser(file, options) {
                equal(file.toString(), 'bar');
                equal(options, settings);
            }

            /**
             * Example `parse` function.
             */
            function parse() {
                isParsed = true;
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                equal(file.toString(), 'bar');
                equal(options, settings);
            }

            /**
             * Example `compile`.
             */
            function compile() {
                isCompiled = true;
                return 'bar';
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            Processor2 = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            });

            settings = {
                'baz': 'qux'
            };

            equal(new Processor2().process('bar', settings), 'bar');
            equal(isParsed, true);
            equal(isCompiled, true);
        });

        it('should support a value and a callback', function (done) {
            var Processor2;
            var isParsed;
            var isCompiled;

            /**
             * Example `Parser`.
             */
            function Parser() {}

            /**
             * Example `parse` function.
             */
            function parse() {
                isParsed = true;
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler() {}

            /**
             * Example `compile`.
             */
            function compile() {
                isCompiled = true;
                return 'bar';
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            Processor2 = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            });

            equal(new Processor2().process('bar', done), 'bar');
            equal(isParsed, true);
            equal(isCompiled, true);
        });

        it('should support a file and settings', function () {
            var vfile;
            var settings;
            var Processor2;
            var isParsed;
            var isCompiled;

            /**
             * Example `Parser`.
             */
            function Parser(file, options) {
                equal(file, vfile);
                equal(options, settings);
            }

            /**
             * Example `parse` function.
             */
            function parse() {
                isParsed = true;
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                equal(file, vfile);
                equal(options, settings);
            }

            /**
             * Example `compile`.
             */
            function compile() {
                isCompiled = true;
                return 'bar';
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            Processor2 = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            });

            vfile = new VFile('bar');

            settings = {
                'baz': 'qux'
            };

            equal(new Processor2().process(vfile, settings), 'bar');
            equal(isParsed, true);
            equal(isCompiled, true);
        });

        it('should support a file and a callback', function (done) {
            var vfile;
            var Processor2;
            var isParsed;
            var isCompiled;

            /**
             * Example `Parser`.
             */
            function Parser(file) {
                equal(file, vfile);
            }

            /**
             * Example `parse` function.
             */
            function parse() {
                isParsed = true;
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler(file) {
                equal(file, vfile);
            }

            /**
             * Example `compile`.
             */
            function compile() {
                isCompiled = true;
                return 'bar';
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            Processor2 = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            });

            vfile = new VFile('bar');

            equal(new Processor2().process(vfile, done), 'bar');
            equal(isParsed, true);
            equal(isCompiled, true);
        });

        it('should support a file and settings', function () {
            var vfile;
            var settings;
            var Processor2;
            var isParsed;
            var isCompiled;

            /**
             * Example `Parser`.
             */
            function Parser(file, options) {
                equal(file, vfile);
                equal(options, settings);
            }

            /**
             * Example `parse` function.
             */
            function parse() {
                isParsed = true;
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                equal(file, vfile);
                equal(options, settings);
            }

            /**
             * Example `compile`.
             */
            function compile() {
                isCompiled = true;
                return 'bar';
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            Processor2 = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            });

            vfile = new VFile('bar');

            settings = {
                'baz': 'qux'
            };

            equal(new Processor2().process(vfile, settings), 'bar');
            equal(isParsed, true);
            equal(isCompiled, true);
        });

        it('should support file, settings, and a callback', function (done) {
            var vfile;
            var settings;
            var processor;
            var isParsed;
            var isCompiled;

            /**
             * Example `Parser`.
             */
            function Parser(file, options) {
                equal(file, vfile);
                equal(options, settings);
            }

            /**
             * Example `parse` function.
             */
            function parse() {
                isParsed = true;
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler(file, options) {
                equal(file, vfile);
                equal(options, settings);
            }

            /**
             * Example `compile`.
             */
            function compile() {
                isCompiled = true;
                return 'bar';
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            processor = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            });

            vfile = new VFile('bar');

            settings = {
                'baz': 'qux'
            };

            equal(processor.process(vfile, settings, done), 'bar');
            equal(isParsed, true);
            equal(isCompiled, true);
        });

        it('should throw a sync parse error', function () {
            var processor;

            /**
             * Example `Parser`.
             */
            function Parser(file) {
                this.file = file;
            }

            /**
             * Example `parse` function.
             */
            function parse() {
                this.file.fail('Warning');
            }

            Parser.prototype.parse = parse;

            processor = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': noop
            });

            assert.throws(function () {
                processor.process('foo');
            }, /1:1: Warning/);
        });

        it('should throw a sync compile error', function () {
            var processor;

            /**
             * Example `Parser`.
             */
            function Parser() {}

            /**
             * Example `parse` function.
             */
            function parse() {
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler(file) {
                this.file = file;
            }

            /**
             * Example `compile`.
             */
            function compile() {
                this.file.fail('Warning');
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            processor = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            });

            assert.throws(function () {
                processor.process('foo');
            }, /1:1: Warning/);
        });

        it('should throw a sync run error', function () {
            var processor;

            /**
             * Example `Parser`.
             */
            function Parser() {}

            /**
             * Example `parse` function.
             */
            function parse() {
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            Parser.prototype.parse = parse;

            processor = unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': noop
            }).use(function () {
                return function (ast, file) {
                    file.fail('Warning');
                };
            });

            assert.throws(function () {
                processor.process('foo');
            }, /1:1: Warning/);
        });

        it('should pass an async parse error', function (done) {
            /**
             * Example `Parser`.
             */
            function Parser(file) {
                this.file = file;
            }

            /**
             * Example `parse` function.
             */
            function parse() {
                this.file.fail('Warning');
            }

            Parser.prototype.parse = parse;

            unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': noop
            }).process('foo', function (err) {
                equal(String(err), '1:1: Warning');
                done();
            });
        });

        it('should pass an async compile error', function (done) {
            /**
             * Example `Parser`.
             */
            function Parser() {}

            /**
             * Example `parse` function.
             */
            function parse() {
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            /**
             * Example `Compiler`.
             */
            function Compiler(file) {
                this.file = file;
            }

            /**
             * Example `compile`.
             */
            function compile() {
                this.file.fail('Warning');
            }

            Parser.prototype.parse = parse;
            Compiler.prototype.compile = compile;

            unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': Compiler
            }).process('foo', function (err) {
                equal(String(err), '1:1: Warning');
                done();
            });
        });

        it('should pass an async run error', function (done) {
            /**
             * Example `Parser`.
             */
            function Parser() {}

            /**
             * Example `parse` function.
             */
            function parse() {
                return {
                    'type': 'foo',
                    'value': 'bar'
                };
            }

            Parser.prototype.parse = parse;

            unified({
                'name': 'foo',
                'Parser': Parser,
                'Compiler': noop
            }).use(function () {
                return function (ast, file) {
                    file.fail('Warning');
                };
            }).process('bar', function (err) {
                equal(String(err), '1:1: Warning');
                done();
            });
        });
    });
});
