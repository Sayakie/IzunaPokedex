import { EnumSpecies } from './EnumSpecies'

// const forms = [
//   'Normal',
//   'Mega',
//   'MegaX',
//   'MegaY',
//   'Alolan',
//   'Galarian',
//   { Gender: ['Male', 'Female'] }
// ] as const

// const primitiveForms = forms
//   .filter(
//     <T>(form: T): form is T extends string ? T : never =>
//       typeof form === 'string'
//   )
//   .reduce(
//     <T, U>(forms: T, form: U) => ({
//       ...forms,
//       ...{ [form as U extends string ? U : never]: form }
//     }),
//     {}
//   )

// const genderForms = forms
//   .filter(form => typeof form === 'object')
//   .map(<T extends { [K in keyof T]: T[K] }>(form: T) => '')

type SpeciesForm = {
  species: EnumSpecies
  form: typeof EnumForm.Forms
}

export class EnumForm {
  public static formList: Map<EnumSpecies, string> = new Map<
    EnumSpecies,
    string
  >()

  public static Forms = {
    Normal: 'Normal',
    Mega: 'Mega',
    MegaX: 'MegaX',
    MegaY: 'MegaY',
    Alolan: 'Alolan',
    Galarian: 'Galarian',
    Gender: {
      Male: 'Male',
      Female: 'Female'
    }
  } as const

  public static GenderPokemons = [
    EnumSpecies.Meowstic,
    // EnumSpecies.Meowstic,
    EnumSpecies.Meowstic,
    EnumSpecies.Pyroar,
    EnumSpecies.Frillish,
    EnumSpecies.Jellicent,
    EnumSpecies.Unfezant,
    EnumSpecies.Indeedee
  ]

  public static MegaPokemons = [
    EnumSpecies.Venusaur,
    EnumSpecies.Blastoise,
    EnumSpecies.Alakazam,
    EnumSpecies.Gengar,
    EnumSpecies.Kangaskhan,
    EnumSpecies.Pinsir,
    EnumSpecies.Gyarados,
    EnumSpecies.Aerodactyl,
    EnumSpecies.Ampharos,
    EnumSpecies.Scizor,
    EnumSpecies.Heracross,
    EnumSpecies.Houndoom,
    EnumSpecies.Tyranitar,
    EnumSpecies.Blaziken,
    EnumSpecies.Gardevoir,
    EnumSpecies.Mawile,
    EnumSpecies.Aggron,
    EnumSpecies.Medicham,
    EnumSpecies.Manectric,
    EnumSpecies.Banette,
    EnumSpecies.Absol,
    EnumSpecies.Garchomp,
    EnumSpecies.Lucario,
    EnumSpecies.Abomasnow,
    EnumSpecies.Beedrill,
    EnumSpecies.Pidgeot,
    EnumSpecies.Steelix,
    EnumSpecies.Sceptile,
    EnumSpecies.Swampert,
    EnumSpecies.Sableye,
    EnumSpecies.Sharpedo,
    EnumSpecies.Camerupt,
    EnumSpecies.Altaria,
    EnumSpecies.Glalie,
    EnumSpecies.Salamence,
    EnumSpecies.Metagross,
    EnumSpecies.Latias,
    EnumSpecies.Latios,
    EnumSpecies.Rayquaza,
    EnumSpecies.Lopunny,
    EnumSpecies.Gallade,
    EnumSpecies.Audino,
    EnumSpecies.Diancie
  ]

  public static MegaXYPokemons = [
    EnumSpecies.Charizard,
    EnumSpecies.Mewtwo
  ]

  public static AlolanPokemons = [
    EnumSpecies.Diglett,
    EnumSpecies.Dugtrio,
    EnumSpecies.Exeggutor,
    EnumSpecies.Sandshrew,
    EnumSpecies.Sandslash,
    EnumSpecies.Meowth,
    EnumSpecies.Persian,
    EnumSpecies.Grimer,
    EnumSpecies.Muk,
    EnumSpecies.Marowak,
    EnumSpecies.Vulpix,
    EnumSpecies.Ninetales,
    EnumSpecies.Geodude,
    EnumSpecies.Graveler,
    EnumSpecies.Golem,
    EnumSpecies.Rattata,
    EnumSpecies.Raticate,
    EnumSpecies.Raichu
  ]

  public static GalarianPokemons = [
    EnumSpecies.Meowth,
    EnumSpecies.MrMime,
    EnumSpecies.Slowpoke,
    EnumSpecies.Slowbro,
    EnumSpecies.Farfetchd,
    EnumSpecies.Darumaka,
    EnumSpecies.Ponyta,
    EnumSpecies.Rapidash,
    EnumSpecies.Zigzagoon,
    EnumSpecies.Linoone,
    EnumSpecies.Corsola,
    EnumSpecies.Yamask,
    EnumSpecies.Stunfisk,
    EnumSpecies.Weezing,
    EnumSpecies.Articuno,
    EnumSpecies.Zapdos
  ]
}

EnumForm.Forms
