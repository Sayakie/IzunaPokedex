import { Palette } from '@/constants'
import { EnumForm } from '@/constants/enums/EnumForm'
import { EnumSpecies } from '@/constants/enums/EnumSpecies'
import { PokemonManager } from '@/managers/PokemonManager'
import type { Client } from '@/structures/Client'
import { Command } from '@/structures/Command'
import data from 'data.json'
import { MessageButton } from 'discord-buttons'
import type { Message, TextChannel } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import { getRegExp } from 'korean-regexp'

type PokemonProvider = {
  name: string
  form: number
  species: Nullable<EnumSpecies>
  showForm: boolean
  meta: Meta
}

type MetaType = Uppercase<'Normal' | 'Mega' | 'Alolan' | 'Galar'>

export class Meta {
  public static of(name: MetaType): Meta {
    return new Meta(name)
  }

  private constructor(public name: MetaType) {}

  public toString(): string {
    switch (this.name) {
      case 'NORMAL':
        return '노말'
      case 'MEGA':
        return '메가'
      case 'ALOLAN':
        return '알로라'
      case 'GALAR':
        return '가라르'
      default:
        return ''
    }
  }
}

class PokemonSearch2 extends Command {
  public Provider!: PokemonProvider
  private readonly unknown = '출몰 정보 없음'

  constructor(client: Client) {
    super(client)

    this.name = '포켓몬12344444445'
    this.guildOnly()
  }

  public inject(message: Message, args: string[]): this {
    super.inject(message, args)

    this.Provider = {
      name: this.argument.asArray.join(' '),
      form: 0,
      species: null,
      showForm: true,
      meta: Meta.of('NORMAL')
    }

    return this
  }

  public provide(provider: PokemonProvider): this {
    this.Provider = {
      ...this.Provider,
      ...provider
    }
    return this
  }

  public async run(): Promise<void> {
    // Get webhook if exists
    const webhooks = await (<TextChannel>this.message.channel).fetchWebhooks()
    let webhook = webhooks.find(webhook => webhook.name === 'Izuna Pokedex')

    if (webhook === undefined) {
      webhook = await (<TextChannel>this.message.channel).createWebhook(
        'Izuna Pokedex',
        { avatar: this.client.user?.avatarURL() as string }
      )
    }

    // Send message if the pokemon exists
    const hasPokemon = EnumSpecies.hasPokemon(this.Provider.name)
    if (hasPokemon) {
      this.Provider.species = EnumSpecies.getFromName(this.Provider.name)!

      let baseStats = PokemonManager.Stats.get(this.Provider.species)!
      if (this.Provider.form > 0)
        baseStats = baseStats.forms[this.Provider.form]!

      const spawnInfos = PokemonManager.Spawners.get(this.Provider.species.name)
      // ?.reduce(
      //   (accumulator, currentSpawnInfo) =>
      //     deepmerge(accumulator, currentSpawnInfo),
      //   {} as SpawnInfo
      // )
      let spawnInfo: Nullable<SpawnInfo> = spawnInfos?.[0]
      if (this.Provider.form > 0 && this.Provider.meta.toString() !== '메가')
        spawnInfo = (spawnInfos?.find(
          ({ spec }) => spec.form === this.Provider.form
        ) ?? spawnInfo) as Nullable<SpawnInfo>

      const spawnTimes = spawnInfo?.condition?.times?.map(
        time => data[`time.${time.toLowerCase()}.name`]
      ) ?? [this.unknown]
      const stringBiomes = spawnInfo?.condition.stringBiomes ?? [this.unknown]
      const rawBiomes = stringBiomes.filter(
        stringBiome =>
          !Object.keys(PokemonManager.SpawnerConfig).includes(stringBiome)
      )
      rawBiomes.concat(
        stringBiomes
          .filter(stringBiome =>
            Object.keys(PokemonManager.SpawnerConfig).includes(stringBiome)
          )
          .filter(
            stringBiome =>
              stringBiome.startsWith('minecraft:') ||
              stringBiome.startsWith('ultra')
          )
          .map(
            stringBiome =>
              PokemonManager.SpawnerConfig.biomeCategories[stringBiome]
          )
          .map(stringBiomes =>
            stringBiomes?.map(stringBiome =>
              stringBiome.replace(/^\w*(?=:)./, '')
            )
          )
          .filter(Boolean)
          .map(String)
      )

      const spawnBiomes = rawBiomes
        .map(biome => data[`biome.${biome}`] as string)
        .filter(Boolean)
      spawnBiomes.length === 0 && spawnBiomes.push(this.unknown)

      const reulst = Object.keys(spawnInfo?.condition)
        .filter(key => key !== 'stringBiomes' && key !== 'times')
        .map(key => ({ [key]: spawnInfo?.condition[key] }))
      console.log(reulst)
      const spawnTowns = new Set<string>()
      spawnBiomes.forEach(biome => {
        if (
          biome === 'Mesa' ||
          biome === 'Mesa (Bryce)' ||
          biome === 'Mesa Plateau' ||
          biome === 'Mesa Plateau F M'
        )
          spawnTowns.add('도암단구')
        if (
          biome === 'Plains' ||
          biome === 'Sunflower Plains' ||
          biome === 'Extreme Hills' ||
          biome === 'Extreme Hills+' ||
          biome === 'Extreme Hills Edge'
        )
          spawnTowns.add('국화정원')
        if (
          biome === 'Savanna' ||
          biome === 'Savanna M' ||
          biome === 'Savanna Plateau' ||
          biome === 'Savanna Plateau M' ||
          biome === 'Beach'
        )
          spawnTowns.add('대초원')
        if (
          biome === 'Ice Plains' ||
          biome === 'Ice Plains Spikes' ||
          biome === 'Ice Mountains' ||
          biome === 'FrozenRiver' ||
          biome === 'FrozenOcean'
        )
          spawnTowns.add('눈어름 빙해')
        if (
          biome === 'Roofed Forest' ||
          biome === 'Roofed Forest M' ||
          biome === 'ForestHills' ||
          biome === 'Extreme Hills' ||
          biome === 'Extreme Hills+' ||
          biome === 'Extreme Hills Edge'
        )
          spawnTowns.add('하늘나무 원생림')
        if (biome === 'Swampland' || biome === 'Swampland M')
          spawnTowns.add('미궁수렁섬')
        if (
          biome === 'Desert' ||
          biome === 'Desert M' ||
          biome === 'DesertHills'
        )
          spawnTowns.add('마른바람사원')
        if (
          biome === 'Taiga' ||
          biome === 'Taiga M' ||
          biome === 'TaigaHills' ||
          biome === 'Mega Taiga' ||
          biome === 'Mega Spruce Taiga' ||
          biome === 'Cold Taiga' ||
          biome === 'Cold Taiga Hills'
        )
          spawnTowns.add('바늘잎 골짜기')
        if (
          biome === 'Jungle' ||
          biome === 'Jungle M' ||
          biome === 'JungleEdge' ||
          biome === 'JungleEdge M' ||
          biome === 'JungleHills' ||
          biome === 'JungleHills M'
        )
          spawnTowns.add('나루밀림')
        if (biome === 'Birch Forest M' || biome === 'Birch Forest Hills M')
          spawnTowns.add('은행나무 산책길')
        if (
          biome === 'Birch Forest' ||
          biome === 'Birch Forest Hills' ||
          biome === 'Birch Forest Hills M'
        )
          spawnTowns.add('단풍옛길')
        if (biome === 'Birch Forest' || biome === 'Birch Forest Hills')
          spawnTowns.add('백담험로')
        if (biome === 'Hell') spawnTowns.add('꽃불화산섬')
        if (
          biome === 'Plains' ||
          biome === 'Forest' ||
          biome === 'Flower Forest' ||
          biome === 'Roofed Forest' ||
          biome === 'Roofed Forest M'
        )
          spawnTowns.add('뚱보협곡')
        if (
          biome === 'Plains' ||
          biome === 'Flower Forest' ||
          biome === 'Extreme Hills' ||
          biome === 'Extreme Hills Edge'
        )
          spawnTowns.add('유리꽃 총림')
        if (
          biome === 'MushroomIsland' ||
          biome === 'MushroomIslandShore' ||
          biome === 'Swampland' ||
          biome === 'Swampland M'
        )
          spawnTowns.add('버섯나무 해안가')
      })
      spawnTowns.size === 0 && spawnTowns.add(this.unknown)

      const messageEmbed = new MessageEmbed()
        .setColor(Palette.LightBlue)
        .setDescription(
          (data[
            `pixelmon.${this.Provider.species.name.toLowerCase()}.description`
          ] as string) + '\n\u200b'
        )
        .addField(
          ':crossed_swords: 타입',
          baseStats.types.map(type => data[`type.${type}`]).join(', '),
          true
        )
        .addField(
          ':shield: 특성',
          baseStats.abilities
            .map(ability =>
              ability != null
                ? data[`ability.${ability.replace(/\s/g, '')}.name`]
                : null
            )
            .map((ability, i) => {
              if (i == 2 && ability != null) ability = `${ability}\*`
              return ability == null ? null : ability
            })
            .filter(Boolean)
            .join(', '),
          true
        )
        .addField(
          ':hourglass: 출몰 시간',
          spawnTimes?.join(', ') ?? this.unknown,
          true
        )
        .addField(
          ':mushroom: 출몰 바이옴',
          spawnBiomes?.join(', ') ?? this.unknown,
          true
        )
        .addField(
          ':house_with_garden: 출몰 마을',
          Array.from(spawnTowns).join(', ') ?? this.unknown,
          true
        )

      const buttons = [] as Array<MessageButton>

      if (this.Provider.showForm) {
        const formCount = 0
        EnumForm.MegaPokemons.includes(this.Provider.species) &&
          buttons.push(
            new MessageButton()
              .setStyle('blurple')
              .setLabel('메가폼')
              .setID(`${this.Provider.species.name.toUpperCase()}:1:MEGA`)
          )

        EnumForm.AlolanPokemons.includes(this.Provider.species) &&
          buttons.push(
            new MessageButton()
              .setStyle('green')
              .setLabel('알로라폼')
              .setID(`${this.Provider.species.name.toUpperCase()}:1:ALOLAN`)
          )

        EnumForm.GalarianPokemons.includes(this.Provider.species) &&
          buttons.push(
            new MessageButton()
              .setStyle('green')
              .setLabel('가라르폼')
              .setID(`${this.Provider.species.name.toUpperCase()}:2:GALAR`)
          )
      }

      // await webhook.send(
      //   null,
      //   {
      //     username:
      //       `이즈나 도감 - ${Provider.species.getLocalizedName()}` +
      //       `(#${Provider.species.getNationalPokedexNumber()})`,
      //     avatarURL: `https://teamblank.kr/poke/sprites/pokemon/${Provider.species.getNationalPokedexNumber()}.png`,
      //     embeds: [messageEmbed]
      //   },
      //   {
      //     components: [{ type: 1, components: [btn.toJSON()] }]
      //   }
      // )
      await this.message.reply(null, {
        embed: messageEmbed
          .setTitle(
            `이즈나 도감 - ${
              this.Provider.meta.toString() !== '노말'
                ? this.Provider.meta.toString() + ' '
                : ''
            }${this.Provider.species.getLocalizedName()}` +
              `(#${this.Provider.species.getNationalPokedexNumber()})`
          )
          .setThumbnail(
            `https://teamblank.kr/poke/sprites/pokemon/${this.Provider.species.getNationalPokedexNumber()}-${this.Provider.meta.name.toLowerCase()}.png`
          ),
        buttons
      })
      return
    }

    const relationMatches = EnumSpecies.PokemonsLocalized.flat().filter(
      pokemon =>
        getRegExp(this.Provider.name.toLowerCase(), {
          initialSearch: true,
          ignoreSpace: true,
          ignoreCase: true,
          global: true,
          fuzzy: true
        }).test(pokemon.toLowerCase())
    )

    if (relationMatches.length > 0) {
      const messageEmbed = new MessageEmbed()
        .setColor('#F5605C')
        .setDescription(
          ':loudspeaker: 이런! 포켓몬을 찾을 수 없었어요.\n' +
            '대신 비슷한 이름의 포켓몬을 찾았어요.' +
            `\`\`\`fix\n${relationMatches.join(', ')}\n\`\`\``
        )

      await this.message.reply(messageEmbed)
    } else {
      const embed = new MessageEmbed()
        .setColor('#F52831')
        .setDescription(':loudspeaker: 찾은 포켓몬이 없네요!')
      await this.message.reply(null, { embed })
    }

    // Or send suggestion message if variant pokemons exist
  }
}

export default PokemonSearch2
