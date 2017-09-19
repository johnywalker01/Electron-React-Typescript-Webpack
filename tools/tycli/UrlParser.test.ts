import {expect} from 'chai'
import UrlParser from './UrlParser'

describe('UrlParser', () => {
  it('parses a url without username/password', () => {
    const urlParser = new UrlParser()
    urlParser.parse('http://host/path')
    expect(urlParser.username).to.not.exist
    expect(urlParser.password).to.not.exist
    expect(urlParser.url).to.equal('http://host/path')
  })

  it('parses a url with only username', () => {
    const urlParser = new UrlParser()
    urlParser.parse('http://user@host/path')
    expect(urlParser.username).to.equal('user')
    expect(urlParser.password).to.not.exist
    expect(urlParser.url).to.equal('http://host/path')
  })

  it('parses a url with only username', () => {
    const urlParser = new UrlParser()
    urlParser.parse('http://user:pass@host/path')
    expect(urlParser.username).to.equal('user')
    expect(urlParser.password).to.equal('pass')
    expect(urlParser.url).to.equal('http://host/path')
  })

  it('fails validation for non-url', () => {
    expect(function() {
      new UrlParser().parse('nonsense') // tslint:disable-line:no-unused-new
    }).to.throw(/Invalid URL/)
  })
})
