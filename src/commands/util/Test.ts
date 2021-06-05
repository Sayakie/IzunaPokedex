import type { Client } from '@/structures/Client'
import { Command } from '@/structures/Command'
import { MessageEmbed } from 'discord.js'
import sharp from 'sharp'

class Test extends Command {
  constructor(client: Client) {
    super(client)

    this.name = '$$bump123'
  }

  public async run(): Promise<void> {
    const name = this.message.author.tag
    const baseImageBuf = Buffer.from(
      `<svg width="330px" height="120px" viewBox="0 0 300 120" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
        <g id="template" transform="translate(-208 -209)">
            <rect id="background" width="300" height="120" transform="translate(208 209)" fill="#232323"/>
            <text id="_usr_" data-name="${name}" transform="translate(326 286)" fill="#fff" font-size="20"><tspan x="0" y="0">Hello ${name}</tspan></text>
            <path id="icon" d="M7.5-16.68,15-13.32v5a10.351,10.351,0,0,1-2.148,6.348A9.33,9.33,0,0,1,7.5,1.68,9.33,9.33,0,0,1,2.148-1.973,10.351,10.351,0,0,1,0-8.32v-5Zm1.758,4A2.435,2.435,0,0,0,7.5-13.4a2.435,2.435,0,0,0-1.758.723A2.361,2.361,0,0,0,5-10.918a2.425,2.425,0,0,0,.742,1.777A2.4,2.4,0,0,0,7.5-8.4a2.4,2.4,0,0,0,1.758-.742A2.425,2.425,0,0,0,10-10.918,2.361,2.361,0,0,0,9.258-12.676ZM7.5-6.836a8.754,8.754,0,0,0-2.031.273,6.19,6.19,0,0,0-2.051.9A1.74,1.74,0,0,0,2.5-4.258,6.007,6.007,0,0,0,4.707-2.383,5.947,5.947,0,0,0,7.5-1.6a5.947,5.947,0,0,0,2.793-.781A6.007,6.007,0,0,0,12.5-4.258a1.486,1.486,0,0,0-.547-1.094,4.2,4.2,0,0,0-1.348-.82A10.513,10.513,0,0,0,8.984-6.66,7.147,7.147,0,0,0,7.5-6.836Z" transform="translate(302 286)" fill="#fff"/>
        </g>
      </svg>`
    )
    const semiTransparentRedPng = await sharp(
      baseImageBuf /* {
      create: {
        width: 875,
        height: 243,
        channels: 3,
        background: '#23b2b2'
      }
    })
      .composite([
        {
          input: baseImageBuf,
          blend: 'dest-in'
        }
      ]*/
    )
      .png()
      .toBuffer()
    const embed = new MessageEmbed()
      .setColor('#23b2b2')
      .attachFiles([
        {
          name: 'Bump.png',
          attachment: semiTransparentRedPng
        }
      ])
      .setDescription(`<@${this.message.author.id}>, **Bump**!`)
      .setImage('attachment://Bump.png')

    await this.message.channel.send(embed)
  }
}

export default Test
