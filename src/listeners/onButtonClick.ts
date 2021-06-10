/* eslint-disable @typescript-eslint/no-misused-promises */
import type PokemonDropItemCommand from '@/commands/pokemon/$dropItem'
import type PokemonSearchDevCommand from '@/commands/pokemon/Search.dev'
import type { resolvableForm } from '@/commands/pokemon/Search.dev'
import { Events } from '@/constants'
import type { EnumSpecies } from '@/constants/enums/EnumSpecies'
import type { Client } from '@/structures/Client'
import type { Listener } from '@/utils'
import type {
  Channel,
  Guild,
  GuildMember,
  Interaction,
  Message,
  User,
  WebhookClient
} from 'discord.js'

const { INTERACTION_CREATE } = Events

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
  async function onButtonClick(interaction: Interaction): Promise<void> {
    if (
      interaction.type !== 'MESSAGE_COMPONENT' ||
      !interaction.isMessageComponent() ||
      interaction.replied ||
      interaction.deferred
    )
      return await Promise.reject()

    const [head, name, form, formName] = interaction.customID.split(':')

    if (head === 'FORM')
      await interaction
        .defer(true)
        .then(
          async () =>
            await (
              client.commands.find(
                ({ name }) => name === '포켓몬'
              )! as PokemonSearchDevCommand
            )
              .inject(interaction.message as Message, [name])
              .provide({
                name: String(name),
                form: Number(form),
                formName: String(formName) as resolvableForm,
                species: null as unknown as EnumSpecies,
                etc: { showForm: false, isButton: true }
              })
              .run()
        )
        .finally(async () => interaction.deleteReply())
    else if (head === 'DROPITEM')
      await interaction
        .defer(true)
        .then(async () =>
          (
            client.commands.find(
              ({ name }) => name === '__DROPITEM__'
            ) as PokemonDropItemCommand
          )
            ?.inject?.(interaction.message as Message, [name])
            ?.provide?.({
              name: String(name),
              form: 0,
              species: null as unknown as EnumSpecies,
              etc: { showForm: false }
            })
            ?.run()
        )
        .finally(async () => interaction.deleteReply())
    else
      await interaction
        .defer(true)
        .finally(async () => interaction.deleteReply())
  }

  client.incrementMaxListener()
  client.on(INTERACTION_CREATE, onButtonClick)

  return () => {
    client.off(INTERACTION_CREATE, onButtonClick)
  }
}
