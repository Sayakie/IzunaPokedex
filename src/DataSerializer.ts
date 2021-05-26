type HeldItems = {
  itemID: `minecraft:${string}` | `pixelmon:${string}`
  percentChance: number
}

type PokemonSpec = {
  name: string
  form?: number
  growth?: number
}

type SpawnConditionTimes = Uppercase<'DAWN' | 'MORNING' | 'NIGHT'>

type SpawnCondition = {
  times: Array<SpawnConditionTimes>
  stringBiomes: Array<string> // TODO
}

type RaritySpawnCondition = {
  neededNearbyBlocks?: Array<string>
  weathers?: Array<'RAIN'>
}

type SpawnInfo = {
  spec: PokemonSpec
  stringLocationTypes: Array<'LAND' | 'Air'>
  minLevel: number
  maxLevel: number
  typeID: 'pokemon'
  heldItems: Array<HeldItems>
  condition: SpawnCondition
  rarityMultipliers: Array<RarityMultiplier>
  rarity: number
}

type RarityMultiplier = {
  multiplier: number
  condition: RaritySpawnCondition
}

type PokeSet = {
  id: string
  spawnInfos: Array<SpawnInfo>
}
