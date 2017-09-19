import { expect } from 'chai'
import * as mocha from 'mocha' // tslint:disable-line:no-unused-variable

import FieldSorter from './FieldSorter'

describe('FieldSorter', () => {
  it('compares correctly', () => {
    const fieldSorter = new FieldSorter()

    // Nothing special
    expect(fieldSorter.compare('apples', 'apples')).to.equal(0)
    expect(fieldSorter.compare('id', 'id')).to.equal(0)
    expect(fieldSorter.compare('apples', 'bananas')).to.be.lessThan(0)
    expect(fieldSorter.compare('bananas', 'apples')).to.be.greaterThan(0)

    // Special cases
    expect(fieldSorter.compare('id', 'apples')).to.be.lessThan(0)
    expect(fieldSorter.compare('apples', '_links')).to.be.lessThan(0)

    expect(fieldSorter.compare('apples', 'name')).to.be.greaterThan(0)
    expect(fieldSorter.compare('_embedded', 'apples')).to.be.greaterThan(0)
  })

  it('sorts id and name before others', () => {
    const unsorted = {
      bananas: 'Bananas',
      name: 'Name',
      apples: 'Apples',
      id: 'Id',
    }

    const sorted = new FieldSorter().sort(unsorted)
    const sortedKeys = Object.keys(sorted)
    expect(sortedKeys).to.eql(['id', 'name', 'apples', 'bananas'])
  })

  it('sorts _links and _embedded after others', () => {
    const unsorted = {
      _embedded: { 'rel': { id: 'RelId' } },
      apples: 'Apples',
      _links: { 'rel': 'href' },
      id: 'Id',
    }

    const sorted = new FieldSorter().sort(unsorted)
    const sortedKeys = Object.keys(sorted)
    expect(sortedKeys).to.eql(['id', 'apples', '_links', '_embedded'])
  })

  it('sorts _links recursively', () => {
    const unsorted = {
      _links: {
        'self': 'SelfHref',
        'edit': 'EditHref',
        '/other/link': 'OtherHref',
      },
      id: 'Id',
    }

    const sorted = new FieldSorter().sort(unsorted)
    const sortedKeys = Object.keys(sorted)
    expect(sortedKeys).to.eql(['id', '_links'])

    const sortedLinksKeys = Object.keys(sorted._links)
    expect(sortedLinksKeys).to.eql(['self', 'edit', '/other/link'])
  })
})
