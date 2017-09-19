// Run using ts-node from root
// tslint:disable:no-console
import fs = require('fs')
import path = require('path')

import { GenerateResourceLinks } from './generateSerenityResourceLinks'
import { GenerateResourceFields } from './generateSerenityResourceFields'

// Assumes the Serenity repo 
// http://lvusclo01git.nam.gad.schneider-electric.com/VxArchitecture/serenity
// has the same root as this repo:
// <root>/raven/vxweb
// <root>/VxArchitecture/serenity

const inputFilePath = (process.env.VXWEB_GENERATION || '../../VxArchitecture/serenity') + '/pyserenity/resources'
if (!fs.existsSync(inputFilePath)) {
  throw new Error(`Path ${inputFilePath} does not exist, did you forget to set VXWEB_GENERATION environment variable?`)
}

const outputFilename = 'src/serenity/resources.ts'

let resources = new Array<GeneratedResource>()
let primitives = []

export function splitResourceLine(line: Array<string>) {
  const data = line[2]
    .split(',')
    .map(piece => piece.trim())
    .map(piece => piece[0] === '\'' ? piece.substr(1, piece.length - 2) : piece)
  if (line[1] !== data[0]) {
    console.log(`!!!!!!!!!${line[1]} doesn't match ${data[0]}`)
  }
  return data
}

let classRegex = /class (\w*)\((\w*)\):/

class GeneratedResourceInput {
  name: string
  valid: boolean
  text: string
}

class GeneratedResource {
  name: string
  fields: GenerateResourceFields
  links: GenerateResourceLinks
}

resources = fs.readdirSync(inputFilePath)
.filter(fname => fname.endsWith('.py') && !fname.startsWith('__'))
.sort()
.map((fileName) => {
  let pyFile = fs.readFileSync(path.join(inputFilePath, fileName), 'utf-8')
  let classPieces = classRegex.exec(pyFile)
  let name = classPieces[1]
  let valid = classPieces[2] === 'Resource'
  return {
    name: name,
    valid: valid,
    text: pyFile,
  }
})
.filter(resourceInput => resourceInput.valid)
.map((resourceInput) => {
  const { name, text } = resourceInput
  const resource = {
    name: name,
    links: new GenerateResourceLinks(name, text),
    fields: new GenerateResourceFields(name, text, primitives),
  }
  resource.fields.primitives.forEach(primitive => {
    if (primitive && primitives.indexOf(primitive) < 0) {
      primitives.push(primitive)
    }
  })
  return resource
})

const skipPrimitiveImports = {SerenityCode: true, SituationType: true}

let primitiveImports = primitives
  .filter(p => !skipPrimitiveImports[p])
  .sort()
  .map(primitive => `import { ${primitive} } from './primitives'`)
  .join('\n')

let resourceClasses = resources
.map(resource => {
  const name = resource.name.replace(/\./g, '_')
  return `
${resource.fields.toNewInterfaceString(name)}
${resource.fields.toEditInterfaceString(name)}
//
export class ${name} extends ${resource.fields.className(name)} {
  static create(data, serenity: Serenity): ${name} {
    return lodash.assign(new ${name}(), data).build(serenity)
  }
${resource.fields.toString()}
${resource.links.toString()}
${resource.fields.toMethodsString(name, resource.links.toDeleteChecksString())}
}
`
}).join('')

let outputText = `
// tslint:disable:class-name
// tslint:disable:variable-name
// tslint:disable:no-string-literal
// tslint:disable:max-line-length
//
import * as lodash from 'lodash'
import { forEachX, getAllX } from './paging'
${primitiveImports}
//
import { SituationType } from './situations'
//
import Serenity, { PostRequestConfig, CreateMethod } from './index'
//
export abstract class SerenityObjectBase {
  _serenity?: Serenity
  _type: string
  build(serenity: Serenity) {
    this._serenity = serenity
    return this
  }
}
//
export abstract class SerenityCollectionBase<T extends SerenityObjectBase> extends SerenityObjectBase {
  collection_header?: CollectionHeader
  getNext: (params?) => Promise<T>
  getPrev: (params?) => Promise<T>
  addCollectionLinks(create: CreateMethod<T>) {
    const _links = this.collection_header._links
    if (_links && _links.next) {
      this.getNext = (params?) => this._serenity.getSimple(_links.next, { params: params }, create)
    }
    if (_links && _links.prev) {
      this.getPrev = (params?) => this._serenity.getSimple(_links.prev, { params: params }, create)
    }
  }
}
${resourceClasses}
`

outputText = outputText.replace(/\s*(\r\n|\r|\n)+/mg, '\n')
outputText = outputText.replace(/\/\/\n/mg, '\n')
import { writeFileWithHeaderSync } from './generateHeader'
writeFileWithHeaderSync(outputFilename, outputText, inputFilePath)
