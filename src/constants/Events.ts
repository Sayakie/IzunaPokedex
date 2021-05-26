import { Constants } from 'discord.js'

const { Events } = Constants

const BlitzEvents = { ...Events, ...({ INFO: 'blitzInfo' } as const) } as const

export default BlitzEvents
