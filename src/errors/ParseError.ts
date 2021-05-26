import { BaseError } from '@/errors/Base'

export class ParseError extends BaseError {
  constructor(public message: string) {
    super(message)
  }
}
