/* eslint-disable @typescript-eslint/no-misused-promises */
import { Events } from '@/constants'
import type { Client } from '@/structures/Client'
import type { Listener } from '@/utils'
import chalk from 'chalk'

const { NODE_ENV } = process.env
const { ERROR, DEBUG, WARN, INFO } = Events

export default (client: Client): ReturnType<Listener> => {
  function onInfo(message: string) {
    console.info(chalk.green.bold('[INFO]'), message)
  }

  function onWarn(message: string) {
    console.warn(chalk.yellowBright.bold('[WARN]'), message)
  }

  function onDebug(message: string) {
    if (NODE_ENV !== 'production') return

    console.debug(chalk.greenBright.bold('[DEBUG]'), message)
  }

  function onError(error: Error) {
    console.error(chalk.red.bold(`[ERROR] ${error.name}`), error.message)
  }

  client.incrementMaxListener(3)
  client.on(ERROR, onError)
  client.on(DEBUG, onDebug)
  client.on(WARN, onWarn)
  client.on(INFO, onInfo)

  return () => {
    client.off(ERROR, onError)
    client.off(DEBUG, onDebug)
    client.off(WARN, onWarn)
    client.off(INFO, onInfo)
    client.decrementMaxListener(3)
  }
}
