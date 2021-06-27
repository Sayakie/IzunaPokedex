import { Palette } from '@/constants'
import { EnumSpecies } from '@/constants/enums/EnumSpecies'
import { PokemonManager } from '@/managers/PokemonManager'
import type { Client } from '@/structures/Client'
import { Command } from '@/structures/Command'
import data from 'data.json'
import type { Message, TextChannel } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import type { PokemonProvider } from './Search.dev'

class $DropItem extends Command {
  private provider!: PokemonProvider

  constructor(client: Client) {
    super(client)

    this.name = '__DROPITEM__'
    this.botPermissions = ['SEND_MESSAGES', 'EMBED_LINKS']
    this.userPermissions = ['ADMINISTRATOR']
    this.nsfwOnly()
    this.ownerOnly()
    this.hide()
  }

  public inject(message: Message, args: Array<string>): this {
    super.inject(message, args)

    return this
  }

  public provide(provider: PokemonProvider): this {
    this.provider = {
      ...this.provider,
      ...provider
    }

    return this
  }

  public async run(): Promise<void> {
    // Get webhooks in the channel.
    const webhooks = await (<TextChannel>this.message.channel).fetchWebhooks()
    const webhook = webhooks.find(webhook => webhook.name === 'Izuna Pokedex')

    // Ignore this command if any webhook was not found.
    if (webhook === undefined) {
      // webhook = await (<TextChannel>this.message.channel).createWebhook(
      //   'Izuna Pokedex',
      //   { avatar: this.client.user?.avatarURL() as string }
      // )
      return
    }

    this.provider.species = EnumSpecies.getFromName(this.provider.name)!

    const dropItems = PokemonManager.Drops.find(
      drop =>
        drop.pokemon.toLowerCase() === this.provider.species.name.toLowerCase()
    )!
    const dropItem = [
      dropItems.maindropdata,
      dropItems.raredropdata,
      dropItems.optdrop1data,
      dropItems.optdrop2data
    ]
      .filter(Boolean)
      .map(String)
      .map(item => (item = item.replace(/^\w*(?=:)./, '')))
      .map(
        item =>
          data[`item.${item}.name`] ??
          data[
          `item.${item.replace(/_(.)/, str =>
            str.substr(1).toUpperCase()
          )}.name`
          ] ??
          item
      )

    const messageEmbed = new MessageEmbed()
      .setColor(Palette.LightBlueB)
      // .setDescription(
      //   (data[
      //     `pixelmon.${this.provider.species.name.toLowerCase()}.description`
      //   ] as string) + '\n\u200b'
      // )
      .addField(
        ':headstone: 파밍 아이템',
        '```py\n' + dropItem.join(', ') + '\n```'
      )
      .setFooter(`Requested by ${this.provider.etc!.requester!.tag}<${this.provider.etc!.requester!.id}>`)

    await this.message.channel.send(messageEmbed)
  }
}

export default $DropItem
