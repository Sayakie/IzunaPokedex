/* eslint-disable @typescript-eslint/no-misused-promises */
import { Events } from '@/constants'
import type { Client } from '@/structures/Client'
import type { Listener } from '@/utils'
import type { Guild } from 'discord.js'

const { GUILD_CREATE, INFO } = Events

export default (client: Client): ReturnType<Listener> => {
  async function onGuildCreate(guild: Guild) {
    const guildConfiguration = client.$prisma.guild.findUnique({
      where: { id: guild.id },
      select: { id: true }
    })

    if (guildConfiguration) return

    await client.$prisma.guild.create({ data: { id: guild.id } })
    client.emit(
      INFO,
      `I was joined to the <Guild ${guild.name}>, ` +
        `so created dataset for <Guild ${guild.id}>`
    )
  }

  client.incrementMaxListener()
  client.on(GUILD_CREATE, onGuildCreate)

  return () => {
    client.off(GUILD_CREATE, onGuildCreate)
    client.decrementMaxListener()
  }
}
