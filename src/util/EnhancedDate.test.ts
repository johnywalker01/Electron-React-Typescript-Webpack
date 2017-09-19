import { formatDisplayTime } from './EnhancedDate'
import {expect} from 'chai'

describe('formatDisplayTime', () => {
  const jan02 = new Date('2017-01-02 12:00 AM')

  it('formats midnight, excluding date', () => {
    expect(formatDisplayTime(new Date('2017-01-02 12:00 AM'), false, jan02))
      .to.equal('12:00:00 AM')
  })

  it('formats AM, excluding date', () => {
    expect(formatDisplayTime(new Date('2017-01-02 1:23:45 AM'), false, jan02))
      .to.equal('01:23:45 AM')
  })

  it('formats noon, excluding date', () => {
    expect(formatDisplayTime(new Date('2017-01-02 12:00 PM'), false, jan02))
      .to.equal('12:00:00 PM')
  })

  it('formats PM, excluding date', () => {
    expect(formatDisplayTime(new Date('2017-01-02 2:34:56 PM'), false, jan02))
      .to.equal('02:34:56 PM')
  })

  it('forces date', () => {
    expect(formatDisplayTime(new Date('2017-01-02 12:00 AM'), true, jan02))
      .to.equal('01/02/2017 12:00:00 AM')
  })

  it('includes date from yesterday', () => {
    expect(formatDisplayTime(new Date('2017-01-01 12:00 AM'), true, jan02))
      .to.equal('01/01/2017 12:00:00 AM')
  })
})
