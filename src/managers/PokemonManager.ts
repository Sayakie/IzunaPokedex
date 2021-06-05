import { EnumSpecies } from '@/constants/enums/EnumSpecies'
import { RootDirectory } from '@/constants/Path'
import { Utils } from '@/utils'
import chalk from 'chalk'

export type PokeDrop = {
  pokemon: string
  maindropdata: string
  maindropmin: number
  maindropmax: number
  raredropdata?: string
  raredropmin?: number
  raredropmax?: number
  optdrop1data?: string
  optdrop1min?: number
  optdrop1max?: number
  optdrop2data?: string
  optdrop2min: number
  optdrop2max: number
}

export interface SpawnSet {
  id: string
  spawnInfos: Array<SpawnInfo>
}

export interface SpawnInfo {
  spec: { name: string; form?: number }
  stringLocationTypes: Array<'Grass'>
  minLevel: number
  maxLevel: number
  typeID: 'pokemon'
  heldItems: Array<HeldItem>
  condition: SpawnCondition
  rarity: number
}

export interface SpawnCondition {
  times: Array<'DAY' | 'NIGHT'>
  stringBiomes: Array<string>
}

export type HeldItem = { itemID: string; percentChance: number }

export interface GlobalCompositeCondition {
  condition: Array<{
    dimentions?:
      | Array<number>
      | { tag: 'ultrabeast' | 'legendary'; requiredSpace: number }
  }>
  anticonditions: Array<unknown>
}

export interface SpawnerConfig {
  globalCompositeCondition: GlobalCompositeCondition
  autoTagSpecs: {
    shiny: 'shiny'
    gen1: 'generation:1'
    gen2: 'generation:2'
    gen3: 'generation:3'
    gen4: 'generation:4'
    gen5: 'generation:5'
    gen6: 'generation:6'
    gen7: 'generation:7'
    gen8: 'generation:8'
    legendary: 'islegendary:true'
    nonlegendary: 'islegendary:false'
  }
  blockCategories: Record<string, Array<string>>
  biomeCategories: Record<string, Array<string>>
}

export class PokemonManager {
  public static SpawnerConfig: SpawnerConfig
  public static Stats: WeakMap<EnumSpecies, BaseStats> = new WeakMap()
  public static Drops: ReadonlyArray<PokeDrop> = []
  public static Spawners: ReadonlyMap<string, Array<SpawnInfo>> = new Map()

  public static async loadAllStats(): Promise<void> {
    for await (const species of EnumSpecies.Pokemons) {
      const baseStats = (await import(
        `${RootDirectory}/data/pixelmon/stats/${species.getNationalPokedexNumber()}.json`
      )) as BaseStats

      this.Stats.set(species, baseStats)
    }
  }

  public static async loadAllDrops(): Promise<void> {
    this.Drops = (await import(
      `${RootDirectory}/data/pixelmon/drops/pokedrops.json`
    )) as ReadonlyArray<PokeDrop>
  }

  public static async loadAllSpawners(): Promise<void> {
    const spawnSetFilePaths = [
      `${RootDirectory}/data/pixelmon/spawning/standard`,
      `${RootDirectory}/data/pixelmon/spawning/legendaries`
    ]

    const spawnSetFiles = spawnSetFilePaths
      .map(spawnSetFilePath =>
        Utils.walk(spawnSetFilePath, {
          globs: ['**/*.json']
        })
      )
      .flat()

    PokemonManager.SpawnerConfig = (await import(
      `${RootDirectory}/data/pixelmon/spawning/BetterSpawnerConfig.json`
    )) as SpawnerConfig

    for await (const spawnSetFile of spawnSetFiles) {
      const spawnSet = (await import(`${spawnSetFile}`)) as SpawnSet

      if (spawnSet.spawnInfos === null) {
        console.log(
          chalk.red.bold.inverse(
            '[ERROR]',
            `Expected array of spawnInfo but found null sat ${spawnSet.id}`
          )
        )

        continue
      }

      ;(PokemonManager.Spawners as Map<string, Array<SpawnInfo>>).set(
        spawnSet.id,
        spawnSet.spawnInfos
      )
    }
  }
}
