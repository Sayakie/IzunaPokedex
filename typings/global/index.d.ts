declare module '@riots/global' {
  type XYZ<T = number> = {
    X: T
    Y: T
    Z: T
  }

  global {
    declare type Nullable<T> = T | null | undefined
    declare interface BaseStats {
      pixelmonName: string
      pokemon?: string
      form?: number
      stats: { [T in Stats]: number }
      catchRate: number
      malePercent: number | -1
      spawnLevel: number
      spawnLevelRange: number
      baseExp: number
      baseFriendship: number
      types: readonly Array<PokemonType>
      height: number
      width: number
      length: number
      isRideable: boolean
      canFly: boolean
      canSurf: boolean
      preEvolutions: readonly Array<string>
      experienceGroup?: readonly Array<ExperienceGroup>
      aggresion?: {
        timid: number
        passive: number
        aggressive: number
      }
      spawnLocations: readonly Array<SpawnLocation>
      evYields: { [T in Stats]+?: number }
      hoverHeight?: number
      ridingOffsets: RidingOffset
      flyingParameters: FlyingParameters
      weight: number
      evolutions: readonly Array<Evolution>
      abilities: Array<Nullable<string>>
      eggGroups: readonly Array<EggGroup>
      eggCycles: number
      levelUpMoves: Record<string, Array<string>>
      tmMoves: Array<string>
      tmMoves8: Array<number>
      trMoves: Array<number>
      tutorMoves: Array<string>
      eggMoves: Array<string>
      forms: Record<string, BaseStats>
    }

    declare type PokemonType =
      | 'ha'
      | Capitalize<
          | 'Normal'
          | 'Fire'
          | 'Water'
          | 'Electric'
          | 'Grass'
          | 'Ice'
          | 'Fighting'
          | 'Poison'
          | 'Ground'
          | 'Flying'
          | 'Psychic'
          | 'Bug'
          | 'Rock'
          | 'Ghost'
          | 'Dragon'
          | 'Dark'
          | 'Steel'
          | 'Fairy'
          | 'Shiny'
        >

    declare type Stats =
      | 'HP'
      | 'Attack'
      | 'Defence'
      | 'Speed'
      | 'SpecialAttack'
      | 'SpecialDefence'

    declare type SpawnLocation =
      | 'UnderGround'
      | 'Land'
      | 'Water'
      | 'Air'
      | 'AirPersistent'

    declare interface Evolution {
      level?: number
      to: {
        name: string
      }
      condition: readonly Array<EvolutionCondition>
      evoType: EvolutionType
      moves?: readonly Array<string>
    }

    declare type EvolutionType = 'leveling' | 'trade' | 'interact'

    declare type EvolutionCondition = {
      item: {
        itemID: `pixelmon:${string}` | string
      }
      evoConditionType: 'heldItem'
    } & {
      friendship: number
      evoConditionType: 'friendship'
    } & {
      attackIndex: number
      evoConditionType: 'move'
    }

    declare type EvolutionConditionType = 'heldItem' | 'friendship'

    declare type EggGroup = Capitalize<
      | 'Mineral'
      | 'Monster'
      | 'Field'
      | 'Dragon'
      | 'Ditto'
      | `Water${1 | 2 | 3}`
      | 'Bug'
      | 'Amorphous'
      | 'Flying'
      | 'Grass'
      | 'Fairy'
      | 'Humanlike'
      | 'Undiscovered'
    >
    declare type ExperienceGroup = 'Slow' | 'MediumSlow' | 'MediumFast' | 'Fast'

    declare interface RidingOffset {
      standing: XYZ
      moving: XYZ
    }

    declare interface FlyingParameters {
      flyHeightMin: number
      flyHeightMax: number
      flySpeedModifier: number
      flyRefreshRateY: number
      flyRefreshRateXZ: number
      flyRefreshRateSpeed: number
      flightTimeMin: number
      flightTimeMax: number
      flapRate: number
      landingMaterials: 'LEAVES_AND_GRASS'
    }

    declare interface SwimmingParameter {
      depthRangeStart: number
      depthRangeEnd: number
      swimSpeed: number
      decayRate: number
      refreshRate: number
    }

    declare interface MountedFlying {
      upperAngleLimit: number
      lowerAngleLimit: number
      maxFlySpeed: number
      decelerationRate: number
      hoverDecelerationRate: number
      accelerationRate: number
      strafeAccelerationRate: number
      strafeRollConversion: number
      turnRate: number
      pitchRate: number
      stayshorizontalflying: boolean
    }
  }
}
