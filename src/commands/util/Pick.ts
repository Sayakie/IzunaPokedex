import { Palette } from '@/constants'
import type { Client } from '@/structures/Client'
import { Command } from '@/structures/Command'
import { randomInt } from 'crypto'
import { MessageEmbed } from 'discord.js'

class Pick extends Command {
  constructor(client: Client) {
    super(client)

    this.aliases = ['골라']
    this.guildOnly()
  }

  public async run(): Promise<void> {
    const { length } = this.argument.asArray
    const embed = new MessageEmbed()

    if (length < 2) {
      await this.message.reply(
        embed
          .setColor(Palette.Red)
          .setDescription('두 가지 이상 선택지를 적어주세요!')
      )

      return
    }

    const count =
      Number(
        this.argument.asArray
          .find(arg => arg.startsWith('?') && /^\d+$/.test(arg.substr(-1)))
          ?.substr(-1)
      ) || 1

    const result = [] as Array<string>
    for (let i = 0; i < count; i++) {
      const randomIndex = randomInt(length)
      const value = this.argument.asArray[randomIndex]!
      if (value.startsWith('?') || result.includes(value)) {
        i--
        continue
      }

      result.push(value)
    }

    await this.message.reply(
      embed.setColor(Palette.Sapphire).setDescription(`${result.join(', ')}`)
    )
  }
}

export default Pick
