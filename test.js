/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Test suite for `unified`.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var test = require('tape');
var VFile = require('vfile');
var unified = require('./');

/**
 * No-operation.
 */
function noop() {}

noop.compile = noop;
noop.parse = noop;

/*
 * Tests.
 */

test('unified()', function (t) {
    var Processor;
    var proto;

    t.test('should create a new constructor', function (st) {
        Processor = unified({
            'name': 'foo',
            'Parser': noop,
            'Compiler': noop
        });

        st.equal(typeof Processor, 'function');

        proto = Processor.prototype;

        st.equal(typeof proto, 'object');

        st.end();
    });

    t.test('should expose the correct methods', function (st) {
        st.equal(typeof proto.use, 'function');
        st.equal(typeof proto.parse, 'function');
        st.equal(typeof proto.run, 'function');
        st.equal(typeof proto.stringify, 'function');
        st.equal(typeof proto.process, 'function');

        st.end();
    });

    t.test('should expose the correct functions', function (st) {
        st.equal(typeof Processor.use, 'function');
        st.equal(typeof Processor.parse, 'function');
        st.equal(typeof Processor.run, 'function');
        st.equal(typeof Processor.stringify, 'function');
        st.equal(typeof Processor.process, 'function');

        st.end();
    });

    t.test('Processor', function (st) {
        st.ok(
            new Processor() instanceof Processor,
            'should create an instance'
        );

        /* eslint-disable new-cap */
        st.ok(
            Processor() instanceof Processor,
            'should create an instance when without `new`'
        );
        /* eslint-enable new-cap */

        st.end();
    });

    test('Processor#data', function (st) {
        st.test('Should expose data', function  (sst) {
            var data = {
                'one': true,
                'two': false
            };

            Processor = unified({
                'name': 'foo',
                'Parser': noop,
                'Compiler': noop
            });

            sst.equal(Processor.data, null);
            sst.equal(Processor.prototype.data, null);

            Processor = unified({
                'name': 'foo',
                'Parser': noop,
                'Compiler': noop,
                'data': data
            });

            sst.deepEqual(Processor.data, data);
            sst.deepEqual(Processor.prototype.data, data);
            sst.equal(Processor.data, Processor.prototype.data);
            sst.equal(Processor.data, data);

            sst.end();
        });

        st.test('Should clone data to instances', function  (sst) {
            var processor;
            var data = {
                'one': true,
                'two': false
            };

            sst.plan(2);

            processor = unified({
                'name': 'foo',
                'Parser': noop,
                'Compiler': noop,
                'data': data
            })();

            sst.deepEqual(processor.data, data);
            sst.notEqual(processor.data, data);
        });
    });

    t.test('Processor#use()', function (st) {
        var p = new Processor();

        st.ok(p.use(noop), p, 'should return itself');

        st.ok(
            Processor.use(noop) instanceof Processor,
            'should return a new instance when without context'
        );

        st.test('should invoke the attacher', function (sst) {
            var p = new Processor();

            sst.plan(5);

            /**
             * Example plugin.
             *
             * @param {Processor} context - Processor.
             * @param {number} one - Example value.
             * @param {number} two - Example value.
             * @param {number} three - Example value.
             */
            function plugin(context, one, two, three) {
                sst.equal(context, p);
                sst.equal(one, 1);
                sst.equal(two, 2);
                sst.equal(three, 3);
            }

            p.use(plugin, 1, 2, 3);

            sst.deepEqual(p.ware.attachers, [plugin]);
        });

        st.test('should be able to return a transformer', function (sst) {
            var p = new Processor();

            /**
             * Example plugin.
             */
            function plugin() {
                return noop;
            }

            p.use(plugin);

            sst.deepEqual(p.ware.attachers, [plugin]);
            sst.deepEqual(p.ware.fns, [noop]);

            sst.end();
        });

        st.end();
    });

    t.test('Processor#parse()', function (st) {
        st.test('should invoke the parser', function (sst) {
            var self;
            var node = {
                'type': 'baz',
                'value': 'qux'
            };

            sst.plan(5);

            /**
             * Example Parser.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             * @param {Processor} context - Example processor.
             */
            function Parser(file, options, context) {
                self = this;

                sst.equal(file.toString(), 'foo');
                sst.equal(options, 'bar');
                sst.ok(context instanceof Processor);
            }

            /**
             * Example parse methods.
             */
            function parse() {
                sst.equal(this, self);

                return node;
            }

            Parser.prototype.parse = parse;

            Processor.Parser = Parser;

            sst.deepEqual(Processor.parse('foo', 'bar'), node);

            Processor.Parser = noop;
        });

        st.test(
            'should invoke the bound parser when none is available on the ' +
            'context object',
            function (sst) {
                /**
                 * Example parser.
                 */
                function Bound() {}

                Bound.prototype.parse = sst.pass;

                sst.plan(1);

                var parse = unified({
                    'name': 'foo',
                    'Parser': Bound,
                    'Compiler': noop
                }).parse;

                parse();
            }
        );
    });

    t.test('Processor#run()', function (st) {
        st.test('should invoke a transformer', function (sst) {
            var tree = {
                'type': 'foo',
                'value': 'bar'
            };

            sst.plan(2);

            /**
             * Example transformer.
             */
            function transformer() {
                sst.pass();
            }

            /**
             * Example attacher.
             */
            function attacher() {
                return transformer;
            }

            sst.equal(new Processor().use(attacher).run(tree), tree);
        });

        st.throws(
            function () {
                new Processor().run();
            },
            /Expected node, got undefined/,
            'should throw without node'
        );

        st.test('should invoke `done`', function (sst) {
            var node = {
                'type': 'foo',
                'value': 'bar'
            };

            sst.plan(4);

            new Processor().run(node, function (err, tree, file) {
                sst.ifError(err);
                sst.equal(err, null);
                sst.equal(tree, node);
                sst.equal(file.toString(), '');
            });
        });

        st.test('should work with a file', function (sst) {
            var vfile = new VFile();
            var node = {
                'type': 'foo',
                'value': 'bar'
            };

            vfile.namespace('foo').tree = node;

            sst.plan(4);

            new Processor().run(vfile, function (err, tree, file) {
                sst.ifError(err);
                sst.equal(err, null);
                sst.equal(tree, node);
                sst.equal(file, vfile);
            });
        });

        st.test('should work with a file and a node', function (sst) {
            var vfile = new VFile();
            var node = {
                'type': 'foo',
                'value': 'bar'
            };

            sst.plan(4);

            vfile.namespace('foo').tree = node;

            new Processor().run(node, vfile, function (err, tree, file) {
                sst.ifError(err);
                sst.equal(err, null);
                sst.equal(tree, node);
                sst.equal(file, vfile);
            });
        });

        st.test('should work when used as a function', function (sst) {
            var node = {
                'type': 'foo',
                'value': 'bar'
            };

            sst.plan(1);

            Processor.run(node, function (err) {
                sst.ifError(err);
            });
        });

        st.end();
    });

    t.test('Processor#stringify()', function (st) {
        st.test('should invoke with node and settings', function (sst) {
            var self;
            var node = {
                'type': 'baz',
                'value': 'qux'
            };

            sst.plan(5);

            /**
             * Example `Compiler`.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             * @param {Processor} processor - Example processor.
             */
            function Compiler(file, options, processor) {
                self = this;

                sst.equal(file.namespace('foo').tree, node);
                sst.equal(options, 'bar');
                sst.ok(processor instanceof Processor);
            }

            /**
             * Example `compile`.
             */
            function compile() {
                sst.equal(this, self);

                return 'qux';
            }

            Compiler.prototype.compile = compile;

            Processor.Compiler = Compiler;

            sst.equal(Processor.stringify(node, 'bar'), 'qux');

            Processor.Compiler = noop;
        });

        st.test('should work with a file and settings', function (sst) {
            var vfile = new VFile();
            var settings = {
                'qux': 'quux'
            };
            var tree = {
                'type': 'foo',
                'value': 'bar'
            };

            sst.plan(2);

            /**
             * Example `Compiler`.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Compiler(file, options) {
                sst.equal(file, vfile);
                sst.equal(options, settings);
            }

            Compiler.prototype.compile = noop;

            vfile.namespace('foo').tree = tree;

            Processor.Compiler = Compiler;

            Processor.stringify(vfile, settings);

            Processor.Compiler = noop;
        });

        st.test('should work with just a node', function (sst) {
            sst.plan(1);

            /**
             * Example `Compiler`.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Compiler(file, options) {
                sst.equal(options, undefined);
            }

            Compiler.prototype.compile = noop;

            Processor.Compiler = Compiler;

            Processor.stringify({
                'type': 'baz',
                'value': 'qux'
            });

            Processor.Compiler = noop;
        });

        st.test('should with just a node', function (sst) {
            var vfile = new VFile();
            var tree = {
                'type': 'foo',
                'value': 'bar'
            };

            sst.plan(2);

            /**
             * Example `Compiler`.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Compiler(file, options) {
                sst.equal(file, vfile);
                sst.equal(options, undefined);
            }

            Compiler.prototype.compile = noop;

            Processor.Compiler = Compiler;

            vfile.namespace('foo').tree = tree;

            Processor.stringify(vfile);

            Processor.Compiler = noop;
        });

        st.test('should with all arguments', function (sst) {
            var vfile = new VFile();
            var settings = {
                'qux': 'quux'
            };
            var tree = {
                'type': 'foo',
                'value': 'bar'
            };

            sst.plan(2);

            /**
             * Example `Compiler`.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Compiler(file, options) {
                sst.equal(file, vfile);
                sst.equal(options, settings);
            }

            Compiler.prototype.compile = noop;

            Processor.Compiler = Compiler;

            vfile.namespace('foo').tree = tree;

            Processor.stringify(tree, vfile, settings);

            Processor.Compiler = noop;
        });

        st.throws(
            function () {
                Processor.stringify(new VFile());
            },
            /Expected node, got null/,
            'should throw without node (#1)'
        );

        st.throws(
            function () {
                Processor.stringify();
            },
            /Expected node, got undefined/,
            'should throw without node (#2)'
        );

        st.test(
            'should invoke the bound compiler when none is available ' +
            'on the context object',
            function (sst) {
                sst.plan(1);

                /**
                 * Example `Processor`.
                 */
                function Bound() {}

                /**
                 * Example `compile`.
                 */
                Bound.prototype.compile = function () {
                    sst.pass();
                };

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

        st.end();
    });

    t.test('Processor#process()', function (st) {
        st.test('should support a value', function (sst) {
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

            sst.equal(new Processor2().process('bar'), 'bar');
            sst.equal(isParsed, true);
            sst.equal(isCompiled, true);

            sst.end();
        });

        st.test('should support a value and settings', function (sst) {
            var settings;
            var Processor2;
            var isParsed;
            var isCompiled;

            sst.plan(7);

            /**
             * Example `Parser`.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Parser(file, options) {
                sst.equal(file.toString(), 'bar');
                sst.equal(options, settings);
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
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Compiler(file, options) {
                sst.equal(file.toString(), 'bar');
                sst.equal(options, settings);
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

            sst.equal(new Processor2().process('bar', settings), 'bar');
            sst.equal(isParsed, true);
            sst.equal(isCompiled, true);
        });

        st.test('should support a value and a callback', function (sst) {
            var Processor2;
            var isParsed;
            var isCompiled;

            sst.plan(3);

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

            sst.equal(new Processor2().process('bar'), 'bar');
            sst.equal(isParsed, true);
            sst.equal(isCompiled, true);
        });

        st.test('should support a file and settings', function (sst) {
            var vfile;
            var settings;
            var Processor2;
            var isParsed;
            var isCompiled;

            sst.plan(7);

            /**
             * Example `Parser`.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Parser(file, options) {
                sst.equal(file, vfile);
                sst.equal(options, settings);
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
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Compiler(file, options) {
                sst.equal(file, vfile);
                sst.equal(options, settings);
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

            sst.equal(new Processor2().process(vfile, settings), 'bar');
            sst.equal(isParsed, true);
            sst.equal(isCompiled, true);
        });

        st.test('should support a file and a callback', function (sst) {
            var vfile;
            var Processor2;
            var isParsed;
            var isCompiled;

            sst.plan(5);

            /**
             * Example `Parser`.
             *
             * @param {VFile} file - Example file.
             */
            function Parser(file) {
                sst.equal(file, vfile);
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
             *
             * @param {VFile} file - Example file.
             */
            function Compiler(file) {
                sst.equal(file, vfile);
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

            sst.equal(new Processor2().process(vfile), 'bar');
            sst.equal(isParsed, true);
            sst.equal(isCompiled, true);
        });

        st.test('should support a file and settings', function (sst) {
            var vfile;
            var settings;
            var Processor2;
            var isParsed;
            var isCompiled;

            sst.plan(7);

            /**
             * Example `Parser`.
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Parser(file, options) {
                sst.equal(file, vfile);
                sst.equal(options, settings);
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
             *
             * @param {VFile} file - Example file.
             * @param {Object} options - Example configuration.
             */
            function Compiler(file, options) {
                sst.equal(file, vfile);
                sst.equal(options, settings);
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

            sst.equal(new Processor2().process(vfile, settings), 'bar');
            sst.equal(isParsed, true);
            sst.equal(isCompiled, true);
        });

        st.test(
            'should support file, settings, and a callback',
            function (sst) {
                var vfile;
                var settings;
                var processor;
                var isParsed;
                var isCompiled;

                sst.plan(7);

                /**
                 * Example `Parser`.
                 *
                 * @param {VFile} file - Example file.
                 * @param {Object} options - Example configuration.
                 */
                function Parser(file, options) {
                    sst.equal(file, vfile);
                    sst.equal(options, settings);
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
                 *
                 * @param {VFile} file - Example file.
                 * @param {Object} options - Example configuration.
                 */
                function Compiler(file, options) {
                    sst.equal(file, vfile);
                    sst.equal(options, settings);
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

                sst.equal(processor.process(vfile, settings), 'bar');
                sst.equal(isParsed, true);
                sst.equal(isCompiled, true);
            }
        );

        st.test('should throw a sync parse error', function (sst) {
            var processor;

            sst.plan(1);

            /**
             * Example `Parser`.
             *
             * @param {VFile} file - Example file.
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

            sst.throws(
                function () {
                    processor.process('foo');
                },
                /1:1: Warning/
            );
        });

        st.test('should throw a sync compile error', function (sst) {
            var processor;

            sst.plan(1);

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
             *
             * @param {VFile} file - Example file.
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

            sst.throws(
                function () {
                    processor.process('foo');
                },
                /1:1: Warning/
            );
        });

        st.test('should throw a sync run error', function (sst) {
            var processor;

            sst.plan(1);

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

            sst.throws(
                function () {
                    processor.process('foo');
                },
                /1:1: Warning/
            );
        });

        st.test('should pass an async parse error', function (sst) {
            sst.plan(1);

            /**
             * Example `Parser`.
             *
             * @param {VFile} file - Example file.
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
                sst.equal(String(err), '1:1: Warning');
            });
        });

        st.test('should pass an async compile error', function (sst) {
            sst.plan(1);

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
             *
             * @param {VFile} file - Example file.
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
                sst.equal(String(err), '1:1: Warning');
            });
        });

        st.test('should pass an async run error', function (sst) {
            sst.plan(1);

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
                sst.equal(String(err), '1:1: Warning');
            });
        });
    });

    t.end();
});
