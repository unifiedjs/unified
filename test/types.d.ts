declare module 'unified' {
  interface Data {
    baz?: 'qux' | undefined
    foo?: 'bar' | undefined
    x?: boolean | undefined
    functionValue?: Function | undefined
  }

  interface Settings {
    alpha?: boolean | undefined
    bar?: boolean | undefined
    foo?: boolean | undefined
    qux?: boolean | undefined
  }
}

export {} // You may not need this, but it makes sure the file is a module.
