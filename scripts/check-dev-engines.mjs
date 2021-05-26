/**
 * Copyright (c) 2021 Sayakie
 *
 * This source code is licensed under the Apache License, Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/*
  eslint-disable
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/restrict-template-expressions
*/

// Make sure we have a package.json to parse. Take it as the first argument
// (actually the 3rd for argv).

import assert from 'assert'
import fs from 'fs/promises'
import semver from 'semver'
import { $ } from 'zx'

assert(
  process.argv.length >= 3,
  'Expected to recieve a package.json file argument to parse'
)

$.verbose = false
const packageFilePath = process.argv[2]
let packageData

try {
  let packageFile = await fs.readFile(packageFilePath, { encoding: 'utf-8' })

  packageData = JSON.parse(packageFile)
} catch (error) {
  assert(
    false,
    `Expected to be able to parse ${packageFilePath} as JSON ` +
      `but we got this error instead: ${error}`
  )
}

const devEngines = packageData.devEngines

if (devEngines.node !== undefined) {
  // First check that devEngines are valid semver
  assert(
    semver.validRange(devEngines.node),
    `devEngines.node (${devEngines.node}) is not a valid semver range`
  )

  // Then actually check that out version satisfies
  let nodeVersion = process.version
  nodeVersion = nodeVersion.node ?? nodeVersion
  assert(
    semver.satisfies(nodeVersion, devEngines.node),
    'Current node version is not supported for development, ' +
      `expected "${nodeVersion}" to satisfy "${devEngines.node}".`
  )
}

if (devEngines.pnpm !== undefined) {
  // First check that devEngines are valid semver
  assert(
    semver.validRange(devEngines.pnpm),
    `devEngines.pnpm (${devEngines.pnpm}) is not a valid semver range`
  )

  const { stderr, stdout, exitCode } = await $`pnpm --version`
  assert(exitCode === 0, `Failed to get pnpm version... ${stderr}`)

  let pnpmVersion = stdout.trim()
  assert(
    semver.satisfies(pnpmVersion, devEngines.pnpm),
    'Current pnpm version is not supported for development, ' +
      `expected "${pnpmVersion}" to satisfy "${devEngines.pnpm}".`
  )
}
