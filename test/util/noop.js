export class NoopParser {
  parse() {}
}

export class NoopCompiler {
  compile() {}
}

export function noop() {}

// Coverage:
noop()
new NoopParser() // eslint-disable-line no-new
new NoopCompiler() // eslint-disable-line no-new
