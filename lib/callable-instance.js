/**
 * @param {string} property
 */
export function CallableInstance(property) {
  /** @type {Function} */
  const self = this
  const constr = self.constructor
  // Prototypes do exist.
  // type-coverage:ignore-next-line
  const proto = /** @type {Record<string, Function>} */ (constr.prototype)
  const func = proto[property]
  const apply = function () {
    return func.apply(apply, arguments)
  }

  Object.setPrototypeOf(apply, proto)

  const names = Object.getOwnPropertyNames(func)

  for (const p of names) {
    const descriptor = Object.getOwnPropertyDescriptor(func, p)
    if (descriptor) Object.defineProperty(apply, p, descriptor)
  }

  return apply
}

// Prototypes do exist.
// type-coverage:ignore-next-line
CallableInstance.prototype = Object.create(Function.prototype)
