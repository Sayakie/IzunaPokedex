import { Palette } from "@/constants"
import { EnumSpecies } from "@/constants/enums/EnumSpecies"
import { PokemonManager } from "@/managers/PokemonManager"
import type { Client } from "@/structures/Client"
import { Command } from "@/structures/Command"
import type { Message, TextChannel } from "discord.js"
import { MessageEmbed } from "discord.js"
import type { PokemonProvider } from "./Search.dev"

export class PokemonEvolution extends Command {
  private provider!: PokemonProvider

  constructor(client: Client) {
    super(client)

    this.name = '__EVOLUTION__'
    this.botPermissions = ['SEND_MESSAGES', 'EMBED_LINKS']
    this.userPermissions = ['ADMINISTRATOR']
    this.ownerOnly()
    this.guildOnly()
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

    const baseStats = PokemonManager.Stats.get(this.provider.species)
    const preEvolution = baseStats?.preEvolutions?.slice().shift()

    const embed = new MessageEmbed()
    if (!preEvolution) {
      embed
        .setColor(Palette.Error)
        .setDescription('데이터가 없어요!\n만약 버그라고 생각하신다면 <@247351691077222401>로 문의주세요!')

      await this.message.channel.send(null, { embed })
      return
    }

    const prePokemon = EnumSpecies.getFromName(preEvolution)!
    const preBaseStats = PokemonManager.Stats.get(prePokemon)
    const evolutions = preBaseStats?.evolutions

    if (!evolutions) {
      embed
        .setColor(Palette.Error)
        .setDescription('데이터가 없어요!\n만약 버그라고 생각하신다면 <@247351691077222401>로 문의주세요!')

      await this.message.channel.send(null, { embed })
      return
    }

    evolutions.map(async evolution => {
      const embed = new MessageEmbed()
        .setDescription(`${prePokemon.getLocalizedName()}이(가) ` + `레벨 ${evolution.level!}에 ` + (
          evolution.conditions.map(condition => {
            switch (condition.evoConditionType) {
              case 'gender':
                return `${condition.genders.join(' ')}일 때 `
              case 'friendship':
                return `친밀도가 ${condition.friendship} 이상일 때 `
              case 'heldItem':
                return `${condition.item.itemID}을 들고 있을 때 `
              case 'move':
                return `${condition.attackIndex}????일 때 `
            }
          }
          ).join(' 그리고 ')
        ) + evolution.evoType + '을(를) 통해 ' + evolution.to.name + '으로 진화해요!')

      await this.message.channel.send(embed)
    })
  }
}

export default PokemonEvolution
