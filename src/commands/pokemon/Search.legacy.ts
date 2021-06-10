/*
  eslint-disable
    @typescript-eslint/restrict-template-expressions,
    @typescript-eslint/no-unsafe-return,
    @typescript-eslint/no-unsafe-member-access
*/
import type { BaseStats } from '@/constants/BaseStats'
import { EnumForm } from '@/constants/enums/EnumForm'
import { EnumSpecies } from '@/constants/enums/EnumSpecies'
import { PokemonManager } from '@/managers/PokemonManager'
import type { Client } from '@/structures/Client'
import { PokemonCommand } from '@/structures/Command.Pokemon'
import data from 'data.json'
import type { TextChannel } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import { getRegExp } from 'korean-regexp'

class PokemonSearch extends PokemonCommand {
  constructor(client: Client) {
    super(client)

    this.name = '$$포켓몬검색$$'
    this.botPermissions = ['SEND_MESSAGES', 'ATTACH_FILES', 'EMBED_LINKS']
    this.guildOnly()
  }

  private padStart(padUnknown: unknown, len = 3, fillString?: string): string {
    return String(padUnknown).padStart(len, fillString)
  }

  private padCenter(
    padUnknown: unknown,
    len = String(padUnknown).length,
    fillString = ' '
  ) {
    const str = String(padUnknown)
    const leftPad = ~~((len - str.length) / 2)
    // const rightPad = ~~((len - str.length + 1) / 2)

    return fillString.repeat(leftPad) + str + fillString.repeat(leftPad)
  }

  public beforeHeader = [
    ' +-------------+',
    ' | «  before   |',
    ' +-------------+',
    ''
  ].join('\n')
  public afterHeader = [
    ' +-------------+',
    ' |    after  » |',
    ' +-------------+',
    ''
  ].join('\n')
  public bothHeader = [
    ' +-------------+-------------+',
    ' | «  before   |    after  » |',
    ' +-------------+-------------+',
    ''
  ].join('\n')

  public async run(): Promise<void> {
    if (
      this.message.guild?.id === '471737560524390420' &&
      this.message.channel.id !== '845658159669706762'
    )
      return await Promise.resolve()

    // const pokemonInfoProvider = {
    //   searchKeyword: this.argument.asArray.join(' '),
    //   form: 0
    // }

    let form = 0
    let keyword = this.argument.asArray.join(' ')
    if (keyword.startsWith('메가')) {
      keyword = this.argument.asArray.splice(1).join(' ')

      if (
        this.hasPokemon(keyword) &&
        EnumForm.MegaPokemons.some(
          species => species === this.getFromName(keyword)
        )
      ) {
        form = 1
        console.log('메가 detected')
      } else {
        await this.message.reply('메가 포켓몬이 아님!')
        return
      }
    }
    if (keyword.startsWith('알로라')) {
      keyword = this.argument.asArray.splice(1).join(' ')

      if (
        this.hasPokemon(keyword) &&
        EnumSpecies.ALOLAN.some(
          species => species === this.getFromName(keyword)
        )
      ) {
        form = 1
        console.log('알로라 detected')
      } else {
        await this.message.reply('알로라 포켓몬이 아님!')
        return
      }
    }

    const hasPokemon = this.hasPokemon(keyword)

    const relationMatches = EnumSpecies.PokemonsLocalized.flat().filter(
      pokemon =>
        getRegExp(keyword.toLowerCase(), {
          initialSearch: true,
          ignoreSpace: true,
          ignoreCase: true,
          global: true,
          fuzzy: true
        }).test(pokemon.toLowerCase())
    )

    if (hasPokemon) {
      const pokemon = this.getFromName(keyword)!

      const webhooks = await (<TextChannel>this.message.channel).fetchWebhooks()
      let webhook = webhooks.find(webhook => webhook.name === 'Izuna Pokedex')

      if (!webhook) {
        webhook = await (<TextChannel>this.message.channel).createWebhook(
          'Izuna Pokedex',
          { avatar: this.client.user?.avatarURL() as string }
        )
      }

      let pokemonBaseStats = PokemonManager.Stats.get(pokemon)!
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      if (form > 0)
        pokemonBaseStats = {
          ...pokemonBaseStats,
          ...(pokemonBaseStats.forms[`${form}`] as BaseStats)
        }
      // TODO
      const stats = Object.values({
        HP: pokemonBaseStats.stats.HP,
        Attack: pokemonBaseStats.stats.Attack,
        Defence: pokemonBaseStats.stats.Defence,
        SpecialAttack: pokemonBaseStats.stats.SpecialAttack,
        SpecialDefence: pokemonBaseStats.stats.SpecialDefence,
        Speed: pokemonBaseStats.stats.Speed
      })
        .map(stat => this.padStart(stat))
        .join(' ')
      const totalStats = this.padStart(
        Object.values(pokemonBaseStats.stats).reduce(
          (prev, cur) => prev + cur,
          0
        ),
        4
      )
      const dropItems = PokemonManager.Drops.find(
        drop => drop.pokemon.toLowerCase() === pokemon.name.toLowerCase()
      )
      const dropItem = dropItems
        ? [
            dropItems.maindropdata,
            dropItems.raredropdata,
            dropItems.optdrop1data,
            dropItems.optdrop2data
          ]
            .filter(Boolean)
            .map(String)
            .map(item => (item = item.replace(/^\w*(?=:)./, '')))
            .map(
              item =>
                data[`item.${item}.name`] ??
                data[
                  `item.${item.replace(/_(.)/, str =>
                    str.substr(1).toUpperCase()
                  )}.name`
                ] ??
                item
            )
        : ['없음']
      const beforePokemon = this.padCenter(
        pokemonBaseStats.preEvolutions?.length ?? 0 > 0
          ? EnumSpecies.getFromName(
              pokemonBaseStats.preEvolutions?.shift()
            )?.getLocalizedName()
          : '초기형',
        9
      )
      const afterPokemon = this.padCenter(
        pokemonBaseStats.evolutions?.length ?? 0 > 0
          ? EnumSpecies.getFromName(
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              pokemonBaseStats.evolutions?.shift?.()?.to?.name
            )?.getLocalizedName()
          : '최종형',
        9
      )

      const spawnInfos = PokemonManager.Spawners.get(pokemon.name)
      const spawnTimes = spawnInfos?.[0]?.condition?.times?.map(
        time => data[`time.${time.toLowerCase()}.name`]
      ) ?? ['항상 스폰되네요!']
      const rawSpawnBiomes = spawnInfos?.[0]?.condition.stringBiomes ?? [
        '항상 스폰되네요!'
      ]
      const unrefinedSpawnBiomes = Object.keys(
        PokemonManager.SpawnerConfig.biomeCategories
      ).includes(rawSpawnBiomes[0]!)
        ? PokemonManager.SpawnerConfig.biomeCategories[
            rawSpawnBiomes[0]!
          ]!.filter(
            biome => biome.startsWith('minecraft:') || biome.startsWith('ultra')
          ).map(biome => biome.replace(/^minecraft:/, ''))
        : rawSpawnBiomes

      const spawnBiomes = unrefinedSpawnBiomes
        .map(biome => data[`biome.${biome}`] ?? null)
        .filter(Boolean) ?? ['항상 스폰되네요!']

      const spawnTowns = new Set<string>()
      spawnBiomes.forEach(biome => {
        if (
          biome === 'Mesa' ||
          biome === 'Mesa (Bryce)' ||
          biome === 'Mesa Plateau' ||
          biome === 'Mesa Plateau F M'
        )
          spawnTowns.add('도암단구')
        else if (
          biome === 'Plains' ||
          biome === 'Sunflower Plains' ||
          biome === 'Extreme Hills' ||
          biome === 'Extreme Hills+' ||
          biome === 'Extreme Hills Edge'
        )
          spawnTowns.add('국화정원')
        else if (
          biome === 'Savanna' ||
          biome === 'Savanna M' ||
          biome === 'Savanna Plateau' ||
          biome === 'Savanna Plateau M' ||
          biome === 'Beach'
        )
          spawnTowns.add('대초원')
        else if (
          biome === 'Ice Plains' ||
          biome === 'Ice Plains Spikes' ||
          biome === 'Ice Mountains' ||
          biome === 'FrozenRiver' ||
          biome === 'FrozenOcean'
        )
          spawnTowns.add('눈어름 빙해')
        else if (
          biome === 'Roofed Forest' ||
          biome === 'Roofed Forest M' ||
          biome === 'ForestHills' ||
          biome === 'Extreme Hills' ||
          biome === 'Extreme Hills+' ||
          biome === 'Extreme Hills Edge'
        )
          spawnTowns.add('하늘나무 원생림')
        else if (biome === 'Swampland' || biome === 'Swampland M')
          spawnTowns.add('미궁수렁섬')
        else if (
          biome === 'Desert' ||
          biome === 'Desert M' ||
          biome === 'DesertHills'
        )
          spawnTowns.add('마른바람사원')
        else if (
          biome === 'Taiga' ||
          biome === 'Taiga M' ||
          biome === 'TaigaHills' ||
          biome === 'Mega Taiga' ||
          biome === 'Mega Spruce Taiga' ||
          biome === 'Cold Taiga' ||
          biome === 'Cold Taiga Hills'
        )
          spawnTowns.add('바늘잎 골짜기')
        else if (
          biome === 'Jungle' ||
          biome === 'Jungle M' ||
          biome === 'JungleEdge' ||
          biome === 'JungleEdge M' ||
          biome === 'JungleHills' ||
          biome === 'JungleHills M'
        )
          spawnTowns.add('나루밀림')
        else if (biome === 'Birch Forest M' || biome === 'Birch Forest Hills M')
          spawnTowns.add('은행나무 산책길')
        else if (
          biome === 'Birch Forest' ||
          biome === 'Birch Forest Hills' ||
          biome === 'Birch Forest Hills M'
        )
          spawnTowns.add('단풍옛길')
        else if (biome === 'Birch Forest' || biome === 'Birch Forest Hills')
          spawnTowns.add('백담험로')
        else if (biome === 'Hell') spawnTowns.add('꽃불화산섬')
        else if (
          biome === 'Plains' ||
          biome === 'Forest' ||
          biome === 'Flower Forest' ||
          biome === 'Roofed Forest' ||
          biome === 'Roofed Forest M'
        )
          spawnTowns.add('뚱보협곡')
        else if (
          biome === 'Plains' ||
          biome === 'Flower Forest' ||
          biome === 'Extreme Hills' ||
          biome === 'Extreme Hills Edge'
        )
          spawnTowns.add('유리꽃 총림')
        else if (
          biome === 'MushroomIsland' ||
          biome === 'MushroomIslandShore' ||
          biome === 'Swampland' ||
          biome === 'Swampland M'
        )
          spawnTowns.add('버섯나무 해안가')
      })

      const availableForms: Array<string> = [
        EnumForm.MegaPokemons.includes(pokemon) && '메가폼',
        EnumForm.AlolanPokemons.includes(pokemon) && '알로라폼',
        EnumForm.GalarianPokemons.includes(pokemon) && '가라르폼'
      ]
        .filter(Boolean)
        .map(String)

      const embed = new MessageEmbed()
        .setColor('#0099cc')
        .setDescription(
          (data[
            `pixelmon.${pokemon.name.toLowerCase()}.description`
          ] as string) + '\n\u200b'
        )
        .addField(
          ':crossed_swords: 타입',
          pokemonBaseStats.types.map(type => data[`type.${type}`]).join(', ') ||
            'unknown',
          true
        )
        .addField(
          ':shield: 특성',
          pokemonBaseStats.abilities
            .map(ability =>
              ability != null ? data[`ability.${ability}.name`] : null
            )
            .map((ability, i) => {
              if (i == 2 && ability != null) ability = `${ability}\*`
              return ability == null ? null : ability
            })
            .filter(ability => ability != null)
            .join(', ') || 'unknown',
          true
        )
        .addField('\u200b', '\u200b', true)
        .addField(
          ':egg: 알 그룹',
          pokemonBaseStats.eggGroups
            ?.map(eggGroup => data[`egg.${eggGroup}`])
            .join(', ') || 'unknown',
          true
        )
        .addField(
          ':hatching_chick: 부화 걸음 수',
          pokemonBaseStats.eggCycles
            ? (pokemonBaseStats.eggCycles + 1) * 255
            : -1 ?? 'unknown',
          true
        )
        .addField(
          ':crystal_ball: 포획률',
          ((pokemonBaseStats.catchRate * 29.3) / 100).toFixed(1) + '%' ??
            'unknown',
          true
        )
        .addField(
          ':hourglass: 출몰 시간',
          spawnTimes?.join(', ') || 'unknown',
          true
        )
        .addField(
          ':mushroom: 출몰 바이옴',
          spawnBiomes?.join(', ') || 'unknown',
          true
        )
        .addField(
          ':house_with_garden: 출몰 마을',
          Array.from(spawnTowns).join(', ') || 'unknown',
          true
        )
        .addField(
          ':hibiscus: 종족치',
          `\`\`\`ahk\n` +
            `+-------------------------+-------+\n` +
            `|  HP Atk Def SpA SpD Spe | Total |\n` +
            `+-------------------------+-------+\n` +
            `| ${stats} | ${totalStats}  |\n` +
            `+-------------------------+-------+\n` +
            `\`\`\``
        )
        .addField(
          ':headstone: 파밍 아이템',
          '```fix\n' + dropItem.join(', ') + '\n```'
        )

        // .setThumbnail(
        //   `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.getNationalPokedexNumber()}.png`
        // )
        // .setThumbnail(
        //   `https://pokeres.bastionbot.org/images/pokemon/${pokemon.getNationalPokedexInteger()}.png`
        // )
        // .setThumbnail(
        //   `https://raw.githubusercontent.com/ZeChrales/PogoAssets/master/pokemon_icons/pokemon_icon_${pokemon.getNationalPokedexNumber()}_00.png`
        // )
        .setThumbnail(
          `https://data1.pokemonkorea.co.kr/newdata/pokedex/mid/0${pokemon.getNationalPokedexNumber()}01.png`
        )
        .setFooter('*는 숨겨진 특성을 지표해요.')

      availableForms.length > 0 &&
        embed.addField(
          ':loudspeaker: 가능한 폼',
          '```py\n ' + '@ ' + availableForms.join(', ') + '\n```'
        )

      !(
        beforePokemon.trim() === '초기형' && afterPokemon.trim() === '최종형'
      ) &&
        embed.addField(
          ':diamond_shape_with_a_dot_inside: 진화',
          `\`\`\`fix\n` +
            (beforePokemon.trim() !== '초기형' &&
            afterPokemon.trim() !== '최종형'
              ? this.bothHeader +
                `=|⠀${beforePokemon}| ${afterPokemon}⠀|\n +-------------+-------------+\n`
              : beforePokemon.trim() === '초기형'
              ? this.afterHeader + `=|⠀${afterPokemon} |\n +-------------+\n`
              : this.beforeHeader +
                `=|⠀${beforePokemon} |\n +-------------+\n`) +
            '```'
        )

      await webhook.send(null, {
        username:
          `이즈나 도감 - ${pokemon.getLocalizedName()}` +
          `(#${pokemon.getNationalPokedexNumber()})`,
        avatarURL: `https://teamblank.kr/poke/sprites/pokemon/${pokemon.getNationalPokedexNumber()}${
          form > 0 ? '-alolan' : ''
        }.png`,
        embeds: [embed]
      })
    } else if (relationMatches.length > 0) {
      const embed = new MessageEmbed()
        .setColor('#F5605C')
        .setDescription(
          ':loudspeaker: 이런! 포켓몬을 찾을 수 없었어요.\n' +
            '대신 비슷한 이름의 포켓몬을 찾았어요.' +
            `\`\`\`fix\n${relationMatches.join(', ')}\n\`\`\``
        )
      await this.message.reply(null, { embed })
    } else {
      const embed = new MessageEmbed()
        .setColor('#F52831')
        .setDescription(':loudspeaker: 찾은 포켓몬이 없네요!')
      await this.message.reply(null, { embed })
    }
  }
}

export default PokemonSearch
