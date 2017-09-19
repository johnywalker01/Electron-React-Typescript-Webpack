// Run using ts-node from project root
// tslint:disable:no-console
import fs = require('fs')

import { writeFileWithHeaderSync } from './generateHeader'
// Assumes the Serenity repo 
// http://lvusclo01git.nam.gad.schneider-electric.com/VxArchitecture/serenity
// has the same root as this repo:
// <root>/raven/vxweb
// <root>/VxArchitecture/serenity

const inputFilename = (process.env.VXWEB_GENERATION || '../../VxArchitecture/serenity')
  + '/pyserenity/util/primitive.py'
const outputFilename = 'src/serenity/primitives.ts'

let inputFile = fs.readFileSync(inputFilename).toString('utf-8')
inputFile = inputFile.split(/\r\n|\r|\n/g).filter(line => !line.trim().startsWith('#')).join('\n')

const primValRegex = /if name == Primitive\.(\w*):([\w\W\s\r\n]*?)        el/g
let results = []

let primValRegexResult = primValRegex.exec(inputFile)
while (primValRegexResult != null) {
  let primitive = buildPrimitive(primValRegexResult[1], primValRegexResult[2])
  if (primitive.name !== 'SituationType') {
    if (primitive.values.length > 0) {
      results.push(`export type ${primitive.name} =`)
      primitive.values.forEach(value => {
        results.push(` | '${value}'`)
      })
    } else {
      results.push(`export type ${primitive.name} = string`)
    }
  }
  primValRegexResult = primValRegex.exec(inputFile)
}

// Finds just the primitives by name
const primRegex = /^    (\w*) = '(\w*)'/mg
let primRegexResult = primRegex.exec(inputFile)
while (primRegexResult != null) {
  primRegexResult = primRegex.exec(inputFile)
}

results.push('') // final blank line

writeFileWithHeaderSync(outputFilename, results.join('\n'), inputFilename)

function buildPrimitive(name, text) {
  let values = new Array<string>()
  let valueMatch = text.match(/return data in \[([\w\W\s\r\n]*)\]/m)
  if (valueMatch) {
    const primValueRegex = /'([^\s]*)'/mg
    let primValueResult = primValueRegex.exec(valueMatch[1])
    while (primValueResult != null) {
      values.push(primValueResult[1])
      primValueResult = primValueRegex.exec(valueMatch[1])
    }
  }
  return {
    name: name,
    values: values,
  }
}
