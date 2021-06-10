import { Events, Palette } from '@/constants'
import type { Client } from '@/structures/Client'
import { CommandArgument } from '@/structures/CommandArgument'
import type { Message, PermissionString } from 'discord.js'
import { MessageEmbed } from 'discord.js'

const { ERROR } = Events

// Indicate that about command category
export const enum CommandCatalogue {
  /**
   * Command does not yet catalogued.
   * @default
   */
  Uncatalogued = 0xffff,

  Administrator = 0xaa00,
  Supervisor = 0xab00,
  Moderator = 0xac00,
  OwnerOnly = 0xad00
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

  /** Allow whether the bot listens message starts with mention bot. */
  // public allowBotMention: boolean

  /** Represent the client. */
  public readonly client: Client

  /**
   * Represent the Message object. Should be initialized at the inject phase.
   */
  protected readonly message!: Message

  /**
   * Represent the arguments styled with {@link CommandArgument}.
   * Should be initialized at the inject phase, be wrapped of the object
   * that includes some useful methods to find User, Channel or Role.
   */
  protected readonly argument!: CommandArgument

  /**
   * Indicate that this command is only for the Guild.
   *
   * @private @type {boolean}
   */
  #isGuilyOnly = false

  /**
   * Indicate that this command is only for the Owner.
   *
   * @private @type {boolean}
   */
  #isOwnerOnly = false

  /**
   * Indicate that this command is only for the NSFW Channel.
   *
   * @private @type {boolean}
   */
  #isNsfwOnly = false

  /**
   * Indicate that this command is hidden.
   *
   * @private @type {boolean}
   */
  #isHidden = false

  public readonly dummyCommand = (): this =>
    ({
      run: () => {
        /** meow o_O */
      }
    } as this)

  /**
   * Represent the command instance.
   *
   * @param {Client} client
   */
  protected constructor(client: Client) {
    this.client = client
    this.name = this.constructor.name
    this.aliases = []
    this.description = 'No description provided.'
    this.catalogue = CommandCatalogue.Uncatalogued
    this.botPermissions = ['SEND_MESSAGES']
    this.userPermissions = []

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.run = new Proxy(this.run, {
      apply: async run => {
        await run
          .call(this)
          .then(() => this.message?.channel?.stopTyping?.())
          .catch(error => this.client.emit(ERROR, error))
          .finally(() => {
            this.client.setTimeout(() => {
              // [Button] Interaction does not provided message object sometimes.
              if (!('message' in this)) return

              // Forcefully stop typing in the channel if still typings.
              if (this.client.user?.typingIn?.(this.message.channel)) {
                this.message.channel.stopTyping(true)
              }
            }, 1000)
          })
      }
    })
  }

  /**
   * Get whether this command is only for the Guild or not.
   *
   * @returns {boolean}
   */
  get isGuildOnly(): boolean {
    return this.#isGuilyOnly
  }

  /**
   * Get whether this command is only for the Owner or not.
   * Does not indicate that this command can only runs on DM only.
   *
   * @returns {boolean}
   */
  get isOwnerOnly(): boolean {
    return this.#isOwnerOnly
  }

  /**
   * Get whether this command is only for NSFW channel or not.
   * Automatically returns false when isGuildOnly is false.
   *
   * @returns {boolean}
   */
  get isNsfwOnly(): boolean {
    if (!this.isGuildOnly) return false

    return this.#isNsfwOnly
  }

  /**
   * Get whether this command is hidden or not.
   * Never displays on help command when is true.
   *
   * @returns {boolean}
   */
  get isHidden(): boolean {
    return this.#isHidden
  }

  /**
   * Make this command is only for the Guild.
   *
   * @returns {this}
   */
  protected guildOnly(): this {
    this.#isGuilyOnly = true

    return this
  }

  /**
   * Make this command is only for the Owner.
   *
   * @returns {this}
   */
  protected ownerOnly(): this {
    this.#isOwnerOnly = true

    return this
  }

  /**
   * Make this command is only for NSFW channel.
   *
   * @returns {this}
   */
  protected nsfwOnly(): this {
    this.#isNsfwOnly = true

    return this
  }

  /**
   * Make this command is hidden at public.
   *
   * @returns {this}
   */
  protected hide(): this {
    this.#isHidden = true

    return this
  }

  /**
   * Inject the {@link Message} object and its arguments.
   *
   * @param {Message} message
   * @param {Array<string>} args
   * @return {this} Returns self
   */
  public inject(message: Message, args: string[]): this {
    // @ts-expect-error
    this.message = message
    // @ts-expect-error
    this.argument = CommandArgument.of(this.client, args)

    // Prevent to execute this command when
    // * Its for guild only but channel in DM
    // * Its for owner only but others do
    // * Its for nsfw channel only but at public
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
      return this.dummyCommand()
    }

    // Check if do not have enough permissions in the guild.
    if (this.message.guild) {
      const messageEmbed = new MessageEmbed().setColor(Palette.Error)

      if (this.userPermissions.length > 0) {
        const userMissingPermissions = this.message.guild.members.cache
          .find(guildMember => guildMember.user === this.message.author)
          ?.permissionsIn(this.message.channel)
          .missing(this.userPermissions)

        if (userMissingPermissions?.length ?? 0 > 0) {
          // void this.message.reply(messageEmbed.setDescription('권한이 없네요!'))
          return this.dummyCommand()
        }
      }

      if (this.botPermissions.length > 0) {
        const botMissingPermissions = this.message.guild.me
          ?.permissionsIn(this.message.channel)
          .missing(this.botPermissions)

        if (botMissingPermissions?.length ?? 0 > 0) {
          messageEmbed.setDescription(
            '<:redcross:847302234957807657> Riots가 아래 권한이 없어요.' +
              `\`\`\`yml\n[ ${botMissingPermissions!.join(', ')} ]\n\`\`\``
          )

          if (botMissingPermissions?.includes('SEND_MESSAGES'))
            void this.message.author.send(messageEmbed)
          else void this.message.reply(messageEmbed)

          return this.dummyCommand()
        }
      }
    }

    void this.message.channel
      .startTyping(1)
      .catch(error => this.client.emit(ERROR, error))

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
        .setColor(Palette.Error)
        .setDescription(message)

      await this.message.channel.send(embed)
    }
  }

  public toString(): string {
    return `Command {${this.name ?? this.constructor.name} - ${
      this.description
    }}`
  }
}
