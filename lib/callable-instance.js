export const CallableInstance =
  /**
   * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
   */
  (
    /** @type {unknown} */
    (
      /**
       * @this {Function}
       * @param {string | symbol} property
       * @returns {(...parameters: Array<unknown>) => unknown}
       */
      function (property) {
        const self = this
        const constr = self.constructor
        const proto = /** @type {Record<string | symbol, Function>} */ (
          // Prototypes do exist.
          // type-coverage:ignore-next-line
          constr.prototype
        )
        const func = proto[property]
        /** @type {(...parameters: Array<unknown>) => unknown} */
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
    )
  )
