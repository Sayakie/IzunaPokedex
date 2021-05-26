import type { Client } from '@/structures/Client'
import { CommandArgument } from '@/structures/CommandArgument'
import type { Message, PermissionString } from 'discord.js'
import { MessageEmbed } from 'discord.js'

function dummyExecutableCommand() {
  return {
    run: () => {
      /** meow o_O */
    }
  } as Command
}

export const enum CommandCatalogue {
  /**
   * Command does not yet catalogued.
   * @default
   */
  Uncatalogued,

  Administrator,
  Supervisor,
  Moderator,
  OwnerOnly
}

export abstract class Command {
  /** The name for the command that can be retrieved. */
  public name: string

  /** The alias for the command that can be retrieved. */
  public aliases: string[]

  /** The description for the command. */
  public description: string

  /** The catalogue for the command. */
  public catalogue: CommandCatalogue

  /** The list of permission that the bot must be had. */
  public botPermissions: PermissionString[]

  /** The list of permission that target user must be had. */
  public userPermissions: PermissionString[]

  /** Allows whether the bot listens message starts with mention bot. */
  public allowBotMention: boolean

  /** Represents the client. */
  public client: Client

  /**
   * Represents the Message object. Should be initialized at the inject phase.
   */
  protected message!: Message

  /**
   * Represents the arguments styled with {@link CommandArgument}.
   * Should be initialized at the inject phase, be wrapped of the object
   * that includes some useful methods to find User, Channel or Role.
   */
  protected argument!: CommandArgument

  /** */

  /**
   * Indicates that this command is only for the Guild.
   *
   * @private @type {boolean}
   */
  #isGuilyOnly = false

  /**
   * Indicates that this command is only for the Owner.
   *
   * @private @type {boolean}
   */
  #isOwnerOnly = false

  /**
   * Indicates that this command is only for the NSFW Channel.
   *
   * @private @type {boolean}
   */
  #isNsfwOnly = false

  /**
   * Indicates that this command is hidden.
   *
   * @private @type {boolean}
   */
  #isHidden = false

  /**
   * Represents the command instance.
   *
   * @param {Client} client
   */
  protected constructor(client: Client) {
    this.client = client
    this.name = this.constructor.name
    this.aliases = []
    this.description = 'No description provided.'
    this.catalogue = CommandCatalogue.Uncatalogued
    this.botPermissions = []
    this.userPermissions = []
    this.allowBotMention = false

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.run = new Proxy(this.run, {
      apply: async run => {
        await run
          .call(this)
          .catch(console.error)
          .finally(() => {
            this.message.channel.stopTyping(true)
            this.client.setTimeout(
              () => this.message.channel.stopTyping(true),
              1667
            )
          })
          .catch(console.error)
      }
    })
  }

  /**
   * Gets whether this command is only for the Guild or not.
   *
   * @returns {boolean}
   */
  get isGuildOnly(): boolean {
    return this.#isGuilyOnly
  }

  /**
   * Gets whether this command is only for the Owner or not.
   * Does not indicate that this command can only runs on DM only.
   *
   * @returns {boolean}
   */
  get isOwnerOnly(): boolean {
    return this.#isOwnerOnly
  }

  /**
   * Gets whether this command is only for NSFW channel or not.
   * Automatically returns false when isGuildOnly is false.
   *
   * @returns {boolean}
   */
  get isNsfwOnly(): boolean {
    if (!this.isGuildOnly) return false

    return this.#isNsfwOnly
  }

  /**
   * Gets whether this command is hidden or not.
   * Never displays on help command when is true.
   *
   * @returns {boolean}
   */
  get isHidden(): boolean {
    return this.#isHidden
  }

  /**
   * Makes this command is only for the Guild.
   *
   * @returns {this}
   */
  protected guildOnly(): this {
    this.#isGuilyOnly = true

    return this
  }

  /**
   * Makes this command is only for the Owner.
   *
   * @returns {this}
   */
  protected ownerOnly(): this {
    this.#isOwnerOnly = true

    return this
  }

  /**
   * Makes this command is only for NSFW channel.
   *
   * @returns {this}
   */
  protected nsfwOnly(): this {
    this.#isNsfwOnly = true

    return this
  }

  /**
   * Makes this command is hidden at public.
   *
   * @returns {this}
   */
  protected hide(): this {
    this.#isHidden = true

    return this
  }

  /**
   * Injects the {@link Message} object and its arguments.
   *
   * @param {Message} message
   * @param {Array<string>} args
   * @return {this} Returns self
   */
  public inject(message: Message, args: string[]): Command {
    this.message = message
    this.argument = CommandArgument.of(this.client, args)

    if (
      (this.isGuildOnly && this.message.channel.type === 'dm') ||
      (this.isOwnerOnly &&
        !process.env['OWNERS']?.includes(this.message.author.id)) ||
      (this.isNsfwOnly &&
        !(
          this.message.channel.type !== 'dm' &&
          this.message.channel.type === 'text' &&
          this.message.channel.nsfw
        ))
    ) {
      return dummyExecutableCommand()
    }

    void this.message.channel.startTyping(1).catch(console.error)

    return this
  }

  /**
   * Runs the command.
   */
  public run(): Promise<void> {
    throw new Error(
      `${this.constructor.name} must be implemented before running the command`
    )
  }

  public async sendFailureMessage(...messages: Array<string>): Promise<void> {
    for await (const message of messages) {
      const embed = new MessageEmbed()
        .setColor('#F52831')
        .setDescription(message)

      await this.message.channel.send(embed)
    }
  }

  public toString(): string {
    return `Command {${this.constructor.name} - ${this.description}}`
  }
}
