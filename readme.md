# [![unified][logo]][site]

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**unified** lets you inspect and transform content with plugins.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [Overview](#overview)
*   [API](#api)
    *   [`processor()`](#processor)
    *   [`processor.use(plugin[, options])`](#processoruseplugin-options)
    *   [`processor.parse(file)`](#processorparsefile)
    *   [`processor.stringify(tree[, file])`](#processorstringifytree-file)
    *   [`processor.run(tree[, file][, done])`](#processorruntree-file-done)
    *   [`processor.runSync(tree[, file])`](#processorrunsynctree-file)
    *   [`processor.process(file[, done])`](#processorprocessfile-done)
    *   [`processor.processSync(file)`](#processorprocesssyncfile)
    *   [`processor.data([key[, value]])`](#processordatakey-value)
    *   [`processor.freeze()`](#processorfreeze)
*   [`Plugin`](#plugin)
    *   [`function attacher(options?)`](#function-attacheroptions)
    *   [`function transformer(tree, file[, next])`](#function-transformertree-file-next)
*   [`Preset`](#preset)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Contribute](#contribute)
*   [Sponsor](#sponsor)
*   [Acknowledgments](#acknowledgments)
*   [License](#license)

## What is this?

unified is two things:

*   **unified** is a collective of 500+ free and open source packages that work
    with content as structured data (ASTs)
*   `unified` (this project) is the core package, used in 800k+ projects on GH,
    to process content with plugins

Several ecosystems are built on unified around different kinds of content.
Notably, [remark][] (markdown), [rehype][] (HTML), and [retext][] (natural
language).
These ecosystems can be connected together.

*   for more about us, see [`unifiedjs.com`][site]
*   for updates, see [@unifiedjs][twitter] on Twitter
*   for questions, see [support][]
*   to help, see [contribute][] and [sponsor][] below

## When should I use this?

In some cases, you are already using unified.
For example, it’s used in MDX, Gatsby, Docusaurus, etc.
In those cases, you don’t need to add `unified` yourself but you can include
plugins into those projects.

But the real fun (for some) is to get your hands dirty and work with syntax
trees and build with it yourself.
You can create those projects, or things like Prettier, or your own site
generator.
You can connect utilities together and make your own plugins that check for
problems and transform from one thing to another.

When you are dealing with one type of content (such as markdown), it’s
recommended to use the main package of that ecosystem instead (so `remark`).
When you are dealing with different kinds of content (such as markdown and
HTML), it’s recommended to use `unified` itself, and pick and choose the plugins
you need.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install unified
```

In Deno with [`esm.sh`][esmsh]:

```js
import {unified} from 'https://esm.sh/unified@10'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {unified} from 'https://esm.sh/unified@10?bundle'
</script>
```

## Use

```js
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
import {reporter} from 'vfile-reporter'

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeDocument, {title: '👋🌍'})
  .use(rehypeFormat)
  .use(rehypeStringify)
  .process('# Hello world!')

console.error(reporter(file))
console.log(String(file))
```

Yields:

```txt
no issues found
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>👋🌍</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <h1>Hello world!</h1>
  </body>
</html>
```

<!-- Old name: -->

<a name="description"></a>

## Overview

`unified` is an interface for processing content with syntax trees.
Syntax trees are a representation of content understandable to programs.
Those programs, called *[plugins][plugin]*, take these trees and inspect and
modify them.
To get to the syntax tree from text, there is a *[parser][]*.
To get from that back to text, there is a *[compiler][]*.
This is the *[process][]* of a *processor*.

```ascii
| ........................ process ........................... |
| .......... parse ... | ... run ... | ... stringify ..........|

          +--------+                     +----------+
Input ->- | Parser | ->- Syntax Tree ->- | Compiler | ->- Output
          +--------+          |          +----------+
                              X
                              |
                       +--------------+
                       | Transformers |
                       +--------------+
```

###### Processors

Processors process content.
On its own, `unified` (the root processor) doesn’t work.
It needs to be configured with plugins to work.
For example:

```js
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeDocument, {title: '👋🌍'})
  .use(rehypeFormat)
  .use(rehypeStringify)
```

That processor can do different things.
It can:

*   …parse markdown (`parse`)
*   …turn parsed markdown into HTML and format the HTML (`run`)
*   …compile HTML (`stringify`)
*   …do all of the above (`process`)

Every processor implements another processor.
To create a processor, call another processor.
The new processor is configured to work the same as its ancestor.
But when the descendant processor is configured in the future it does not affect
the ancestral processor.

When processors are exposed from a module (for example, `unified` itself) they
should not be configured directly, as that would change their behavior for all
module users.
Those processors are *[frozen][freeze]* and they should be called to create a
new processor before they are used.

###### File

When processing a document, metadata is gathered about that document.
[`vfile`][vfile] is the file format that stores data, metadata, and messages
about files for unified and plugins.

There are several [utilities][vfile-utilities] for working with these files.

###### Syntax tree

The syntax trees used in unified are [unist][] nodes.
A tree represents a whole document and each [node][] is a plain JavaScript
object with a `type` field.
The semantics of nodes and the format of syntax trees is defined by other
projects:

*   [esast][] — JavaScript
*   [hast][] — HTML
*   [mdast][] — markdown
*   [nlcst][] — natural language
*   [xast][] — XML

There are many utilities for working with trees listed in each aforementioned
project and maintained in the [`syntax-tree`][syntax-tree] organization.
These utilities are a level lower than unified itself and are building blocks
that can be used to make plugins.

<!-- Old name: -->

<a name="list-of-processors"></a>

###### Ecosystems

Around each syntax tree is an ecosystem that focusses on that particular kind
of content.
At their core, they parse text to a tree and compile that tree back to text.
They also provide plugins that work with the syntax tree, without requiring
that the end user has knowledge about that tree.

*   [rehype][] (hast) — HTML
*   [remark][] (mdast) — markdown
*   [retext][] (nlcst) — natural language

<a name="list-of-plugins"></a>

###### Plugins

Each aforementioned ecosystem comes with a large set of plugins that you can
pick and choose from to do all kinds of things.

*   [List of remark plugins][remark-plugins] ·
    [`remarkjs/awesome-remark`][awesome-remark] ·
    [`remark-plugin` topic][topic-remark-plugin]
*   [List of rehype plugins][rehype-plugins] ·
    [`rehypejs/awesome-rehype`][awesome-rehype] ·
    [`rehype-plugin` topic][topic-rehype-plugin]
*   [List of retext plugins][retext-plugins] ·
    [`retextjs/awesome-retext`][awesome-retext] ·
    [`retext-plugin` topic][topic-retext-plugin]

There are also a few plugins that work in any ecosystem:

*   [`unified-diff`](https://github.com/unifiedjs/unified-diff)
    — ignore unrelated messages in GitHub Actions and Travis
*   [`unified-infer-git-meta`](https://github.com/unifiedjs/unified-infer-git-meta)
    — infer metadata of a document from Git
*   [`unified-message-control`](https://github.com/unifiedjs/unified-message-control)
    — enable, disable, and ignore messages from content

###### Configuration

Processors are configured with [plugins][plugin] or with the [`data`][data]
method.
Most plugins also accept configuration through options.
See each plugin’s readme for more info.

###### Integrations

unified can integrate with the file system through
[`unified-engine`][unified-engine].
CLI apps can be created with [`unified-args`][unified-args], Gulp plugins with
[`unified-engine-gulp`][unified-engine-gulp], and language servers with
[`unified-language-server`][unified-language-server].
A streaming interface can be created with [`unified-stream`][unified-stream].

###### Programming interface

The [API][] provided by `unified` allows multiple files to be processed and
gives access to metadata (such as lint messages):

```js
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkPresetLintMarkdownStyleGuide from 'remark-preset-lint-markdown-style-guide'
import remarkRetext from 'remark-retext'
import retextEnglish from 'retext-english'
import retextEquality from 'retext-equality'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import {reporter} from 'vfile-reporter'

const file = await unified()
  .use(remarkParse)
  .use(remarkPresetLintMarkdownStyleGuide)
  .use(remarkRetext, unified().use(retextEnglish).use(retextEquality))
  .use(remarkRehype)
  .use(rehypeStringify)
  .process('*Emphasis* and _stress_, you guys!')

console.error(reporter(file))
console.log(String(file))
```

Yields:

```txt
  1:16-1:24  warning  Emphasis should use `*` as a marker                                  emphasis-marker  remark-lint
  1:30-1:34  warning  `guys` may be insensitive, use `people`, `persons`, `folks` instead  gals-man         retext-equality

⚠ 2 warnings
```

```html
<p><em>Emphasis</em> and <em>stress</em>, you guys!</p>
```

<!-- Old name: -->

<a name="processing-between-syntaxes"></a>

###### Transforming between ecosystems

Ecosystems can be combined in two modes.

**Bridge** mode transforms the tree from one format (*origin*) to another
(*destination*).
A different processor runs on the destination tree.
Afterwards, the original processor continues with the origin tree.

**Mutate** mode also transforms the syntax tree from one format to another.
But the original processor continues transforming the destination tree.

In the previous example (“Programming interface”), `remark-retext` is used in
bridge mode: the origin syntax tree is kept after retext is done; whereas
`remark-rehype` is used in mutate mode: it sets a new syntax tree and discards
the origin tree.

The following plugins lets you combine ecosystems:

*   [`remark-retext`][remark-retext] — turn markdown into natural language
*   [`remark-rehype`][remark-rehype] — turn markdown into HTML
*   [`rehype-retext`][rehype-retext] — turn HTML into natural language
*   [`rehype-remark`][rehype-remark] — turn HTML into markdown

## API

This package exports the identifier `unified` (the root `processor`).
There is no default export.

### `processor()`

Create a processor.

###### Returns

New *[unfrozen][freeze]* processor (`processor`) that is configured to work the
same as its ancestor.
When the descendant processor is configured in the future it does not affect the
ancestral processor.

###### Example

This example shows how a new processor can be created (from `remark`) and linked
to **stdin**(4) and **stdout**(4).

```js
import process from 'node:process'
import concatStream from 'concat-stream'
import {remark} from 'remark'

process.stdin.pipe(
  concatStream(function (buf) {
    process.stdout.write(String(remark().processSync(buf)))
  })
)
```

### `processor.use(plugin[, options])`

Configure the processor to use a plugin and optionally configure that plugin
with options.

If the processor is already using a plugin, the previous plugin configuration
is changed based on the options that are passed in.
In other words, the plugin is not added a second time.

> 👉 **Note**: `use` cannot be called on *[frozen][freeze]* processors.
> Call the processor first to create a new unfrozen processor.

###### Signatures

*   `processor.use(plugin[, options])`
*   `processor.use(preset)`
*   `processor.use(list)`

###### Parameters

*   `plugin` ([`Attacher`][plugin])
*   `options` (`*`, optional) — configuration for `plugin`
*   `preset` (`Object`) — object with an optional `plugins` (set to `list`),
    and/or an optional `settings` object
*   `list` (`Array`) — list of plugins, presets, and pairs (`plugin` and
    `options` in an array)

###### Returns

The processor that `use` was called on (`processor`).

###### Example

There are many ways to pass plugins to `.use()`.
This example gives an overview:

```js
import {unified} from 'unified'

unified()
  // Plugin with options:
  .use(pluginA, {x: true, y: true})
  // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
  .use(pluginA, {y: false, z: true})
  // Plugins:
  .use([pluginB, pluginC])
  // Two plugins, the second with options:
  .use([pluginD, [pluginE, {}]])
  // Preset with plugins and settings:
  .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
  // Settings only:
  .use({settings: {position: false}})
```

### `processor.parse(file)`

Parse text to a syntax tree.

> 👉 **Note**: `parse` freezes the processor if not already *[frozen][freeze]*.

> 👉 **Note**: `parse` performs the [parse phase][overview], not the run phase
> or other phases.

###### Parameters

*   `file` ([`VFile`][vfile]) — any value accepted  as `x` in `new VFile(x)`

###### Returns

Syntax tree representing `file` ([`Node`][node]).

###### Example

This example shows how `parse` can be used to create a tree from a file.

```js
import {unified} from 'unified'
import remarkParse from 'remark-parse'

const tree = unified().use(remarkParse).parse('# Hello world!')

console.log(tree)
```

Yields:

```js
{
  type: 'root',
  children: [
    {type: 'heading', depth: 1, children: [Array], position: [Position]}
  ],
  position: {
    start: {line: 1, column: 1, offset: 0},
    end: {line: 1, column: 15, offset: 14}
  }
}
```

#### `processor.Parser`

A **parser** handles the parsing of text to a syntax tree.
It is used in the [parse phase][overview] and is called with a `string` and
[`VFile`][vfile] of the document to parse.

`Parser` can be a normal function, in which case it must return the syntax
tree representation of the given file ([`Node`][node]).

`Parser` can also be a constructor function (a function with a `parse` field, or
other fields, in its `prototype`), in which case it is constructed with `new`.
Instances must have a `parse` method that is called without arguments and must
return a [`Node`][node].

### `processor.stringify(tree[, file])`

Compile a syntax tree.

> 👉 **Note**: `stringify` freezes the processor if not already
> *[frozen][freeze]*.

> 👉 **Note**: `stringify` performs the [stringify phase][overview], not the run
> phase or other phases.

###### Parameters

*   `tree` ([`Node`][node]) — tree to compile
*   `file` ([`VFile`][vfile], optional) — any value accepted as `x` in
    `new VFile(x)`

###### Returns

Textual representation of the tree (`string` or `Uint8Array`, see note).

> 👉 **Note**: unified typically compiles by serializing: most
> [compilers][compiler] return `string` (or `Uint8Array`).
> Some compilers, such as the one configured with
> [`rehype-react`][rehype-react], return other values (in this case, a React
> tree).
> If you’re using a compiler that doesn’t serialize, expect different result
> values.

###### Example

This example shows how `stringify` can be used to serialize a syntax tree:

```js
import {unified} from 'unified'
import rehypeStringify from 'rehype-stringify'
import {h} from 'hastscript'

const tree = h('h1', 'Hello world!')

const doc = unified().use(rehypeStringify).stringify(tree)

console.log(doc)
```

Yields:

```html
<h1>Hello world!</h1>
```

#### `processor.Compiler`

A **compiler** handles the compiling of a syntax tree to something else (in
most cases, text).
It is used in the [stringify phase][overview] and called with a [`Node`][node]
and [`VFile`][file] representation of the document to compile.

`Compiler` can be a normal function, in which case it should return the textual
representation of the given tree (`string`).

`Compiler` can also be a constructor function (a function with a `compile`
field, or other fields, in its `prototype`), in which case it is constructed
with `new`.
Instances must have a `compile` method that is called without arguments and
should return a `string`.

> 👉 **Note**: unified typically compiles by serializing: most compilers
> return `string` (or `Uint8Array`).
> Some compilers, such as the one configured with
> [`rehype-react`][rehype-react], return other values (in this case, a React
> tree).
> If you’re using a compiler that doesn’t serialize, expect different result
> values.

### `processor.run(tree[, file][, done])`

Run *[transformers][transformer]* on a syntax tree.

> 👉 **Note**: `run` freezes the processor if not already *[frozen][freeze]*.

> 👉 **Note**: `run` performs the [run phase][overview], not other phases.

###### Parameters

*   `tree` ([`Node`][node]) — tree to transform and inspect
*   `file` ([`VFile`][vfile], optional) — any value accepted as `x` in
    `new VFile(x)`
*   `done` ([`Function`][run-done], optional) — callback

###### Returns

Nothing if `done` is given (`void`).
A [`Promise`][promise] otherwise.
The promise is rejected with a fatal error or resolved with the transformed
tree ([`Node`][node]).

###### Example

This example shows how `run` can be used to transform a tree:

```js
import {unified} from 'unified'
import remarkReferenceLinks from 'remark-reference-links'
import {u} from 'unist-builder'

const tree = u('root', [
  u('paragraph', [
    u('link', {href: 'https://example.com'}, [u('text', 'Example Domain')])
  ])
])

const changedTree = await unified().use(remarkReferenceLinks).run(tree)

console.log(changedTree)
```

Yields:

```js
{
  type: 'root',
  children: [
    {type: 'paragraph', children: [Array]},
    {type: 'definition', identifier: '1', title: undefined, url: undefined}
  ]
}
```

#### `function done(err[, tree, file])`

Callback called when transformers are done.
Called with either an error or results.

###### Parameters

*   `err` (`Error`, optional) — fatal error
*   `tree` ([`Node`][node], optional) — transformed tree
*   `file` ([`VFile`][vfile], optional) — file

### `processor.runSync(tree[, file])`

Run *[transformers][transformer]* on a syntax tree.
An error is thrown if asynchronous transforms are configured.

> 👉 **Note**: `runSync` freezes the processor if not already
> *[frozen][freeze]*.

> 👉 **Note**: `runSync` performs the [run phase][overview], not other phases.

###### Parameters

*   `tree` ([`Node`][node]) — tree to transform and inspect
*   `file` ([`VFile`][vfile], optional) — any value accepted as `x` in
    `new VFile(x)`

###### Returns

Transformed tree ([`Node`][node]).

### `processor.process(file[, done])`

Process the given file as configured on the processor.

> 👉 **Note**: `process` freezes the processor if not already
> *[frozen][freeze]*.

> 👉 **Note**: `process` performs the [parse, run, and stringify
> phases][overview].

###### Parameters

*   `file` ([`VFile`][vfile]) — any value accepted as `x` in `new VFile(x)`
*   `done` ([`Function`][process-done], optional) — callback

###### Returns

Nothing if `done` is given (`void`).
A [`Promise`][promise] otherwise.
The promise is rejected with a fatal error or resolved with the processed
file ([`VFile`][vfile]).

The parsed, transformed, and compiled value is available at
[`file.value`][vfile-value] (see note).

> 👉 **Note**: unified typically compiles by serializing: most
> [compilers][compiler] return `string` (or `Uint8Array`).
> Some compilers, such as the one configured with
> [`rehype-react`][rehype-react], result in other values (in this case, a React
> tree).
> If you’re using a compiler that does not serialize, the result is available
> at `file.result`.

###### Example

This example shows how `process` can be used to process a file:

```js
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeDocument, {title: '👋🌍'})
  .use(rehypeFormat)
  .use(rehypeStringify)
  .process('# Hello world!')

console.log(String(file))
```

Yields:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>👋🌍</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <h1>Hello world!</h1>
  </body>
</html>
```

#### `function done(err, file)`

Callback called when the process is done.
Called with either an error or a result.

###### Parameters

*   `err` (`Error`, optional) — fatal error
*   `file` ([`VFile`][vfile]) — processed file

###### Example

This example shows how `process` can be used to process a file with a callback.

```js
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkGithub from 'remark-github'
import remarkStringify from 'remark-stringify'
import {reporter} from 'vfile-reporter'

unified()
  .use(remarkParse)
  .use(remarkGithub)
  .use(remarkStringify)
  .process('@unifiedjs', function (error, file) {
    console.error(reporter(error || file))
    if (file) {
      console.log(String(file))
    }
  })
```

Yields:

```txt
no issues found
```

```markdown
[**@unifiedjs**](https://github.com/unifiedjs)
```

### `processor.processSync(file)`

Process the given file as configured on the processor.
An error is thrown if asynchronous transforms are configured.

> 👉 **Note**: `processSync` freezes the processor if not already
> *[frozen][freeze]*.

> 👉 **Note**: `processSync` performs the [parse, run, and stringify
> phases][overview].

###### Parameters

*   `file` ([`VFile`][vfile]) — any value accepted as `x` in `new VFile(x)`

###### Returns

The processed file ([`VFile`][vfile]).

The parsed, transformed, and compiled value is available at
[`file.value`][vfile-value] (see note).

> 👉 **Note**: unified typically compiles by serializing: most
> [compilers][compiler] return `string` (or `Uint8Array`).
> Some compilers, such as the one configured with
> [`rehype-react`][rehype-react], result in other values (in this case, a React
> tree).
> If you’re using a compiler that does not serialize, the result is available
> at `file.result`.

###### Example

This example shows how `processSync` can be used to process a file, if all
transformers are synchronous.

```js
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeDocument, {title: '👋🌍'})
  .use(rehypeFormat)
  .use(rehypeStringify)

console.log(String(processor.processSync('# Hello world!')))
```

Yields:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>👋🌍</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <h1>Hello world!</h1>
  </body>
</html>
```

### `processor.data([key[, value]])`

Configure the processor with info available to all plugins.
Information is stored in an object.

Typically, options can be given to a specific plugin, but sometimes it makes
sense to have information shared with several plugins.
For example, a list of HTML elements that are self-closing, which is needed
during all [phases][overview].

> 👉 **Note**: setting information cannot occur on *[frozen][freeze]*
> processors.
> Call the processor first to create a new unfrozen processor.

###### Signatures

*   `processor = processor.data(key, value)`
*   `processor = processor.data(values)`
*   `value = processor.data(key)`
*   `info = processor.data()`

###### Parameters

*   `key` (`string`, optional) — identifier
*   `value` (`*`, optional) — value to set
*   `values` (`Object`, optional) — values to set

###### Returns

*   `processor` — when setting, the processor that `data` is called on
*   `value` (`*`) — when getting, the value at `key`
*   `info` (`Object`) — without arguments, the key-value store

###### Example

This example show how to get and set info:

```js
import {unified} from 'unified'

const processor = unified().data('alpha', 'bravo')

processor.data('alpha') // => 'bravo'

processor.data() // => {alpha: 'bravo'}

processor.data({charlie: 'delta'})

processor.data() // => {charlie: 'delta'}
```

### `processor.freeze()`

Freeze a processor.
Frozen processors are meant to be extended and not to be configured directly.

When a processor is frozen it cannot be unfrozen.
New processors working the same way can be created by calling the processor.

It’s possible to freeze processors explicitly by calling `.freeze()`.
Processors freeze automatically when [`.parse()`][parse], [`.run()`][run],
[`.runSync()`][run-sync], [`.stringify()`][stringify], [`.process()`][process],
or [`.processSync()`][process-sync] are called.

###### Returns

The processor that `freeze` was called on (`processor`).

###### Example

This example, `index.js`, shows how `rehype` prevents extensions to itself:

```js
import {unified} from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'

export const rehype = unified().use(rehypeParse).use(rehypeStringify).freeze()
```

That processor can be used and configured like so:

```js
import {rehype} from 'rehype'
import rehypeFormat from 'rehype-format'
// …

rehype()
  .use(rehypeFormat)
  // …
```

A similar looking example is broken as operates on the frozen interface.
If this behavior was allowed it would result in unexpected behavior so an error
is thrown.
**This is not valid**:

```js
import {rehype} from 'rehype'
import rehypeFormat from 'rehype-format'
// …

rehype
  .use(rehypeFormat)
  // …
```

Yields:

```txt
~/node_modules/unified/index.js:426
    throw new Error(
    ^

Error: Cannot call `use` on a frozen processor.
Create a new processor first, by calling it: use `processor()` instead of `processor`.
    at assertUnfrozen (~/node_modules/unified/index.js:426:11)
    at Function.use (~/node_modules/unified/index.js:165:5)
    …
```

## `Plugin`

**Plugins** configure the processors they are applied on in the following ways:

*   they change the processor, such as the [parser][], the [compiler][], or by
    configuring [data][]
*   they specify how to handle trees and files

Plugins are a concept.
They materialize as [`Attacher`s][attacher].

###### Example

`move.js`:

```js
/**
 * @typedef Options
 *   Configuration (required).
 * @property {string} extname
 *   File extension to use (must start with `.`).
 */

/** @type {import('unified').Plugin<[Options]>} */
export function move(options) {
  if (!options || !options.extname) {
    throw new Error('Missing `options.extname`')
  }

  return function (tree, file) {
    if (file.extname && file.extname !== options.extname) {
      file.extname = options.extname
    }
  }
}
```

`index.md`:

```markdown
# Hello, world!
```

`index.js`:

```js
import {read, write} from 'to-vfile'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import {move} from './move.js'

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(move, {extname: '.html'})
  .use(rehypeStringify)
  .process(await read('index.md'))

console.error(reporter(file))
await write(file) // Written to `index.html`.

```

Yields:

```txt
index.md: no issues found
```

…and in `index.html`:

```html
<h1>Hello, world!</h1>
```

### `function attacher(options?)`

Attachers are materialized plugins.
They are functions that can receive options and configure the processor.

Attachers change the processor, such as the [parser][], the [compiler][],
by configuring [data][], or by specifying how the tree and file are handled.

> 👉 **Note**: attachers are called when the processor is *[frozen][freeze]*,
> not when they are applied.

###### Parameters

*   `this` (`processor`) — processor the attacher is applied to
*   `options` (`*`, optional) — configuration

###### Returns

Optional transform ([`Transformer`][transformer]).

### `function transformer(tree, file[, next])`

Transformers handle syntax trees and files.
They are functions that are called each time a syntax tree and file are passed
through the [run phase][overview].
When an error occurs in them (either because it’s thrown, returned, rejected,
or passed to [`next`][next]), the process stops.

The run phase is handled by [`trough`][trough], see its documentation for the
exact semantics of these functions.

###### Parameters

*   `tree` ([`Node`][node]) — tree to handle
*   `file` ([`VFile`][vfile]) —file to handle
*   `next` ([`Function`][next], optional)

###### Returns

*   `void` — the next transformer keeps using same tree
*   `Error` — fatal error to stop the process
*   [`Node`][node] — new, changed, tree
*   `Promise<Node>` — resolved with a new, changed, tree or rejected with an
    `Error`

#### `function next(err[, tree[, file]])`

If the signature of a `transformer` accepts a third argument, the transformer
may perform asynchronous operations, and must call `next()`.

###### Parameters

*   `err` (`Error`, optional) — fatal error to stop the process
*   `tree` ([`Node`][node], optional) — new, changed, tree
*   `file` ([`VFile`][vfile], optional) — new, changed, file

## `Preset`

Presets are sharable configuration.
They can contain plugins and settings.

###### Example

`preset.js`:

```js
import remarkPresetLintRecommended from 'remark-preset-lint-recommended'
import remarkPresetLintConsistent from 'remark-preset-lint-consistent'
import remarkCommentConfig from 'remark-comment-config'
import remarkToc from 'remark-toc'
import remarkLicense from 'remark-license'

export const preset = {
  settings: {bullet: '*', emphasis: '*', fences: true},
  plugins: [
    remarkPresetLintRecommended,
    remarkPresetLintConsistent,
    remarkCommentConfig,
    [remarkToc, {maxDepth: 3, tight: true}],
    remarkLicense
  ]
}
```

`example.md`:

```markdown
# Hello, world!

_Emphasis_ and **importance**.

## Table of contents

## API

## License
```

`index.js`:

```js
import {read, write} from 'to-vfile'
import {remark} from 'remark'
import {reporter} from 'vfile-reporter'
import {preset} from './preset.js'

const file = await remark()
  .use(preset)
  .process(await read('example.md'))

console.error(reporter(file))
await write(file)
```

Yields:

```txt
example.md: no issues found
```

`example.md` now contains:

```markdown
# Hello, world!

*Emphasis* and **importance**.

## Table of contents

*   [API](#api)
*   [License](#license)

## API

## License

[MIT](license) © [Titus Wormer](https://wooorm.com)
```

## Types

This package is fully typed with [TypeScript][].
It exports the following additional types:

*   `Processor<ParseTree, CurrentTree, CompileTree, CompileResult>`
    — processor, where `ParseTree` is the tree that the parser creates,
    `CurrentTree` the tree that the current plugin yields, `CompileTree` the
    tree that the compiler accepts, and `CompileResult` the thing that the
    compiler yields
*   `FrozenProcessor<ParseTree, CurrentTree, CompileTree, CompileResult>`
    — like `Processor` but frozen
*   `Plugin<PluginParameters, Input, Output>`
    — plugin, where `PluginParameters` are the accepted arguments, `Input` the
    input value, and `Output` the output value (see below)
*   `Pluggable<PluginParameters>`
*   `Preset`
    — preset
*   `PluginTuple<PluginParameters, Input, Output>`
    — plugin tuple
*   `Pluggable<PluginParameters>`
    — any usable value, where `PluginParameters` are the accepted arguments
*   `PluggableList`
    — list of plugins and presets
*   `Transformer<Input, Output>`
    — transformer, where `Input` and `Output` are the input/output trees
*   `TransformCallback`
    — third argument of a transformer
*   `Parser<Tree>`
    — parser as a class or normal function, where `Tree` is the resulting tree
*   `ParserClass<Tree>`
    — parser class
*   `ParserFunction<Tree>`
    — parser function
*   `Compiler<Tree, Result>`
    — compiler as a class or normal function, where `Tree` is the accepted tree
    and `Result` the thing that the compiler yields
*   `CompilerClass<Tree, Result>`
    — compiler class
*   `CompilerFunction<Tree, Result>`
    — compiler function
*   `RunCallback<Tree>`
    — callback to `run`, where `Tree` is the resulting tree
*   `ProcessCallback<File>`
    — callback to `process`, where `File` is the resulting file

For TypeScript to work, it is particularly important to type your plugins
correctly.
We strongly recommend using the `Plugin` type with its generics and to use the
node types for the syntax trees provided by our packages (as in,
[`@types/hast`][types-hast], [`@types/mdast`][types-mdast],
[`@types/nlcst`][types-nlcst]).

```js
/**
 * @typedef {import('mdast').Root} MdastRoot
 * @typedef {import('hast').Root} HastRoot
 *
 * @typedef Options
 *   Configuration (optional).
 * @property {boolean} [someField]
 *   Some option.
 */

// To type options:
/** @type {import('unified').Plugin<[Options?]>} */
export function myPluginAcceptingOptions(options) {
  // `options` is `Options?`.
}

// To type a plugin that works on a certain tree:
/** @type {import('unified').Plugin<[], MdastRoot>} */
export function myRemarkPlugin() {
  return function (tree, file) {
    // `tree` is `MdastRoot`.
  }
}

// To type a plugin that transforms one tree into another:
/** @type {import('unified').Plugin<[], MdastRoot, HastRoot>} */
export function remarkRehype() {
  return function (tree) {
    // `tree` is `MdastRoot`.
    // Result must be `HastRoot`.
  }
}

// To type a plugin that defines a parser:
/** @type {import('unified').Plugin<[], string, MdastRoot>} */
export function remarkParse(options) {}

// To type a plugin that defines a compiler:
/** @type {import('unified').Plugin<[], HastRoot, string>} */
export function rehypeStringify(options) {}
```

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Contribute

See [`contributing.md`][contributing] in [`unifiedjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

For info on how to submit a security report, see our
[security policy][security].

## Sponsor

Support this effort and give back by sponsoring on [OpenCollective][collective]!

<table>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://vercel.com">Vercel</a><br><br>
  <a href="https://vercel.com"><img src="https://avatars1.githubusercontent.com/u/14985020?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://motif.land">Motif</a><br><br>
  <a href="https://motif.land"><img src="https://avatars1.githubusercontent.com/u/74457950?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.hashicorp.com">HashiCorp</a><br><br>
  <a href="https://www.hashicorp.com"><img src="https://avatars1.githubusercontent.com/u/761456?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://americanexpress.io">American Express</a><br><br>
  <a href="https://americanexpress.io"><img src="https://avatars1.githubusercontent.com/u/3853301?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gitbook.com">GitBook</a><br><br>
  <a href="https://www.gitbook.com"><img src="https://avatars1.githubusercontent.com/u/7111340?s=256&v=4" width="128"></a>
</td>
</tr>
<tr valign="middle">
</tr>
<tr valign="middle">
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.gatsbyjs.org">Gatsby</a><br><br>
  <a href="https://www.gatsbyjs.org"><img src="https://avatars1.githubusercontent.com/u/12551863?s=256&v=4" width="128"></a>
</td>
<td width="20%" align="center" rowspan="2" colspan="2">
  <a href="https://www.netlify.com">Netlify</a><br><br>
  <!--OC has a sharper image-->
  <a href="https://www.netlify.com"><img src="https://images.opencollective.com/netlify/4087de2/logo/256.png" width="128"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.coinbase.com">Coinbase</a><br><br>
  <a href="https://www.coinbase.com"><img src="https://avatars1.githubusercontent.com/u/1885080?s=256&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://themeisle.com">ThemeIsle</a><br><br>
  <a href="https://themeisle.com"><img src="https://avatars1.githubusercontent.com/u/58979018?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://expo.io">Expo</a><br><br>
  <a href="https://expo.io"><img src="https://avatars1.githubusercontent.com/u/12504344?s=128&v=4" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://boostnote.io">Boost Note</a><br><br>
  <a href="https://boostnote.io"><img src="https://images.opencollective.com/boosthub/6318083/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://markdown.space">Markdown Space</a><br><br>
  <a href="https://markdown.space"><img src="https://images.opencollective.com/markdown-space/e1038ed/logo/128.png" width="64"></a>
</td>
<td width="10%" align="center">
  <a href="https://www.holloway.com">Holloway</a><br><br>
  <a href="https://www.holloway.com"><img src="https://avatars1.githubusercontent.com/u/35904294?s=128&v=4" width="64"></a>
</td>
</tr>
<tr valign="middle">
<td width="100%" align="center" colspan="6">
  <br>
  <a href="https://opencollective.com/unified"><strong>You?</strong></a>
  <br><br>
</td>
</tr>
</table>

## Acknowledgments

Preliminary work for unified was done [in 2014][preliminary] for
**[retext][]** and inspired by [`ware`][ware].
Further incubation happened in **[remark][]**.
The project was finally [externalised][] in 2015 and [published][] as `unified`.
The project was authored by **[@wooorm](https://github.com/wooorm)**.

Although `unified` since moved its plugin architecture to [`trough`][trough],
thanks to **[@calvinfo](https://github.com/calvinfo)**,
**[@ianstormtaylor](https://github.com/ianstormtaylor)**, and others for their
work on [`ware`][ware], as it was a huge initial inspiration.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[logo]: https://raw.githubusercontent.com/unifiedjs/unified/93862e5/logo.svg?sanitize=true

[build-badge]: https://github.com/unifiedjs/unified/workflows/main/badge.svg

[build]: https://github.com/unifiedjs/unified/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/unifiedjs/unified.svg

[coverage]: https://codecov.io/github/unifiedjs/unified

[downloads-badge]: https://img.shields.io/npm/dm/unified.svg

[downloads]: https://www.npmjs.com/package/unified

[size-badge]: https://img.shields.io/bundlephobia/minzip/unified.svg

[size]: https://bundlephobia.com/result?p=unified

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/unifiedjs/unified/discussions

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[health]: https://github.com/unifiedjs/.github

[contributing]: https://github.com/unifiedjs/.github/blob/main/contributing.md

[support]: https://github.com/unifiedjs/.github/blob/main/support.md

[coc]: https://github.com/unifiedjs/.github/blob/main/code-of-conduct.md

[security]: https://github.com/unifiedjs/.github/blob/main/security.md

[license]: license

[author]: https://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[site]: https://unifiedjs.com

[twitter]: https://twitter.com/unifiedjs

[rehype]: https://github.com/rehypejs/rehype

[remark]: https://github.com/remarkjs/remark

[retext]: https://github.com/retextjs/retext

[syntax-tree]: https://github.com/syntax-tree

[esast]: https://github.com/syntax-tree/esast

[hast]: https://github.com/syntax-tree/hast

[mdast]: https://github.com/syntax-tree/mdast

[nlcst]: https://github.com/syntax-tree/nlcst

[xast]: https://github.com/syntax-tree/xast

[unist]: https://github.com/syntax-tree/unist

[unified-engine]: https://github.com/unifiedjs/unified-engine

[unified-args]: https://github.com/unifiedjs/unified-args

[unified-engine-gulp]: https://github.com/unifiedjs/unified-engine-gulp

[unified-language-server]: https://github.com/unifiedjs/unified-language-server

[unified-stream]: https://github.com/unifiedjs/unified-stream

[remark-rehype]: https://github.com/remarkjs/remark-rehype

[remark-retext]: https://github.com/remarkjs/remark-retext

[rehype-retext]: https://github.com/rehypejs/rehype-retext

[rehype-remark]: https://github.com/rehypejs/rehype-remark

[node]: https://github.com/syntax-tree/unist#node

[vfile]: https://github.com/vfile/vfile

[vfile-value]: https://github.com/vfile/vfile#vfilevalue

[vfile-utilities]: https://github.com/vfile/vfile#list-of-utilities

[overview]: #overview

[file]: #file

[api]: #api

[process]: #processorprocessfile-done

[process-sync]: #processorprocesssyncfile

[parse]: #processorparsefile

[parser]: #processorparser

[stringify]: #processorstringifytree-file

[run]: #processorruntree-file-done

[run-sync]: #processorrunsynctree-file

[compiler]: #processorcompiler

[data]: #processordatakey-value

[attacher]: #function-attacheroptions

[transformer]: #function-transformertree-file-next

[next]: #function-nexterr-tree-file

[freeze]: #processorfreeze

[plugin]: #plugin

[run-done]: #function-doneerr-tree-file

[process-done]: #function-doneerr-file

[contribute]: #contribute

[sponsor]: #sponsor

[rehype-react]: https://github.com/rehypejs/rehype-react

[trough]: https://github.com/wooorm/trough#function-fninput-next

[promise]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise

[remark-plugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins

[rehype-plugins]: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins

[retext-plugins]: https://github.com/retextjs/retext/blob/main/doc/plugins.md#list-of-plugins

[awesome-remark]: https://github.com/remarkjs/awesome-remark

[awesome-rehype]: https://github.com/rehypejs/awesome-rehype

[awesome-retext]: https://github.com/retextjs/awesome-retext

[topic-remark-plugin]: https://github.com/topics/remark-plugin

[topic-rehype-plugin]: https://github.com/topics/rehype-plugin

[topic-retext-plugin]: https://github.com/topics/retext-plugin

[types-hast]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/hast

[types-mdast]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/mdast

[types-nlcst]: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/nlcst

[preliminary]: https://github.com/retextjs/retext/commit/8fcb1f#diff-168726dbe96b3ce427e7fedce31bb0bc

[externalised]: https://github.com/remarkjs/remark/commit/9892ec#diff-168726dbe96b3ce427e7fedce31bb0bc

[published]: https://github.com/unifiedjs/unified/commit/2ba1cf

[ware]: https://github.com/segmentio/ware
