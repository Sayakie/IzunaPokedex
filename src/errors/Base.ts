import { kCode } from '@/constants/Symbol'

export class BaseError extends Error {
  #name = this.constructor.name

  protected token: string | null
  protected [kCode]: string

  constructor(public message: string) {
    super(message)

    this.token = null
    this[kCode] = this.#name

    Error.captureStackTrace?.(this, this.constructor)
  }

  get name(): string {
    if (this.token) return `${this.#name} [${this.token}]`

    return `${this.#name}`
  }

  set name(newlyName: string) {
    this.#name = newlyName
  }

  public setName(newlyName: string): this {
    this.name = newlyName

    return this
  }

  public setToken(newlyToken: string): this {
    this.token = newlyToken

    return this
  }

  public toString(): string {
    return this.name
  }
}
