/* eslint-disable @typescript-eslint/no-misused-promises */
import { Events, Palette } from '@/constants'
import { EnumForm } from '@/constants/enums/EnumForm'
import { EnumSpecies } from '@/constants/enums/EnumSpecies'
import { PokemonManager } from '@/managers/PokemonManager'
import type { Client } from '@/structures/Client'
import type { Listener } from '@/utils'
import type { Message, TextChannel } from 'discord.js'
import { MessageEmbed } from 'discord.js'

const CACHE = [] as Array<Message>
const { CLIENT_READY, MESSAGE_CREATE, INFO, ERROR } = Events

export default (client: Client): ReturnType<Listener> => {
  async function onReady() {
    client.emit(INFO, `Logged in as ${client.user!.tag}`)
    client.emit(
      INFO,
      `Registered ${client.commands.size} commands and listening ${client.discordEventListeners.size} events.`
    )

    await client.$prisma
      .$connect()
      .then(() =>
        client.user?.setPresence({
          status: 'idle',
          activities: [{ type: 'LISTENING', name: '포켓몬 도감 준비 중...' }]
        })
      )
      .then(async () => await PokemonManager.loadAllStats())
      .then(async () => await PokemonManager.loadAllDrops())
      .then(async () => await PokemonManager.loadAllSpawners())
      .then(() => {
        for (const species of EnumSpecies.Pokemons)
          EnumForm.formList.set(species, EnumForm.Forms.Normal)
        for (const genderSpecies of EnumForm.GenderPokemons) {
          EnumForm.formList.set(genderSpecies, EnumForm.Forms.Gender.Male)
          EnumForm.formList.set(genderSpecies, EnumForm.Forms.Gender.Female)
        }
        for (const megaSpecies of EnumForm.MegaPokemons)
          EnumForm.formList.set(megaSpecies, EnumForm.Forms.Mega)
        for (const alolanSpecies of EnumForm.AlolanPokemons)
          EnumForm.formList.set(alolanSpecies, EnumForm.Forms.Alolan)
        for (const galarianSpecies of EnumForm.GalarianPokemons)
          EnumForm.formList.set(galarianSpecies, EnumForm.Forms.Galarian)
      })
      // .then(async () => {
      //   const guildDataSet =
      //     (await client.$prisma.guild.findMany({
      //       select: { id: true }
      //     })) || []
      //   const guildIds = client.guilds.cache.map(({ id }) => id)

      //   try {
      //     guildIds
      //       .filter(id => guildDataSet.every(guild => guild.id !== id))
      //       .forEach(async id => {
      //         await client.$prisma.guild.create({ data: { id } })

      //         client.emit(INFO, `Created dataset for <Guild ${id}>`)
      //       })
      //   } catch (error) {
      //     client.emit(ERROR, error)
      //     process.exit(1)
      //   }
      // })
      .then(() =>
        client.user?.setPresence({
          status: 'online',
          activities: [{ type: 'LISTENING', name: `Riots@v${client.version}` }]
        })
      )
      .catch(error => client.emit(ERROR, error))

    client.$prisma.$queryRaw`SELECT * FROM Guild`
  }

  async function handleMessage(message: Message) {
    // Abort incoming from system
    if (message.system) return

    // Abort incoming not from the Guild
    // if (!message.guild) return

    // Abort if is me
    if (message.author.equals(client.user!)) return

    // Abort if the guild configuration tell us ignore the bot
    if (message.author.bot) return

    // const guildConfig = message.guild
    //   ? await Client.$prisma.guild.findUnique({
    //       where: { id: message.guild.id },
    //       select: { commandInvokeToken: true }
    //     })
    //   : ({ commandInvokeToken: '!' } as GuildConfiguration)
    const guildConfig = { commandInvokeToken: '!' }
    CACHE.push(message)

    // Abort if the message invoke token is invalid
    if (
      !message.cleanContent.startsWith(guildConfig?.commandInvokeToken ?? '!')
      // &&
      // !message.content.startsWith(`<@!${client.user!.id}>`)
    )
      return

    const CommandArguments = message.content
      .substring(guildConfig?.commandInvokeToken?.length ?? 1)
      .trim()
      .split(/"((?:""|[^"])*)"|\s+/g)
      .filter(v => Boolean(v))
    const CommandToken = CommandArguments.shift()?.toLowerCase()

    if (CommandToken === undefined) return

    if (
      !(client.commands.has(CommandToken) || client.aliases.has(CommandToken))
    ) {
      // await message.reply(`Does not found the Command for ${CommandToken}!`)
      return
    }

    try {
      const command =
        client.commands.get(CommandToken)! ?? client.aliases.get(CommandToken)!

      await command.inject(message, CommandArguments).run()
    } catch (error) {
      const embed = new MessageEmbed()

      if (error instanceof Error) {
        embed.setColor(Palette.Error)
        if (error.message.length > 1900)
          await message.reply(
            embed.attachFiles([
              {
                attachment: error.toString(),
                name: `${Date.now()}.${error.name.split(/\s/).shift()!}.txt`
              }
            ])
          )
        else
          await message.reply(
            embed.setDescription(
              `\`\`\`diff\n+ ${error.name}\n- ${error.message}\n\`\`\``
            )
          )
      } else await message.reply(`Unknown error :(`)

      console.error(error)
    }
  }

  async function flushCachedMessage() {
    const channel =
      client.channels.cache.get('854360412618489866') as Nullable<TextChannel>

    if (channel) {
      if (CACHE.length === 0) return

      for await (const message of CACHE) {
        const embed = new MessageEmbed()
          .setColor(Palette.Crimson)
          .setAuthor(message.author.tag, message.author.avatarURL() as string)
          .setDescription('> ```fix\n' + `> ${message.cleanContent.replace(/\n/g, '\n> ')}` + '\n> ```')
          .setFooter(`UserID : ${message.author.id} · GuildInfo : ${message.guild!.name} <${message.guild!.id}>`,)

        await channel
          .send(embed)
          .finally(() => CACHE.splice(CACHE.indexOf(message)))
      }
    }
    else client.clearInterval(flushTimeout)
  }

  client.incrementMaxListener(2)
  client.on(CLIENT_READY, onReady)
  client.on(MESSAGE_CREATE, handleMessage)
  const flushTimeout = client.setInterval(flushCachedMessage, 5000)

  return () => {
    client.off(CLIENT_READY, onReady)
    client.off(MESSAGE_CREATE, handleMessage)
    client.decrementMaxListener(2)
    client.clearInterval(flushTimeout)
  }
}
