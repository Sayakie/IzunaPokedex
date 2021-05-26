import type { Client } from '@/structures/Client'
import { Command } from '@/structures/Command'
import { MessageEmbed } from 'discord.js'

class Dice extends Command {
  constructor(client: Client) {
    super(client)

    this.aliases = ['주사위']
  }

  public async run(): Promise<void> {
    const { length } = this.argument.asArray

    try {
      if (length === 1) {
        const range = Number(this.argument.asArray.shift())

        if (range !== range || range <= 0)
          throw new RangeError(
            'Out of range. ' + `Expected positive number but received ${range}`
          )
        const result = ~~(Math.random() * range) + 1

        const embed = new MessageEmbed().setColor('#40cd8c').setDescription(
          `:game_die: 주사위를 굴려서 **${result}**` +
            result
              .toString()
              .substr(-1)
              .replace(/[013678]/, '이')
              .replace(/[2459]/, '가') +
            ` 나왔어요!`
        )

        await this.message.channel.send(embed)
      }
    } catch (error) {
      if (error instanceof RangeError) {
        if (error.message.includes('Out of range.')) {
          await this.sendFailureMessage(
            '값이 범위를 벗어났어요. 0 초과의 숫자를 입력해주세요.'
          )
          return
        }
      }

      console.error(error)
    }
  }
}

export default Dice
