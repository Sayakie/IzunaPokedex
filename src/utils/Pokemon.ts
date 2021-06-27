type resolvableForm =
| 'MEGA'
| `MEGA-${'X' | 'Y'}`
| 'GMAX'
| 'ALOLA'
| 'GALAR'
| 'ASH'
| 'NECROZMA_DAWN'
| 'NECROZMA_DUSK'
| 'NECROZMA_ULTRA'

class PokemonUtil {
  public static translateFormName(resolvableFormName: resolvableForm): string {
    switch (resolvableFormName) {
      case 'MEGA':
        return '메가'
      case 'MEGA-X':
        return '메가 X'
      case 'MEGA-Y':
        return '메가 Y'
      case 'GMAX':
        return '거다이맥스'
      case 'ALOLA':
        return '알로라'
      case 'GALAR':
        return '가라르'
      case 'ASH':
        return '지우'
      case 'NECROZMA_DAWN':
        return '황혼의 갈기'
      case 'NECROZMA_DUSK':
        return '새벽의 날개'
      case 'NECROZMA_ULTRA':
        return '울트라'
      default:
        return ''
    }
  }
}

export default PokemonUtil
