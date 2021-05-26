// prettier-ignore
const AchromaticPalette = {
  RealBlack:      '#000',
  VampireBlack:   '#080808',
  SmokyBlack:     '#100C08',
  BlackChocolate: '#1B1811',
  EerieBlack:     '#1D1E23',
  RaisinBlack:    '#242124',
  DarkCharcoal:   '#333',
  Jet:            '#343434',
  GraniteGray:    '#676767',
  GraniteGrey:    '#676767',
  DimGray:        '#696969',
  DimGrey:        '#696969',
  Nickel:         '#727476',
  Iron:           '#A19D94',
  DarkGray:       '#A9A9A9',
  DarkGrey:       '#A9A9A9',
  QuickSilver:    '#A6A6A6',
  Gray:           '#BEBEBE',
  Grey:           '#BEBEBE',
  LightGray:      '#D3D3D3',
  LightGrey:      '#D3D3D3',
  Gainsboro:      '#DCDCDC',
  WhiteSmoke:     '#F5F5F5',
  BabyPowder:     '#FEFEFA',
  Snow:           '#FFFAFA'
} as const

// prettier-ignore
const Palette = {
  Black: '#1D1E23',
  Gray: '#A4AAA7',
  LightGray: '#6F6D6E',
  White: '#FFFFFF',
  SnowWhite: '#DAEAE6',

  /// 적색 계열
  Red:                '#B82647',  // 적색
  Crimson:            '#F15B5B',  // 홍색
  ReddishBrown:       '#9F494C',  // 적토색
  Brown:              '#966147',  // 갈색
  Amber:              '#BD7F41',  // 호박색
  Autumnal:           '#C38666',  // 추향색
  Scarlet:            '#C23352',  // 주홍색

  /// 청록색 계열
  Blue:               '#0B6DB7',  // 청색
  Sapphire:           '#00B5E3',  // 사파이어색
  LightBlue:          '#5AC6D0',  // 천청색
  LightBlueB:         '#00A6A9',  // 담청색
} as const

// prettier-ignore
const ExtraPalette = {
  Error:              '#F52831'
} as const

const HybridPalette = {
  ...Palette,
  ...AchromaticPalette,
  ...ExtraPalette
}

export default HybridPalette
