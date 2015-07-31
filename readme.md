# unified [![Build Status](https://img.shields.io/travis/wooorm/unified.svg)](https://travis-ci.org/wooorm/unified) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/unified.svg)](https://codecov.io/github/wooorm/unified)

Text processing framework: Parse / Transform / Compile.

This library provides the boilerplate to make parsing and compiling pluggable.
It’s in use by [**mdast**](https://github.com/wooorm/mdast) and
[**retext**](https://github.com/wooorm/retext).

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install unified
```

**unified** is also available for [bower](http://bower.io/#install-packages),
[component](https://github.com/componentjs/component), and [duo](http://duojs.org/#getting-started),
and as an AMD, CommonJS, and globals module, [uncompressed](unified.js) and
[compressed](unified.min.js).

## Usage

From [**mdast**](https://github.com/wooorm/mdast/blob/master/index.js):

```js
var unified = require('unified');
var Parser = require('./lib/parse.js');
var Compiler = require('./lib/stringify.js');

module.exports = unified({
    'name': 'mdast',
    'type': 'ast',
    'Parser': Parser,
    'Compiler': Compiler
});
```

## Table of Contents

*   [API](#api)

    *   [unified(options)](#unifiedoptions)

    *   [Processor([processor])](#processorprocessor)

    *   [processor.Parser](#processorparser)

    *   [processor.Compiler](#processorcompiler)

    *   [Processor#use(plugin[, input...])](#processoruseplugin-input)

        *   [Plugin](#plugin)
        *   [function attacher(processor[, input...])](#function-attacherprocessor-input)
        *   [function transformer(node, file[, next])](#function-transformernode-file-next)

    *   [Processor#parse(file[, options])](#processorparsefile-options)

    *   [Processor#run(node[, file][, done])](#processorrunnode-file-done)

        *   [function done(err, node, file)](#function-doneerr-node-file)

    *   [Processor#stringify(node[, file][, options])](#processorstringifynode-file-options)

    *   [Processor#process(file[, options][, done])](#processorprocessfile-options-done)

        *   [function done(err, doc, file)](#function-doneerr-doc-file)

*   [License](#license)

## API

### unified(options)

Create a new `Processor` constructor.

**Parameters** — `options` (`Object`):

*   `name` (`string`) — Unique namespace, e.g. `'mdast'` or `'retext'`.

*   `type` (`string`) — Type of the produced syntax tree. For example,
    **mdast** uses an `'ast'` (Abstract Syntax Tree), whereas **retext**
    uses a `'cst'` (Concrete Syntax Tree).

    Used to store the syntax tree after parsing on the file (at
    `file.namespace(name)[type]`).

*   `Parser` (`Function`) — Constructor which transforms a virtual file
    into a syntax tree. When input is parsed, this function will be
    constructed with a `file` and `settings`. `Parser` instances should
    have a `parse` method which returns a `node` (an object with a `type`
    property).

    The string representation of a file can be accessed by executing
    `file.toString();`.

*   `Compiler` (`Function`) — Constructor which transforms a node
    into a string. When input is compiled, this function will be
    constructed with a `file` and `settings`. `Compiler` instances should
    have a `compile` method which returns a `string`.

    The syntax tree representation of a file can be accessed by executing
    `file.namespace(name)[type]`.

**Returns** — `Function` (`Processor` constructor).

### Processor(\[processor\])

> Note that all methods on the instance are also available as functions on the
> constructor, which, when invoked, create a new instance.
>
> Thus, invoking `new Processor().process()` is the same as
> `Processor.process()`.

Create a new `Processor` instance.

**Parameters**

*   `processor` (`Processor`, optional) — Uses all plug-ins available on the
    reference processor instance, on the newly constructed processor instance.

**Returns**

`Processor`.

### processor.Parser

### processor.Compiler

The constructors passed to [`unified`](#unifiedoptions) at `'Parser'`
and `'Compiler'` are stored on `Processor` instances. The `Parser`
is responsible for parsing a virtual file into a syntax tree, and the
`Compiler` for compiling a syntax tree into something else.

When a processor is constructed, both are passed to [unherit](https://github.com/wooorm/unherit),
which ensures that plug-ins can change how the processor instance parses
and compiles without affecting other processors.

`Parser`s must have a `parse` method, `Compiler`s a `compile` method.

### Processor#use(plugin\[, input...\])

Change the way the processor works by using a plugin.

**Signatures**

*   `unified = unified.use(plugin[, input...])`;
*   `unified = unified.use(plugins)`.

**Parameters**

*   `plugin` (`Function`) — [Plugin](#plugin).
*   `plugins` (`Array.<Function>`) — List of plugins.
*   `input` (`*`) — Passed to plugin.  Specified by its documentation.

**Returns**

`Processor` — `this` (the context object).

#### Plugin

A **uniware** plugin changes the way the applied-on processor works. It does
two things:

*   It modifies the instance: such as changing the Parser or the Compiler;
*   It transforms a syntax tree representation of a file.

Both have their own function. The first is called an
[“attacher”](#function-attacherprocessor-input). The second is named a
[“transformer”](#function-transformernode-file-next). An “attacher” may
return a “transformer”.

#### function attacher([processor](#processorprocessor)\[, input...\])

To modify the processor, create an attacher. An attacher is the thing passed to
[`use`](#processoruseplugin-input). It can
receive plugin specific options, but that’s entirely up to the third-party
developer.

An **attacher** is invoked when the plugin is
[`use`](https://github.com/wooorm/mdast#mdastuseplugin-options)d, and can
return a transformer which will be called on subsequent
[`process()`](#processorprocessfile-options-done)s and
[`run()`](#processorrunnode-file-done)s.

**Signatures**

*   `transformer? = attacher(processor[, input...])`.

**Parameters**

*   `processor` (`Processor`) — Context on which the plugin was
    [`use`](https://github.com/wooorm/mdast#mdastuseplugin-options)d;

*   `input` (`*`) — Passed by the user of a plug-in.

**Returns**

[`transformer`](#function-transformernode-file-next) (optional).

#### function transformer(node, file\[, next\])

To transform a syntax tree, create a transformer. A transformer is a simple
(generator) function which is invoked each time a file is
[`process()`](#processorprocessfile-options-done)s and
[`run()`](#processorrunnode-file-done)s. A transformer should
change the syntax tree representation of a file.

**Signatures**

*   `err? = transformer(node, file)`;
*   `transformer(node, file, next)`;
*   `Promise.<null, Error> = transformer(node, file)`;
*   `transformer*(node, file)`.

**Parameters**

*   `node` (`Node`) — Syntax tree representation of a file;

*   `file` (`VFile`) — [Virtual file](https://github.com/wooorm/vfile);

*   `next` (`function([err])`, optional) — If the signature includes both
    `next`, `transformer` **may** finish asynchronous, and **must**
    invoke `next()` on completion with an optional error.

**Returns** — Optionally:

*   `Error` — Exception which will be thrown;

*   `Promise.<null, Error>` — Promise which must be resolved or rejected
    on completion.

### Processor#parse(file\[, options\])

Parse a document into a syntax tree.

When given a file, stores the returned node on that file.

**Signatures**

*   `node = processor.parse(file|value[, options])`.

**Parameters**

*   `file` (`VFile`) — [Virtual file](https://github.com/wooorm/vfile).
*   `value` (`string`) — String representation of a file.
*   `options` (`Object`) — Configuration given to the parser.

**Returns**

`Node` — (`Object`).

### Processor#run(node\[, file\]\[, done\])

Transform a syntax tree by applying plug-ins to it.

Either a node or a file which was previously passed to `processor.parse()`,
must be given.

**Signatures**

*   `node = processor.run(node[, file|value][, done])`;
*   `node = processor.run(file[, done])`.

**Parameters**

*   `node` (`Object`) — Syntax tree as returned by `parse()`;
*   `file` (`VFile`) — [Virtual file](https://github.com/wooorm/vfile).
*   `value` (`string`) — String representation of a file.
*   `done` ([`function done(err, node, file)`](#function-doneerr-node-file)).

**Returns**

`Node` — The given syntax tree node.

**Throws**

When no `node` was given and no node was found on the file.

#### function done(err, node, file)

Invoked when transformation is complete.

**Signatures**

*   `function done(err)`;
*   `function done(null, node, file)`.

**Parameters**

*   `exception` (`Error`) — Failure;
*   `doc` (`string`) — Document generated by the process;
*   `file` (`File`) — File object representing the input file;

### Processor#stringify(node\[, file\]\[, options\])

Compile a syntax tree into a document.

Either a node or a file which was previously passed to `processor.parse()`,
must be given.

**Signatures**

*   `doc = processor.stringify(node[, file|value][, options])`;
*   `doc = processor.stringify(file[, options])`.

**Parameters**

*   `node` (`Object`) — Syntax tree as returned by `parse()`;
*   `file` (`VFile`) — [Virtual file](https://github.com/wooorm/vfile).
*   `value` (`string`) — String representation of a file.
*   `options` (`Object`) — Configuration.

**Returns**

`doc` (`string`) — Document.

**Throws**

When no `node` was given and no node was found on the file.

### Processor#process(file\[, options\]\[, done\])

Parse / Transform / Compile. When an async transformer is used,
`null` is returned and `done` must be given to receive the results
upon completion.

**Signatures**

*   `doc = processor.process(file|value[, options][, done])`.

**Parameters**

*   `file` (`File`) — [Virtual file](https://github.com/wooorm/vfile);
*   `value` (`string`) — String representation of a file;
*   `options` (`Object`) — Configuration.
*   `done` ([`function done(err?, doc?, file?)`](#function-doneerr-doc-file)).

**Returns**

`string` — Document generated by the process;

#### function done(err, doc, file)

Invoked when processing is complete.

**Signatures**

*   `function done(err)`;
*   `function done(null, doc, file)`.

**Parameters**

*   `exception` (`Error`) — Failure;
*   `doc` (`string`) — Document generated by the process;
*   `file` (`File`) — File object representing the input file;

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
