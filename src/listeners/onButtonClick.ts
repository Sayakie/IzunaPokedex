/* eslint-disable @typescript-eslint/no-misused-promises */
import type PokemonSearchDevCommand from '@/commands/pokemon/Search.dev'
import type PokemonDropItemCommand from '@/commands/pokemon/_dropItem'
import type { EnumSpecies } from '@/constants/enums/EnumSpecies'
import type { Client } from '@/structures/Client'
import type { Listener } from '@/utils'
import type {
  Channel,
  Guild,
  GuildMember,
  Message,
  User,
  WebhookClient
} from 'discord.js'

type Button = {
  client: Client
  id: string
  version: number
  token?: string
  discordID: string
  applicationID: string
  guild?: Guild
  channel?: Channel
  clicker?: User | GuildMember
  message: Message
  webhook: WebhookClient
  replied: boolean
  deffered: boolean

  think: (ephemeral?: boolean) => Promise<void>
  defer: (ephemeral?: boolean) => Promise<void>

  reply: {
    send: (content: string, options?: unknown) => Promise<void>
    fetch: () => Promise<string>
    edit: (content: unknown, options?: unknown) => Promise<unknown>
    delete: () => Promise<void>
  }
}

export default (client: Client): ReturnType<Listener> => {
  async function onButtonClick(button: Button): Promise<void> {
    if (button.replied || button.deffered) return

    const [head, name, form, formName] = button.id.split(':')

    if (head === 'FORM')
      await button.defer(true).then(
        async () =>
          await (
            client.commands.find(
              ({ name }) => name === '포켓몬'
            )! as PokemonSearchDevCommand
          )
            .inject(button.message, [name!])
            .provide({
              name: String(name),
              form: Number(form),
              formName: String(formName),
              species: null as unknown as EnumSpecies,
              etc: { showForm: false, isButton: true }
            })
            .run()
      )
    else if (head === 'DROPITEM')
      await button.defer(true).then(
        async () =>
          await (
            client.commands.find(
              ({ name }) => name === '$$DROPITEM$$'
            ) as PokemonDropItemCommand
          )
            ?.inject(button.message, [name!])
            ?.provide({
              name: String(name),
              form: 0,
              species: null as unknown as EnumSpecies,
              etc: { showForm: false }
            })
            ?.run()
      )
    else await button.defer(true)
  }

  client.incrementMaxListener()
  client.on('clickButton', onButtonClick)

  return () => {
    client.off('clickButton', onButtonClick)
  }
}
