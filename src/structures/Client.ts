import { Events } from '@/constants'
import { RootDirectory } from '@/constants/Path'
import type { GuildConfiguration } from '@/structures/GuildConfiguration'
import type { Listener } from '@/utils'
import { PrismaClient } from '@prisma/client'
import buttonWrapper from 'discord-buttons'
import type { ClientOptions } from 'discord.js'
import { Client as DiscordJSClient, Collection, Intents } from 'discord.js'
import type { Command } from './Command'

const { INFO } = Events

const defaultIntents = new Intents(Intents.ALL)
//   .add(
//   Intents.FLAGS.GUILDS,
//   Intents.FLAGS.GUILD_INTEGRATIONS,
//   Intents.FLAGS.GUILD_EMOJIS,
//   Intents.FLAGS.GUILD_MESSAGES,
//   Intents.FLAGS.GUILD_WEBHOOKS
// )

const defaultClientOptions: Readonly<ClientOptions> = {
  messageCacheMaxSize: 1000,
  messageCacheLifetime: 600,
  messageSweepInterval: 60,
  // messageEditHistoryMaxSize: 100,
  retryLimit: 10,
  ws: {
    // compress: true,
  },
  intents: defaultIntents
}

/**
 * Riots, a discord bot, interacts with Discord API via DiscordJS Client.
 *
 * @category Structure
 */
export class Client extends DiscordJSClient {
  /**
   * @param {ClientOptions} [options] Options for the client.
   * If not specified, default options will be used instead.
   *
   * @private
   * @hideconstructor
   */
  constructor(options?: ClientOptions) {
    super(options ?? defaultClientOptions)

    this.configs = new Collection()

    this.$prisma = new PrismaClient()
    void this.$prisma.$connect()
    this.$prisma.$use(async (params, next) => {
      const before = Date.now()

      await next(params)

      const after = Date.now()

      this.emit(
        INFO,
        `Query ${params.model!}.${params.action} took ${after - before}ms`
      )
    })
    // Client.$prisma.$use(async (params, next) => {
    //   switch (params.action) {
    //     case 'update':
    //     case 'updateMany':
    //       // const type = params.args.data
    //       // this.configs.delete(params.args.data.id)
    //       // this.configs.set(params.args.data.id, params.args.data)
    //       break
    //     default:
    //       break
    //   }

    //   await next(params)
    // })

    buttonWrapper(this)
  }

  public readonly $prisma: PrismaClient

  /**
   * All of the guilds configuration the client is currenly handling.
   */
  public configs: Collection<string, GuildConfiguration>

  public commands!: Collection<string, Command>
  public aliases!: Collection<string, Command>
  public discordEventListeners!: ReadonlySet<ReturnType<Listener>>

  public get version(): string {
    return (
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      (require(`${RootDirectory}/package.json`) as { version: string }).version // ?? $`cat package.json | grep version | tr -dc [0-9]\.?`
    )
  }

  /**
   * Increments max listeners by one, if they are not zero.
   *
   * @param {number} [count=1]
   * @returns {void}
   */
  public incrementMaxListener(count = 1): void {
    const maxListeners = this.getMaxListeners()
    if (maxListeners !== 0) {
      this.setMaxListeners(maxListeners + count)
    }
  }

  /**
   * Decrements max listeners by one, if they are not zero.
   *
   * @param {number} [count=1]
   * @returns {void}
   */
  public decrementMaxListener(count = 1): void {
    const maxListeners = this.getMaxListeners()
    if (maxListeners !== 0 && maxListeners - count >= 0) {
      this.setMaxListeners(maxListeners - count)
    }
  }

  public toString(): string {
    return `Client v${this.version}`
  }
}
