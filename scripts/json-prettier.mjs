/**
 * Copyright (c) 2021 Sayakie
 *
 * This source code is licensed under the Apache License, Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import assert from 'assert'
import { readFile, writeFile } from 'fs/promises'
import { inspect } from 'util'

assert(
  process.argv.length >= 3,
  'Expected to receive a json file argument to parse'
)

const jsonFilePath = process.argv[2]
/** @type {Record<string, string>} */
let jsonData

try {
  let jsonFile = await readFile(jsonFilePath, { encoding: 'utf-8' })

  jsonData = JSON.parse(jsonFile)

  await writeFile(jsonFilePath, inspect(jsonData), { encoding: 'utf-8' })
} catch (error) {
  assert(
    false,
    `Expected to be able to parse ${jsonFilePath} as JSON ` +
      `but we got this error instead:\n${error}`
  )
}
