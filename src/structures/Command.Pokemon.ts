import { EnumSpecies } from '@/constants/enums/EnumSpecies'
import type { Client } from '@/structures/Client'
import { Command } from '@/structures/Command'
import type { TextChannel, Webhook } from 'discord.js'

export class PokemonCommand extends Command {
  constructor(client: Client) {
    super(client)
  }

  protected hasPokemon(name: string): boolean {
    return EnumSpecies.hasPokemon(name)
  }

  protected getFromName(name: string): EnumSpecies | null {
    if (this.hasPokemon(name)) return EnumSpecies.getFromName(name)
    return null
  }

  protected async getWebhook(name = 'Izuna Pokedex'): Promise<Webhook> {
    const channel = <TextChannel>this.message.channel
    const webhooks = await channel.fetchWebhooks()
    let webhook = webhooks.find(wh => wh.name === name)

    if (!webhook)
      webhook = await channel.createWebhook('Izuna Pokedex', {
        avatar: this.client.user!.avatarURL() as string
      })

    return webhook
  }

  // protected async handleFailure() {
  //   const keyword = this.argument
  //   if (this.hasPokemon())
  // }
}
