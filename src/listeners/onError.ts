/* eslint-disable @typescript-eslint/no-misused-promises */
import { Events } from '@/constants'
import type { Client } from '@/structures/Client'
import type { Listener } from '@/utils'
import chalk from 'chalk'

const { ERROR, DEBUG, WARN, INFO } = Events

export default (client: Client): ReturnType<Listener> => {
  function onInfo(message: string) {
    console.info(chalk.green.bold.inverse('[INFO]'), message)
  }

  function onWarn(message: string) {
    console.warn(chalk.yellowBright.bold.inverse('[WARN]'), message)
  }

  function onDebug(message: string) {
    // if (NODE_ENV !== 'production') return

    console.debug(chalk.greenBright.bold.inverse('[DEBUG]'), message)
  }

  function onError(error: Error) {
    console.error(
      chalk.red.bold.inverse('[ERROR]', chalk.redBright(error.name)),
      error.message,
      error.stack ? `\n` + error.stack : ''
    )
  }

  client.incrementMaxListener(4)
  client.on(ERROR, onError)
  client.on(DEBUG, onDebug)
  client.on(WARN, onWarn)
  client.on(INFO, onInfo)

  return () => {
    client.off(ERROR, onError)
    client.off(DEBUG, onDebug)
    client.off(WARN, onWarn)
    client.off(INFO, onInfo)
    client.decrementMaxListener(4)
  }
}
