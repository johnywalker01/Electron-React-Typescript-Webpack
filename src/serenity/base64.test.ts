import {expect} from 'chai'

import * as base64 from './base64'

describe('base64', () => {
  it('encodes the string "admin"', () => {
    const decoded = 'admin'
    const encoded = base64.encode(decoded)
    expect(encoded).to.equal('YWRtaW4=')
  })

  it('decodes the string "YWRtaW4="', () => {
    const encoded = 'YWRtaW4='
    const decoded = base64.decode(encoded)
    expect(decoded).to.equal('admin')
  })
})
