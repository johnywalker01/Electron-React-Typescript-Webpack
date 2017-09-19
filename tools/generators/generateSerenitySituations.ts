// Run using ts-node from root
import fs = require('fs')

import { writeFileWithHeaderSync } from './generateHeader'
// Assumes the Serenity repo 
// http://lvusclo01git.nam.gad.schneider-electric.com/VxArchitecture/serenity
// has the same root as this repo:
// <root>/raven/vxweb
// <root>/VxArchitecture/serenity

const inputFilename = (process.env.VXWEB_GENERATION || '../../VxArchitecture/serenity') + '/latex/tex/situations.tex'
if (!fs.existsSync(inputFilename)) {
  throw new Error(`Path ${inputFilename} does not exist, did you forget to set VXWEB_GENERATION environment variable?`)
}
const situationsFilename = 'src/serenity/situations.ts'
const situationMessagesFilename = 'src/serenity/messages.ts'

const inputFile = fs.readFileSync(inputFilename).toString('ascii')
const situationRegex = /^(\w*\/\w*) &/mg  // admin/clips_removed & 
let situations = inputFile.match(situationRegex).map(result => result.substr(0, result.length - 2))

function titleCaseSimple(str: string) {
  return str.substr(0, 1).toUpperCase() + str.substr(1, str.length - 1)
}

export function camelCaseFromUnderscore(str: string) {
  let pieces = str.split('_')
  let result = [pieces.shift()]
  result = result.concat(pieces.map(piece => titleCaseSimple(piece)))
  return result.join('')
}

function titleCaseSituation(situation: string) {
  let pieces = situation.split('/')
  return [pieces[0], camelCaseFromUnderscore(pieces[1])].join('_')
}

function defaultMessage(situation: string) {
  let pieces = situation.split('/')
  return pieces[1].split('_').map(piece => titleCaseSimple(piece)).join(' ')
}

let results = [`import messages from './messages'`]
results.push('')

results.push(`export type SituationType =`)
situations.forEach(situation => {
  results.push(` | '${situation}'`)
})
results.push('')

results.push(`export const SituationTypeMap = {`)
situations.forEach(situation => {
  results.push(`  '${situation}': messages.${titleCaseSituation(situation)},`)
})
results.push('}')

results.push('') // final blank line
writeFileWithHeaderSync(situationsFilename, results.join('\n'), inputFilename)

results = [`import { defineMessages } from 'react-intl'`]
results.push('')
results.push(`export default defineMessages({`)
situations.forEach(situation => {
  const situationTitle = titleCaseSituation(situation)
  results.push(`  ${situationTitle}: {
    id: 'vxweb.Situations.${situationTitle}',
    defaultMessage: '${defaultMessage(situation)}',
  },`)
})

results.push('})')
results.push('') // final blank line

writeFileWithHeaderSync(situationMessagesFilename, results.join('\n'), inputFilename)
