import { EnumSpecies } from '@/constants/enums/EnumSpecies'

export class EnumMegaPokemon {
  public static Pokemons: Set<EnumMegaPokemon> = new Set()

  public static Abomasnow = EnumMegaPokemon.of(EnumSpecies.Abomasnow, 1)
  public static Absol = EnumMegaPokemon.of(EnumSpecies.Absol, 1)
  public static Aerodactyl = EnumMegaPokemon.of(EnumSpecies.Aerodactyl, 1)
  public static Aggron = EnumMegaPokemon.of(EnumSpecies.Aggron, 1)
  public static Alakazam = EnumMegaPokemon.of(EnumSpecies.Alakazam, 1)
  public static Ampharos = EnumMegaPokemon.of(EnumSpecies.Ampharos, 1)
  public static Altaria = EnumMegaPokemon.of(EnumSpecies.Altaria, 1)
  public static Audino = EnumMegaPokemon.of(EnumSpecies.Audino, 1)
  public static Banette = EnumMegaPokemon.of(EnumSpecies.Banette, 1)
  public static Beedrill = EnumMegaPokemon.of(EnumSpecies.Beedrill, 1)
  public static Blastoise = EnumMegaPokemon.of(EnumSpecies.Blastoise, 1)
  public static Blaziken = EnumMegaPokemon.of(EnumSpecies.Blaziken, 1)
  public static Camerupt = EnumMegaPokemon.of(EnumSpecies.Camerupt, 1)
  public static Charizard = EnumMegaPokemon.of(EnumSpecies.Charizard, 2)
  public static Diancie = EnumMegaPokemon.of(EnumSpecies.Diancie, 1)
  public static Gallade = EnumMegaPokemon.of(EnumSpecies.Gallade, 1)
  public static Garchomp = EnumMegaPokemon.of(EnumSpecies.Garchomp, 1)
  public static Gardevoir = EnumMegaPokemon.of(EnumSpecies.Gardevoir, 1)
  public static Gengar = EnumMegaPokemon.of(EnumSpecies.Gengar, 1)
  public static Glalie = EnumMegaPokemon.of(EnumSpecies.Glalie, 1)
  public static Gyarados = EnumMegaPokemon.of(EnumSpecies.Gyarados, 1)
  public static Heracross = EnumMegaPokemon.of(EnumSpecies.Heracross, 1)
  public static Houndoom = EnumMegaPokemon.of(EnumSpecies.Houndoom, 1)
  public static Kangaskhan = EnumMegaPokemon.of(EnumSpecies.Kangaskhan, 1)
  public static Latias = EnumMegaPokemon.of(EnumSpecies.Latias, 1)
  public static Latios = EnumMegaPokemon.of(EnumSpecies.Latios, 1)
  public static Lopunny = EnumMegaPokemon.of(EnumSpecies.Lopunny, 1)
  public static Lucario = EnumMegaPokemon.of(EnumSpecies.Lucario, 1)
  public static Manectric = EnumMegaPokemon.of(EnumSpecies.Manectric, 1)
  public static Mawile = EnumMegaPokemon.of(EnumSpecies.Mawile, 1)
  public static Medicham = EnumMegaPokemon.of(EnumSpecies.Medicham, 1)
  public static Metagross = EnumMegaPokemon.of(EnumSpecies.Metagross, 1)
  public static Mewtwo = EnumMegaPokemon.of(EnumSpecies.Mewtwo, 2)
  public static Pidgeot = EnumMegaPokemon.of(EnumSpecies.Pidgeot, 1)
  public static Pinsir = EnumMegaPokemon.of(EnumSpecies.Pinsir, 1)
  public static Rayquaza = EnumMegaPokemon.of(EnumSpecies.Rayquaza, 1)
  public static Sableye = EnumMegaPokemon.of(EnumSpecies.Sableye, 1)
  public static Salamence = EnumMegaPokemon.of(EnumSpecies.Salamence, 1)
  public static Sceptile = EnumMegaPokemon.of(EnumSpecies.Sceptile, 1)
  public static Scizor = EnumMegaPokemon.of(EnumSpecies.Scizor, 1)
  public static Sharpedo = EnumMegaPokemon.of(EnumSpecies.Sharpedo, 1)
  public static Steelix = EnumMegaPokemon.of(EnumSpecies.Steelix, 1)
  public static Swampert = EnumMegaPokemon.of(EnumSpecies.Swampert, 1)
  public static Slowbro = EnumMegaPokemon.of(EnumSpecies.Slowbro, 1)
  public static Tyranitar = EnumMegaPokemon.of(EnumSpecies.Tyranitar, 1)
  public static Venusaur = EnumMegaPokemon.of(EnumSpecies.Venusaur, 1)

  private static of(species: EnumSpecies, megaForms: number) {
    return new EnumMegaPokemon(species, megaForms)
  }

  private constructor(
    readonly species: EnumSpecies,
    readonly megaForms: number
  ) {
    console.log(`    » registered ${this.toString()} as MegaPokemon`)

    EnumMegaPokemon.Pokemons.add(this)
  }

  public static getMega(species: EnumSpecies): EnumMegaPokemon | null {
    for (const megaPokemon of EnumMegaPokemon.Pokemons) {
      if (megaPokemon.species === species) return megaPokemon
    }

    return null
  }

  public toString(): `[EnumMegaPokemon: ${string}]` {
    return `[EnumMegaPokemon: ${this.species.name}]` as const
  }
}
