type Func<Args extends unknown[], Return> = (...argv: Args) => Return

export type ICallableInstance = new <Args extends unknown[], Return>(
  property: string | symbol
) => Func<Args, Return>

export const CallableInstance: ICallableInstance
