import type { Client } from '@/structures/Client'
import { Collection } from 'discord.js'

export class ConfigManager {
  public readonly cache = new Collection()

  constructor(public readonly client: Client) {}
}
