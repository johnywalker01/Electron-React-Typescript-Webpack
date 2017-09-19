// tslint:disable:no-console
import { splitResourceLine } from './generateSerenityResources'

const fieldRegex = /'(\w*)': FieldSchema\((.*)\)/mg
export class GenerateResourceFields {
  collectionField: GenerateResourceField = null
  items: Array<GenerateResourceField>
  constructor(name, text, primitives) {
    this.items = new Array()
    let fieldLine = fieldRegex.exec(text)
    while (fieldLine) {
      let fieldData = splitResourceLine(fieldLine)
      this.items.push(new GenerateResourceField(fieldData))
      fieldLine = fieldRegex.exec(text)
    }

    if (this.items.some(field => field.fieldType === 'CollectionHeader')) {
      this.collectionField = this.items.find(field => field.typeArray)
    }
  }

  className(name) {
    if (this.collectionField) {
      return `SerenityCollectionBase<${name}>`
    }
    return 'SerenityObjectBase'
  }

  toString() {
    return `
${this.items
  .map(field => field.interface())
  .join('\n')}
  _limits: {
${this.items
  .filter(field => field.limits !== undefined)
  .map(field => field.outputLimits())
  .join('\n')}
  }
`.replace(/(.*{\n\n  })/mg, '')
  }

  toEditInterfaceString(name: string) {
    const items = this.items
      .filter(field => field.writable)
    if (items.length <= 0) { return '' }

    return `//
export interface ${name}EditData {
${items.map(field => field.interface('EditData')).join('\n')}
}
`
  }

  toNewInterfaceString(name: string) {
    const items = this.items
      .filter(field => field.readable)
    // If there are no fields, this is a special Serenity post object that does nothing
    if (items.length <= 0 && this.items.length > 0) { return '' }

    return `//
export interface ${name}Data {
${items.map(field => field.interface('Data')).join('\n')}
}
`
  }

  toMethodsString(name, deleteFields = '') {
    if (!this.primitives) { return '' }

    // tslint:disable:max-line-length
    const pagingMethodsCode = !this.collectionField
      ? ''
      : `
  forEach${this.collectionField.resource}(callbackfn: (x: ${this.collectionField.resource}) => void): Promise<void> {
    return forEachX<${name}, ${this.collectionField.resource}>('${this.collectionField.name}', this, callbackfn)
  }
  getAll${name}(): Promise<Array<${this.collectionField.resource}>> {
    return getAllX<${name}, ${this.collectionField.resource}>('${this.collectionField.name}', this)
  }`
    // tslint:enable:max-line-length

    const buildMethodCode = `
  build(serenity: Serenity) {
    this._serenity = serenity
    this._type = '${name.replace('_', '.')}'
${this.items
  .filter(field => field.resource !== undefined)
  .map(field => field.outputBuildMethod(name))
  .join('\n')}
${deleteFields}
    return this
  }`
    return pagingMethodsCode + buildMethodCode
  }

  get primitives() {
    return this.items.filter(field => field.primitive !== undefined).map(field => field.primitive)
  }
}

export class GenerateResourceField {
  name: string
  optional: boolean
  readable: boolean
  writable: boolean
  fieldType: string
  primitive: string
  limits: string
  typeArray: boolean
  needsCast: string
  resource: string

  constructor(fieldData: Array<string>) {
    const replacements = {
      'String': 'string',
      'Integer': 'number',
      'Boolean': 'boolean',
      'Float': 'number',
      'DateTime': 'Date',
      'List': 'Array<any>',
      'Map': '{}',
      'Resource': 'any',
      'SerenityCode': 'string',
      'KJObject': 'any',
      '\\mimenameresource{}': 'any',
    }
    let parts = fieldData
    this.name = parts[0]
    this.optional = parts[2] === 'N'
    this.readable = parts[3].includes('R')
    this.writable = parts[3].includes('W')

    let fieldType = 'any'
    let typeString = parts[1].replace(/\./g, '_')
    this.typeArray = false
    this.needsCast = undefined
    this.primitive = undefined
    this.resource = undefined
    if (typeString === 'Primitive_List') {
      this.typeArray = true
      typeString = parts.length === 5
        ? parts[4].replace(/\./g, '_')
        : 'any'
    }
    if (typeString.startsWith('Primitive_')) {
      typeString = typeString.split('_')[1]
      if (replacements[typeString]) {
        fieldType = replacements[typeString]
        if (typeString === 'Integer' && !this.typeArray) {
          this.limits = typeString
        } else if (typeString === 'DateTime') {
          this.needsCast = 'Date'
          this.resource = 'Date'
        }
      } else {
        fieldType = typeString
        this.primitive = typeString
      }
    } else {
      if (replacements[typeString]) {
        fieldType = replacements[typeString]
      } else {
        fieldType = typeString
        this.resource = fieldType
      }
    }

    if (this.typeArray) {
      fieldType = `Array<${fieldType}>`
    }

    this.fieldType = fieldType
  }

  outputLimits(): string {
    return `    ${this.name}${this.optional ? '?' : ''}: Limit_${this.limits}`
  }

  outputBuildMethod(className): string {
    if (this.typeArray) {
      return this.resource === 'any' ? '' : `
    if (this.${this.name}) {
      this.${this.name} = this.${this.name}.map(item => ${this.resource}.create(item, serenity))
    }`
    } else if (this.needsCast) {
      return `
    if (this.${this.name}) {
      this.${this.name} = new ${this.needsCast}(this.${this.name})
    }`
    } else {
      return `
    if (this.${this.name}) {
      this.${this.name} = ${this.resource}.create(this.${this.name}, serenity)
      ${this.resource === 'CollectionHeader' ? `this.addCollectionLinks(${className}.create)` : ''}
    }`
    }

  }

  interface(typeSuffix: string = ''): string {
    const trueFieldType = this.getTrueFieldType(typeSuffix)

    return `  ${this.name}${this.optional ? '?' : ''}: ${trueFieldType}`
  }

  private getTrueFieldType(typeSuffix) {
    if (this.primitive) {
      return this.fieldType
    }
    // TODO(rminster): Fix this workaround for missing Rule_TriggerEditData class
    if (this.fieldType === 'Array<Rule_Trigger>') {
      return 'Array<Rule_TriggerData>'
    }

    const jsPrimitives = ['any', 'string', 'number', 'boolean', '{}', 'Date']

    const singularFieldType = this.typeArray
      ? this.fieldType.substring('Array<'.length, this.fieldType.length - 1)
      : this.fieldType

    return jsPrimitives.some(p => p === singularFieldType)
      ? this.fieldType
      : this.typeArray
        ? 'Array<' + singularFieldType + typeSuffix + '>'
        : this.fieldType + typeSuffix
  }
}
