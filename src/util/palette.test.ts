import {expect} from 'chai'

import palette from './palette'

describe('palette', () => {
  it('allows indexing fields', () => {
    expect(palette.d0).to.equal('#000')
    // tslint:disable-next-line:no-string-literal
    expect(palette['d0']).to.equal('#000')
  })

  it('lightens greyscale', () => {
    expect(palette.greyStep('d0', 1)).to.equal('d1')
  })

  it('darkens greyscale', () => {
    expect(palette.greyStep('a', -1)).to.equal('b5')
  })

  it('throws an error when lightening white', () => {
    expect(() => palette.greyStep('a', 1)).to.throw('brighter than white')
  })

  it('throws an error when darkening black', () => {
    expect(() => palette.greyStep('d0', -1)).to.throw('darker than black')
  })
})
