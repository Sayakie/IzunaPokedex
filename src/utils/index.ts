import type { Client } from 'discord.js'
import walkSync from 'walk-sync'

export type WalkOptions = Parameters<typeof walkSync>[1]

export type Listener = (client: Client) => () => void

export class Utils {
  private constructor() {
    throw new Error('Utils never could be instantiated!')
  }

  public static walk(
    directory: string,
    walkOptions?: WalkOptions
  ): ReadonlyArray<string> {
    walkOptions = {
      ...{
        includeBasePath: true,
        directories: false,
        globs: ['**/*.+(ts|m?js)'],
        ignore: ['test/**/*', '*.(test|module).+(ts|m?js)']
      },
      ...walkOptions
    }

    return walkSync(directory, walkOptions)
  }
}
