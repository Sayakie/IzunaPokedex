export interface Stats<T> {
  HP: T
  Attack: T
  Defence: T
  Speed: T
  SpecialAttack: T
  SpecialDefence: T
}

export interface BaseStats {
  pixelmonName: string
  pokemon: string
  form: number
  stats: Stats<number>
  catchRate: number
  malePercent: number
  spawnLevel: number
  spawnLevelRange: number
  baseExp: number
  baseFriendship: number
  types: Array<PokemonType>
  height: number
  hoverHeight?: number
  width: number
  length: number
  isRideable: boolean
  canFly: boolean
  canSurf: boolean
  preEvolutions?: Array<string>
  experienceGroup: ExperienceGroup
  aggression: { timid: number; passive: number; aggresive: number }
  spawnLocations: Array<SpawnLocation>
  evYields: Partial<Stats<number>>
  ridingOffsets: RidingOffset
  flyingParameters: FlyingParameter
  swimmingParameters: SwimmingParameter
  mountedFlying: MountedFlying
  weight: number
  evolutions?: Array<Evolution>
  abilities: [NullableString, NullableString, NullableString]
  eggGroups: Array<EggGroup>
  eggCycles: number
  levelUpMoves: Record<`${number}`, Array<string>>
  tmMoves: Array<string>
  tmMoves8: Array<number>
  trMoves: Array<number>
  tutorMoves: Array<string>
  eggMoves: Array<string>
  forms: Record<string, Omit<BaseStats, 'pokemon' | 'form'>>
}

type NullableString = string | null
type XYZ<T = number> = { x: T; y: T; z: T }

export type PokemonType =
  | Capitalize<
      | 'Normal'
      | 'Psychic'
      | 'Electric'
      | 'Ground'
      | 'Flying'
      | 'Water'
      | 'Grass'
      | 'Fire'
      | 'Ice'
      | 'Fighting'
      | 'Ghost'
      | 'Fairy'
      | 'Poison'
      | 'Rock'
      | 'Steel'
      | 'Bug'
      | 'Dragon'
      | 'Dark'
      | 'Shiny'
    >
  | 'ha'
export type Evolution = {
  level: number
  item: { itemID: string | `minecraft:${string}` | `pixelmon:${string}` }
  to: { name: string; form?: number }
  conditions: Array<Condition>
  evoType: EvolutionType
  moves: Array<string>
}
export type EvolutionType = 'leveling' | 'interact' | 'trade'
export type Condition = {
  item?: { itemID: string | `minecraft:${string}` | `pixelmon:${string}` }
  time?: 'NIGHT'
  friendship?: number
  critical?: number
  evoConditionType:
    | 'time'
    | 'partyAlolan'
    | 'friendship'
    | 'heldItem'
    | 'critical'
}
export type ExperienceGroup = Capitalize<
  'Slow' | 'MediumSlow' | 'MediumFast' | 'Fast'
>
export type SpawnLocation = Capitalize<
  'UnderGround' | 'Land' | 'Water' | 'Air' | 'AirPersistent'
>
export type EggGroup = Capitalize<
  | 'Undiscovered'
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
>
export type RidingOffset = {
  standing: XYZ
  moving: XYZ
}
export type FlyingParameter = {
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
export type SwimmingParameter = {
  depthRangeStart: number
  depthRangeEnd: number
  swimSpeed: number
  decayRate: number
  refreshRate: number
}
export type MountedFlying = {
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
