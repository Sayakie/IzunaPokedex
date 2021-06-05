import type { Client } from '@/structures/Client'
import { Command } from '@/structures/Command'
import fetch from 'node-fetch'

class Test extends Command {
  constructor(client: Client) {
    super(client)

    this.name = '유튜브함께보기'
    this.botPermissions = ['SEND_MESSAGES']
    this.userPermissions = ['ADMINISTRATOR']
    this.guildOnly()
  }

  public async run(): Promise<void> {
    const voiceChannel = this.message.guild!.members.cache.find(
      member => member.id === this.message.author.id
    )?.voice.channel
    if (!voiceChannel) {
      await this.message.reply('먼저 음성 채널에 들어가야해요!')
      return
    }

    const returnData = {
      code: 'none'
    }
    const voiceChannelId = voiceChannel.id
    const applicationID = '755600276941176913'
    await fetch(
      `https://discord.com/api/v8/channels/${voiceChannelId}/invites`,
      {
        method: 'POST',
        body: JSON.stringify({
          max_age: 86400,
          max_uses: 0,
          target_application_id: applicationID,
          target_type: 2,
          temporary: false,
          validate: null
        }),
        headers: {
          Authorization: `Bot ${this.client.token!}`,
          'Content-Type': 'application/json'
        }
      }
    )
      .then(res => res.json())
      .then(async invite => {
        if (invite.error || !invite.code) {
          throw new Error('An error occured while retrieving data !')
        }

        if (Number(invite.code) === 50013) {
          await this.message.reply('초대 링크를 만들 권한이 없어요!')
          return
        }
        returnData.code = `https://discord.com/invite/${invite.code}`
      })

    await this.message.reply(returnData.code)
    // if (!this.client.configs.get(this.message.guild!.id)?.pokemonChannelId) {
    //   await this.message.reply(null, {
    //     embed: {
    //       color: Palette.Error,
    //       description:
    //         '먼저 포켓몬 검색 전용 채널을 설정해주세요.\n' +
    //         '```fix\n' +
    //         `!포켓몬 설정 채널` +
    //         '\n```'
    //     }
    //   })
    // }
  }
}

export default Test
