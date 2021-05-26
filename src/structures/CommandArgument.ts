import { ChannelPattern, UserPattern } from '@/constants/Pattern'
import type { Client } from '@/structures/Client'
import type { Channel, User } from 'discord.js'

const AllowOnlyUserPattern = new RegExp(
  `^${UserPattern.source}$`,
  UserPattern.flags
)
const AllowOnlyChannelPattern = new RegExp(
  `^${ChannelPattern.source}$`,
  ChannelPattern.flags
)

export class CommandArgument {
  static of(client: Client, args: string[]): CommandArgument {
    return new CommandArgument(client, args)
  }

  private constructor(
    public readonly client: Client,
    public readonly asArray: string[]
  ) {
    this.client = client
    this.asArray = asArray
  }

  /**
   * Retrieves the user from stored arguments.
   *
   * @returns {?User} The user that found at client user cache.
   */
  public getUser(): User | undefined {
    const ResolvableUser = this.asArray
      .filter(arg => AllowOnlyUserPattern.test(arg))
      .map(user => AllowOnlyUserPattern.exec(user)?.groups as { id: string })
      .shift()

    return this.client.users.cache.find(user => user.id === ResolvableUser?.id)
  }

  /**
   * Retrieves the channel from the stored arguments.
   *
   * @returns {?Channel} The channel that found at clinet channel cache.
   */
  public getChannel(): Channel | undefined {
    const ResolvableChannel = this.asArray
      .filter(arg => AllowOnlyChannelPattern.test(arg))
      .map(
        channel =>
          AllowOnlyChannelPattern.exec(channel)?.groups as { id: string }
      )
      .shift()

    return this.client.channels.cache.find(
      channel => channel.id === ResolvableChannel?.id
    )
  }

  public toString(): string {
    return this.asArray.toString()
  }
}

export default CommandArgument
