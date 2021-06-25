export class SimpleParser {
  constructor(file) {
    this.value = file.toString()
  }

  parse() {
    return {type: 'text', value: this.value}
  }
}

export class SimpleCompiler {
  constructor(node) {
    this.node = node
  }

  compile() {
    return this.node.value
  }
}
