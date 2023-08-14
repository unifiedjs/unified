declare module 'unified' {
  interface Data {
    baz?: 'qux' | undefined
    foo?: 'bar' | undefined
    x?: boolean | undefined
  }
}

export {} // You may not need this, but it makes sure the file is a module.
