import { Palette } from '@/constants'
import type { Client } from '@/structures/Client'
import { Command } from '@/structures/Command'
import type { TextChannel } from 'discord.js'
import { MessageEmbed } from 'discord.js'

class BindPokemonSearchChannel extends Command {
  constructor(client: Client) {
    super(client)

    this.name = '바인딩'
    this.botPermissions = ['SEND_MESSAGES', 'MANAGE_WEBHOOKS']
    this.guildOnly()
  }

  public async run(): Promise<void> {
    const messageEmbed = new MessageEmbed()

    if (this.argument.asArray.length === 0) {
      await this.message.reply(
        messageEmbed
          .setColor(Palette.Error)
          .setDescription('사용법\n!바인딩 <채널 이름 또는 아이디>')
      )
      return
    }

    const channel = this.argument.getChannel()
    if (!channel) {
      await this.message.reply(
        messageEmbed
          .setColor(Palette.Error)
          .setDescription('채널이 올바르지 않아요!')
      )
      return
    }

    // Get webhooks in the channel.
    const webhooks = await (<TextChannel>channel).fetchWebhooks()
    let webhook = webhooks.find(webhook => webhook.name === 'Izuna Pokedex')

    if (webhook === undefined) {
      webhook = await (<TextChannel>channel).createWebhook('Izuna Pokedex', {
        avatar: this.client.user?.avatarURL() as string
      })
      await this.message.reply(
        messageEmbed
          .setColor(Palette.Sapphire)
          .setDescription(
            `${(<TextChannel>channel).name}에 포켓몬 검색 명령을 바인딩했어요!`
          )
      )
      return
    } else {
      await this.message.reply(
        messageEmbed
          .setColor(Palette.Scarlet)
          .setDescription(
            `${(<TextChannel>channel).name}에 이미 바인딩되어 있어요!`
          )
      )
      return
    }
  }
}

export default BindPokemonSearchChannel
