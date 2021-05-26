import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

export const SourceDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../'
)
export const RootDirectory = resolve(SourceDirectory, '../')
