import type { Client } from '@/structures/Client'
import { Command, CommandCatalogue } from '@/structures/Command'
import { MessageEmbed } from 'discord.js'

class Evaluate extends Command {
  constructor(client: Client) {
    super(client)

    this.aliases = ['eval', '실행']
    this.catalogue = CommandCatalogue.OwnerOnly
    this.ownerOnly()
    this.hide()
  }

  public async run(): Promise<void> {
    const script = this.argument.asArray.join(' ')
    let result = {
      language: 'js',
      message: null
    } as { language: 'js' | 'yml'; message: string | null }

    try {
      const evalInContext = async () =>
        async function (script: string) {
          let evaled = eval(script) as unknown | PromiseConstructorLike
          if (evaled instanceof Promise) {
            evaled = await evaled
          }

          return evaled
        }.call(this.client, script)

      result.message = (await evalInContext()) as string
    } catch (error) {
      const IError =
        error instanceof Error
          ? `[${error.name}]\n${error.message}`
          : (error as string)

      result = {
        language: 'yml',
        message: IError
      }
    }

    const messageEmbed = new MessageEmbed().addField(
      'output',
      `\`\`\`${result.language}\n${result.message as string}\n\`\`\``
    )

    await this.message.reply(messageEmbed)
  }
}

export default Evaluate
