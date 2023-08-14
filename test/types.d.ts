declare module 'unified' {
  interface Data {
    alpha?: boolean | undefined
    bar?: boolean | undefined
    baz?: 'qux' | undefined
    foo?: 'bar' | boolean | undefined
    qux?: boolean | undefined
    x?: boolean | undefined
  }
}

export {} // You may not need this, but it makes sure the file is a module.
