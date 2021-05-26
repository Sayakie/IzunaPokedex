/* eslint-disable @typescript-eslint/no-misused-promises */
import { Events, Palette } from '@/constants'
import { EnumForm } from '@/constants/enums/EnumForm'
import { EnumSpecies } from '@/constants/enums/EnumSpecies'
import { PokemonManager } from '@/managers/PokemonManager'
import type { Client } from '@/structures/Client'
import type { GuildConfiguration } from '@/structures/GuildConfiguration'
import type { Listener } from '@/utils'
import type { Message } from 'discord.js'
import { MessageEmbed } from 'discord.js'

const { CLIENT_READY, MESSAGE_CREATE, INFO } = Events

export default (client: Client): ReturnType<Listener> => {
  async function onReady() {
    client.emit(INFO, `Logged in as ${client.user!.tag}`)

    await PokemonManager.loadAllStats()
    await PokemonManager.loadAllDrops()
    await PokemonManager.loadAllSpawners()

    // const b: UnionToIntersection<typeof EnumForm.Forms>
    // b.Alolan
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
  }

  async function handleMessage(message: Message) {
    // Abort incoming from system
    if (message.system) return

    // Abort incoming not from the Guild
    // if (!message.guild) return

    // Abort if is me
    if (message.author.equals(client.user!)) return

    const guildConfig = message.guild
      ? client.configs.find(({ id }) => id === message.guild?.id)
      : ({ commandInvokeToken: '/', ignoreTheBot: true } as GuildConfiguration)

    // Abort if the guild configuration tell us ignore the bot
    if (guildConfig?.ignoreTheBot && message.author.bot) return

    // Abort if the message invoke token is invalid
    if (
      !message.cleanContent.startsWith(guildConfig?.commandInvokeToken ?? '/')
    )
      return

    const CommandArguments = message.content
      .toLowerCase()
      .substring(guildConfig?.commandInvokeToken?.length ?? 1)
      .trim()
      .split(/"((?:""|[^"])*)"|\s+/g)
      .filter(v => Boolean(v))
    const CommandToken = CommandArguments.shift()

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

  client.incrementMaxListener(2)
  client.on(CLIENT_READY, onReady)
  client.on(MESSAGE_CREATE, handleMessage)

  return () => {
    client.off(CLIENT_READY, onReady)
    client.off(MESSAGE_CREATE, handleMessage)
    client.decrementMaxListener(2)
  }
}
