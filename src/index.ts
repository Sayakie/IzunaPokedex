import { Events, RootDirectory, SourceDirectory } from '@/constants'
import { ParseError } from '@/errors/ParseError'
import { Client } from '@/structures/Client'
import type { Command } from '@/structures/Command'
import type { Listener } from '@/utils'
import { Utils } from '@/utils'
import chalk from 'chalk'
import { Collection } from 'discord.js'
import type { DotenvConfigOutput } from 'dotenv'
import { config as dotEnvParse } from 'dotenv'
import { access } from 'fs/promises'

const { INFO } = Events

// Re-map process environment from environment variable definition like
// .env, .env.local, .env.development or .env.production. which should
// be located in the root of the project.
const { NODE_ENV } = process.env

const nodeEnvFile =
  NODE_ENV === 'production' ? '.env.production' : '.env.development'

await Promise.all(
  ['.env', '.env.local', nodeEnvFile].map(
    async envFile =>
      await access(`${RootDirectory}/${envFile}`)
        .then(() => envFile)
        .catch(() => false)
  )
)
  .then(unrefinedEnvFiles => unrefinedEnvFiles.filter(Boolean).map(String))
  .then(envFiles =>
    envFiles.map(
      envFile =>
        [
          envFile,
          dotEnvParse({
            path: `${RootDirectory}/${envFile}`,
            encoding: 'utf-8'
          })
        ] as [string, DotenvConfigOutput]
    )
  )
  .then(rawComponents => {
    rawComponents
      .filter(([, { error }]) => Boolean(error))
      .forEach(([envFileName, { error }], i, { length }) => {
        const parseError = new ParseError(
          `${error!.message}\n` + `    at File: "${envFileName}"`
        )

        if (length === i + 1) throw parseError
        else console.error(parseError)
      })
  })
  .catch(error => {
    if (error instanceof ParseError) {
      if (error.message.includes('invalid encoding'))
        error.setToken('DOTENV_INVALID_ENCODING_ARGUMENT')
    }

    throw error
  })

// Mapping below signals to handle about how terminates DiscordJS Client
// with in harmony. In the future, We could add more handlers for this signals.
const signals: ReadonlyArray<NodeJS.Signals> = ['SIGINT', 'SIGHUP']
const signalHandler = (signal: NodeJS.Signals) => {
  // Error code ref: https://m.blog.naver.com/namhong2001/221488905144
  signals.forEach(signal => process.off(signal, signalHandler))

  process.exitCode = 1

  try {
    Array.from(listeners)
      .filter(Boolean)
      .forEach(cleanup => cleanup())

    void client.$prisma.$disconnect()
    process.stdout.write('\n\n')
    client.emit(
      INFO,
      `Detected hook: ${chalk.cyan.bold(signal)}\n` + 'Try to destroy...'
    )
    client.destroy()
    process.exitCode = 0
  } catch (error) {
    if (error instanceof Error) {
      if (error.name.includes('ASDF')) process.exitCode = 35
    } else {
      throw new Error(error)
    }
  } finally {
    if (process.exitCode || 0 > 0)
      console.warn(chalk.yellow('Am I terminating up in harmony...?'))

    process.exit()
  }
}

signals.forEach(signal => {
  process.once(signal, signalHandler)
})

// Handle unhandled exceptions or rejection from Promise.
process.on('uncaughtException', error => {
  console.log(chalk.red.bold('Uncaught exception occured!'))
  console.error(error)
})

// process.on('unhandledRejection', (reason, promise) => {
//   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
//   console.error(`Unhandled rejection occured at ${promise}: ${reason}`)
//   process.exit(1)
// })

// Hooks "beforeExit"
// Client.db.$on('beforeExit', async () => {
//   await Client.db.guild
// })

// Initialize the client. Must be call #setup function for only once
// while the application is running.
const client = new Client()

const commands: Collection<string, Command> = new Collection()
const aliases: Collection<string, Command> = new Collection()
const commandFiles = Utils.walk(`${SourceDirectory}/commands`) ?? []
for await (const commandFile of commandFiles) {
  const { default: command } = (await import(`${commandFile}`)) as {
    default: new (client: Client) => Command
  }

  const Command = new command(client)
  commands.set(Command.name.toLowerCase(), Command)
  Command.aliases.forEach(alias => aliases.set(alias.toLowerCase(), Command))
}

client.commands = commands
client.aliases = aliases

const listeners: ReadonlySet<ReturnType<Listener>> = new Set()
const listenerFiles = Utils.walk(`${SourceDirectory}/listeners`) ?? []
for await (const listenerFile of listenerFiles) {
  const { default: listener } = (await import(`${listenerFile}`)) as {
    default: Listener
  }

  const cleanup = listener(client)
  ;(listeners as Set<ReturnType<Listener>>).add(cleanup)
}

client.discordEventListeners = listeners

function attachInterval() {
  attachInterval.timeoutId = setInterval(() => {
    client.emit(
      INFO,
      `Serving ${chalk.blueBright(client.users.cache.size)} users ` +
        `from ${chalk.green(client.guilds.cache.size)} guilds.`
    )
  }, 60000)
}

attachInterval.timeoutId = undefined as Nullable<NodeJS.Timeout>

void client.login().then(attachInterval).catch(signalHandler)
