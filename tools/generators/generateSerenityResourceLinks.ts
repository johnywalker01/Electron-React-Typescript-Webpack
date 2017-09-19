// tslint:disable:no-console
import { camelCaseFromUnderscore } from './generateSerenitySituations'
import { splitResourceLine } from './generateSerenityResources'

const linkRegex = /'(.*)': LinkSchema\((.*)\)/mg
export class GenerateResourceLinks {
  items: Array<GenerateResourceLink>
  constructor(name, text) {
    this.items = new Array()
    let linkLine = linkRegex.exec(text)
    while (linkLine) {
      const linkData = splitResourceLine(linkLine)
      this.items.push(new GenerateResourceLink(name, linkData))
      linkLine = linkRegex.exec(text)
    }
  }

  toString() {
    return `
  _links: {
${this.items
  .map(link => `    ${link.name}${link.optional ? '?' : ''}: string`)
  .join('\n')}
  }
  _embedded: {
${this.items
  .filter(link => link.linkResultType && link.name.startsWith('\''))
  .map(link => `    ${link.name}${link.optional ? '?' : ''}: ${link.linkResultType}`)
  .join('\n')}
  }
${this.items
  .map(link => link.linkMethod)
  .join('\n')}
`.replace(/(.*{\n\n  })/mg, '')
  }

  toDeleteChecksString() {
    return this.items
      .filter(link => link.linkCheck)
      .map(link => link.linkCheck)
      .join('')
  }
}

const replacements = {
  'MixedJpeg': 'ArrayBuffer',
  'Jpeg': 'ArrayBuffer',
  'Png': 'ArrayBuffer',
  'Binary': 'ArrayBuffer',
  'Mp4': 'ArrayBuffer',
  'SerenityCode': 'string',
  'OccCdo': 'string',
  'Zip': 'string',
  'CsvZip': 'string',
  'CapabilityRequest': 'string',
}

export class GenerateResourceLink {
  name: string
  optional: boolean
  method: string
  linkResultType: string
  linkGetHelper: string
  linkDeleteHelper: string
  linkMethod: string
  linkCheck: string

  constructor(className: string, parts: Array<string>) {
    let optionalFlag: string
    let type1: string
    let type2: string
    let resultType: string
    let postType: string
    [ this.name, type1, optionalFlag, this.method, type2 ] = parts
    if (this.method === 'POST') {
      postType = type1
      resultType = type2
    } else {
      resultType = type1
    }
    this.optional = optionalFlag === 'N'

    let simpleName = this.name
    let methodName = this.name

    if (methodName.startsWith('/')) {
      methodName = simpleName.split('/')[3]
      this.name = `'${this.name}'`
    }

    if (this.method === 'GET' &&
      resultType !== 'None' &&
      resultType !== 'Resource') {
      this.linkResultType = resultType
      methodName = camelCaseFromUnderscore('get_' + methodName)
      if (replacements[this.linkResultType]) {
        this.linkResultType = replacements[this.linkResultType]
        if (this.linkResultType === 'ArrayBuffer') {
          this.linkMethod = this.outputLinkGetArrayBufferHelper(methodName)
        }
      } else {
        this.linkMethod = this.outputLinkGetHelper(methodName)
      }
    } else if (this.method === 'DELETE') {
      if (methodName.split('_').length > 1) {
        methodName = camelCaseFromUnderscore(methodName)
      }
      this.linkMethod = this.outputLinkDeleteHelper(methodName)
    } else if (this.method === 'POST' &&
      postType !== 'FlexeraLicense' &&
      postType !== 'Mixed' &&
      postType !== 'FormData') {
      methodName = camelCaseFromUnderscore('post_' + methodName)
      this.linkMethod = this.outputLinkPostHelper(methodName, postType, resultType || 'any')
    } else if (this.method === 'PATCH') {
      this.linkResultType = resultType
      this.linkMethod = this.outputLinkPatchHelper(className)
    }

    if (replacements[this.linkResultType]) {
      this.linkResultType = replacements[this.linkResultType]
    }
    if (this.linkMethod && this.optional) {
      // tslint:disable-next-line:max-line-length
      this.linkCheck = `    if (!this._links || this._links['${simpleName}'] === undefined) { this.${methodName} = undefined }\n`
    }
  }

  outputLink(): string {
    return `    ${this.name}${this.optional ? '?' : ''}: string\n`
  }

  outputLinkGetHelper(methodName: string): string {
    const linkName = this.name.startsWith('\'') ? `[${this.name}]` : `.${this.name}`
    return `  ${methodName}(params?) {
    return this._serenity
      .getSimple(this._links${linkName}, { params: params }, ${this.linkResultType}.create)
  }`
  }

  outputLinkGetArrayBufferHelper(methodName: string): string {
    return `  ${methodName}(params?, live: boolean = false) {
    let url = this._links[${this.name}]
    let getParams = { responseType: 'arraybuffer', headers: { Accept: 'image/jpeg' } }
    if (params) {
      getParams = lodash.assign(getParams, params)
    }
    if (live) {
      const now = new Date()
      url += \`?now=\${now.getTime()}\`
    }
    return this._serenity.getSimple<ArrayBuffer>(url, getParams)
  }`
  }

  outputLinkPostNoneHelper(methodName: string): string {
    return `  ${methodName}(data: Object) {
    return this._serenity.postSimple<Object, void>(this._links[${this.name}], {})
  }`
  }

  outputLinkPostHelper(methodName: string, postType: string, resultType: string): string {
    if (postType === 'None') {
      return
    }
    const optionalCreateFunctionParameter = resultType === 'any' ? '' : `, ${resultType}.create`
    return `  ${methodName}(data: ${postType}Data, config?: PostRequestConfig) {
    let postData = ${postType}.create(data, this._serenity)
    postData._type = '${postType.replace('_', '.')}'
    return this._serenity.postSimple<${postType}, ${resultType}>(
      this._links[${this.name}], postData, config${optionalCreateFunctionParameter}
    )
  }`
  }

  outputLinkDeleteHelper(methodName: string): string {
    return `  ${methodName}() {
    return this._serenity.deleteSimple(this._links[${this.name}])
  }`
  }

  outputLinkPatchHelper(className): string {
    return `  edit(data: ${className}EditData) {
    return this._serenity.patchSimple<${className}, ${className}EditData>(this, data)
  }`
  }
}
