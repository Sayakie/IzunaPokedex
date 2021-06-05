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

export interface PokemonProvider {
  name: string
  form: number
  formName?: string
  species: EnumSpecies
  etc?: Partial<{
    showForm: boolean
    isButton: boolean
    [key: string]: unknown
  }>
}

class PokemonSearchDev extends Command {
  private provider!: PokemonProvider

  constructor(client: Client) {
    super(client)

    this.name = '포켓몬'
    this.botPermissions = ['SEND_MESSAGES', 'EMBED_LINKS']
    this.guildOnly()
  }

  private resolveFormName(
    resolvableFormName: 'MEGA' | `MEGA-${'X' | 'Y'}` | 'ALOLA' | 'GALAR'
  ) {
    switch (resolvableFormName) {
      case 'MEGA':
        return '메가'
      case 'MEGA-X':
        return '메가 X'
      case 'MEGA-Y':
        return '메가 Y'
      case 'ALOLA':
        return '알로라'
      case 'GALAR':
        return '가라르'
      default:
        return ''
    }
  }

  public inject(message: Message, args: Array<string>): this {
    super.inject(message, args)

    this.provide({
      name: this.argument.asArray.join(' '),
      form: 0,
      species: null as unknown as EnumSpecies,
      etc: {
        showForm: true
      }
    })

    return this
  }

  public provide(provider: PokemonProvider): this {
    this.provider = {
      ...this.provider,
      ...provider
    }

    return this
  }

  public async run(): Promise<void> {
    // Get webhooks in the channel.
    const webhooks = await (<TextChannel>this.message.channel).fetchWebhooks()
    const webhook = webhooks.find(webhook => webhook.name === 'Izuna Pokedex')

    // Ignore this command if any webhook was not found.
    if (webhook === undefined) {
      // webhook = await (<TextChannel>this.message.channel).createWebhook(
      //   'Izuna Pokedex',
      //   { avatar: this.client.user?.avatarURL() as string }
      // )
      await Promise.resolve()
      return
    }

    // Send message with embeded if the pokemon exists
    const hasPokemon = EnumSpecies.hasPokemon(this.provider.name)
    if (hasPokemon === false) {
      const messageEmbed = new MessageEmbed()
      const relatedMatches = EnumSpecies.PokemonsLocalized.flat().filter(
        pokemon =>
          getRegExp(this.provider.name.toLowerCase(), {
            initialSearch: true,
            ignoreSpace: true,
            ignoreCase: true,
            global: true,
            fuzzy: true
          }).test(pokemon.toLowerCase())
      )

      // Found related about the pokemon...?
      if (relatedMatches.length > 0)
        messageEmbed
          .setColor(Palette.ErrorLike)
          .setDescription(
            ':loudspeaker: 이런! 포켓몬을 찾을 수 없었어요.\n' +
              '대신 비슷한 이름의 포켓몬을 찾았네요.' +
              '```fix\n' +
              relatedMatches.join(', ') +
              '\n```'
          )
      else
        messageEmbed
          .setColor(Palette.Error)
          .setDescription(':loudspeaker: 찾은 포켓몬이 없네요!')

      await this.message.reply(messageEmbed)
      return
    }

    this.provider.species = EnumSpecies.getFromName(this.provider.name)!

    // Get baseStats
    let baseStats = PokemonManager.Stats.get(this.provider.species)
    if (this.provider.form > 0)
      baseStats = {
        ...baseStats,
        ...baseStats?.forms[String(this.provider.form)]
      } as BaseStats

    const spawnInfos = PokemonManager.Spawners.get(this.provider.species.name)
    // ?.reduce(
    //   (accumulator, currentSpawnInfo) =>
    //     deepmerge(accumulator, currentSpawnInfo),
    //   {} as SpawnInfo
    // )
    let spawnInfo = spawnInfos?.[0]
    if (this.provider.form > 0)
      spawnInfo = spawnInfos?.find(
        spawnInfo => spawnInfo.spec.form == this.provider.form
      )

    // ########## Spawn Times ##########
    const $$NullableSpawnTimes = spawnInfo?.condition?.times
      ?.map(time => data[`time.${time.toLowerCase()}`] ?? time)
      .filter(Boolean)
      .map(String)
    const spawnTimes = ([] as Array<string>).concat(
      ...($$NullableSpawnTimes ?? [])
    )

    if (spawnTimes.length === 0) spawnTimes.push('출몰 정보 없음')

    // ########## Spawn Biomes ##########
    const $$NullableSpawnBiomes = spawnInfo?.condition?.stringBiomes
    const $$UnrefinedSpawnBiomes = $$NullableSpawnBiomes
      ?.map(biome => {
        // biomes has in category
        if (
          Object.keys(PokemonManager.SpawnerConfig.biomeCategories).includes(
            biome
          )
        ) {
          const $biomesInCategory =
            PokemonManager.SpawnerConfig.biomeCategories[biome]

          return $biomesInCategory
            ?.filter(
              biome =>
                biome.startsWith('minecraft:') || biome.startsWith('ultra_')
            )
            .map(biome => biome.replace(/^\w*(?=:)./, ''))
        }

        return biome
      })
      .flat()
      .map(biome => data[`biome.${biome!}`] as string)
      .filter(Boolean)
      .map(String)
    const spawnBiomes = ([] as Array<string>).concat(
      ...($$UnrefinedSpawnBiomes ?? [])
    )

    if (spawnBiomes.length === 0) spawnBiomes.push('출몰 정보 없음')

    // ########## Spawn Towns ##########
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
      if (biome === 'Desert' || biome === 'Desert M' || biome === 'DesertHills')
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

    if (spawnTowns.size === 0) spawnTowns.add('출몰 정보 없음')

    // ########## Stats ##########
    const stats = Object.values(baseStats?.stats || {})
      .map(stat => String(stat).padStart(3))
      .join(' ')
    const totalStats = String(
      Object.values(baseStats?.stats || {}).reduce(
        (prev, curr) => prev + curr,
        0
      )
    ).padStart(4)

    // ########## Extra Variable ##########
    const isInlineEmbededBlock =
      spawnBiomes.length >= 4 || spawnTowns.size >= 3 ? false : true
    const hasDroppableItems = PokemonManager.Drops.some(
      drop =>
        drop.pokemon.toLowerCase() === this.provider.species.name.toLowerCase()
    )
    let shouldHintAboutHiddenAbility = false

    // ###
    // ### PART: Factory of MessageEmbed
    // ###
    // ####################################################
    const messageEmbed = new MessageEmbed()
      .setColor(Palette.LightBlue)
      .setAuthor(
        `이즈나 도감 - ${this.provider.species.getLocalizedName()}` +
          `(#${this.provider.species.getNationalPokedexNumber()})`,
        'https://teamblank.kr/poke/sprites/pokemon/' +
          `${this.provider.species.getNationalPokedexNumber()}.png`
      )
      .setDescription(
        (data[
          `pixelmon.${this.provider.species.name.toLowerCase()}.description`
        ] as string) + '\n\u200b'
      )
      .addField(
        ':crossed_swords: 타입',
        baseStats?.types.map(type => data[`type.${type}`]).join(', ') ??
          '정보 없음',
        true
      )
      .addField(
        ':shield: 특성',
        baseStats?.abilities
          .map(ability =>
            ability != null
              ? data[`ability.${ability.replace(/\s/g, '')}.name`]
              : null
          )
          .map((ability, i) => {
            if (i == 2 && ability != null) {
              ability = `${ability}\*`
              shouldHintAboutHiddenAbility = true
            }
            return ability == null ? null : ability
          })
          .filter(Boolean)
          .join(', ') ?? '정보 없음',
        true
      )
      .addField('\u200b', '\u200b', true)
      .addField(
        ':egg: 알 그룹',
        baseStats?.eggGroups
          ?.map(eggGroup => data[`egg.${eggGroup}`])
          .join(', ') ?? '정보 없음',
        true
      )
      .addField(
        ':hatching_chick: 부화 걸음 수',
        ((baseStats?.eggCycles || NaN) + 1) * 255 || '정보 없음',
        true
      )
      .addField(
        ':crystal_ball: 포획률',
        baseStats?.catchRate ?? '정보 없음',
        true
      )
      .addField(
        ':hourglass: 출몰 시간',
        spawnTimes?.join(', ') ?? '출몰 정보 없음',
        true
      )
      .addField(
        ':mushroom: 출몰 바이옴',
        spawnBiomes?.join(', ') ?? '출몰 정보 없음',
        isInlineEmbededBlock
      )
      .addField(
        ':house_with_garden: 출몰 마을',
        Array.from(spawnTowns).join(', ') ?? '출몰 정보 없음',
        isInlineEmbededBlock
      )
      .addField(
        ':hibiscus: 종족치',
        '```ahk\n' +
          `+-------------------------+-------+\n` +
          `|  HP Atk Def SpA SpD Spe | Total |\n` +
          `+-------------------------+-------+\n` +
          `| ${stats} | ${totalStats}  |\n` +
          `+-------------------------+-------+\n` +
          '\n```'
      )

    const buttons = [] as Array<MessageButton>
    if (this.provider.etc?.showForm) {
      if (EnumForm.MegaPokemons.includes(this.provider.species))
        buttons.push(
          new MessageButton()
            .setStyle('blurple')
            .setLabel('메가폼')
            .setID(`FORM:${this.provider.species.name.toUpperCase()}:1:MEGA`)
        )

      if (EnumForm.MegaXYPokemons.includes(this.provider.species))
        buttons.push(
          new MessageButton()
            .setStyle('blurple')
            .setLabel('메가 X폼')
            .setID(`FORM:${this.provider.species.name.toUpperCase()}:1:MEGA-X`),
          new MessageButton()
            .setStyle('blurple')
            .setLabel('메가 Y폼')
            .setID(`FORM:${this.provider.species.name.toUpperCase()}:2:MEGA-Y`)
        )

      if (EnumForm.AlolanPokemons.includes(this.provider.species))
        buttons.push(
          new MessageButton()
            .setStyle('green')
            .setLabel('알로라폼')
            .setID(`FORM:${this.provider.species.name.toUpperCase()}:1:ALOLA`)
        )

      if (EnumForm.GalarianPokemons.includes(this.provider.species))
        buttons.push(
          new MessageButton()
            .setStyle('green')
            .setLabel('가라르폼')
            .setID(`FORM:${this.provider.species.name.toUpperCase()}:2:GALAR`)
        )
    }
    if (hasDroppableItems)
      buttons.push(
        new MessageButton()
          .setStyle('red')
          .setLabel('파밍 아이템')
          .setID(`DROPITEM:${this.provider.species.name.toLowerCase()}`)
          .setDisabled(true)
      )

    if (shouldHintAboutHiddenAbility)
      messageEmbed.setFooter('*는 숨겨진 특성을 지표해요.')

    if (this.provider.etc?.isButton || false) {
      messageEmbed.setAuthor(
        `이즈나 도감 - ${
          this.provider.formName
            ? this.resolveFormName(this.provider.formName) + ' '
            : ''
        }${this.provider.species.getLocalizedName()}` +
          `(#${this.provider.species.getNationalPokedexNumber()})`,
        'https://teamblank.kr/poke/sprites/pokemon/' +
          `${this.provider.species.getNationalPokedexNumber()}${
            this.provider.formName
              ? '-' + this.provider.formName.toLowerCase()
              : ''
          }.png`
      )
    }

    await this.message.reply(null, {
      embed: messageEmbed,
      // .setThumbnail(
      //   'https://teamblank.kr/poke/sprites/pokemon/' +
      //     `${this.provider.species.getNationalPokedexNumber()}.png`
      // )
      // @ts-expect-error
      buttons
    })
  }
}

export default PokemonSearchDev
