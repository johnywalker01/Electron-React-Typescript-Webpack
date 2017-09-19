import * as constants from 'src/util/constants'
import { TIMESCALE, MSECONDS_PER_DAY } from './constants'
import { sprintf } from 'sprintf-js'

export class EnhancedDate extends Date {
  base: Date
  constructor(orig: Date) {
    super(orig)
    this.base = new Date()
    this.base.setTime(orig.getTime())
  }
  addYears(offset: number): EnhancedDate {
    let result = new EnhancedDate(this.base)
    result.base.setUTCFullYear(result.base.getUTCFullYear() + offset)
    return result
  }
  addMonths(offset: number): EnhancedDate {
    let result = new EnhancedDate(this.base)
    result.base.setUTCMonth(result.base.getUTCMonth() + offset)
    return result
  }
  addDays(offset: number): EnhancedDate {
    let result = new EnhancedDate(this.base)
    result.base.setUTCDate(result.base.getUTCDate() + offset)
    return result
  }
  addMSecs(offset: number): EnhancedDate {
    let result = new EnhancedDate(this)
    result.base.setUTCMilliseconds(result.base.getUTCMilliseconds() + offset)
    return result
  }
  addSecs(offset: number): EnhancedDate {
    let result = new EnhancedDate(this)
    result.base.setUTCSeconds(result.base.getUTCSeconds() + offset)
    return result
  }
  forceInRange(min?: EnhancedDate, max?: EnhancedDate) {
    if (min && this < min) {
      this.base.setTime(min.base.getTime())
    }
    if (max && this > max) {
      this.base.setTime(max.base.getTime())
    }
    return this
  }
  getTime() {
    return this.base.getTime()
  }
  valueOf() {
    return this.base.getTime()
  }

  moveForward(tscale: TIMESCALE, units: number = 1) {
    let now = new EnhancedDate(this)
    now.setToFirst(tscale - 1)
    let next = this.addUnits(tscale, units)
    next.setToFirst(tscale - 1)
    if (now.valueOf() !== next.valueOf()) {
      return next
    }
    while (now <= this) {
      now = now.addUnits(tscale, units)
    }
    return now
  }

  moveBackward(tscale: TIMESCALE, units: number = 1) {
    let now = new EnhancedDate(this)
    now.addSecs(-1)
    now.setToFirst(tscale - 1)
    let last = new EnhancedDate(now)
    while (now < this) {
      last = now
      now = now.addUnits(tscale, units)
    }
    return last
  }

  addUnits(tscale: TIMESCALE, units: number) {
    switch (tscale) {
      case TIMESCALE.YEARS:
        return this.addYears(units)
      case TIMESCALE.MONTHS:
        return this.addMonths(units)
      case TIMESCALE.DAYS:
        return this.addDays(units)
      case TIMESCALE.HOURS:
        return this.addSecs(units * constants.SECONDS_PER_HOUR)
      case TIMESCALE.MINUTES:
        return this.addSecs(units * constants.SECONDS_PER_MINUTE)
      default:
      case TIMESCALE.SECONDS:
        return this.addSecs(units)
    }
  }

  setToFirst(tscale: TIMESCALE) {
    this.base.setTime(this.findFirst(tscale).base.getTime())
  }

  findFirst(tscale: TIMESCALE): EnhancedDate {
    let t = new EnhancedDate(this)
    t.base.setMilliseconds(0)
    switch (tscale) {
      case TIMESCALE.YEARS:
        t.base.setMonth(0)
      case TIMESCALE.MONTHS:
        t.base.setDate(1)
      case TIMESCALE.DAYS:
        t.base.setHours(0)
      case TIMESCALE.HOURS:
        t.base.setMinutes(0)
      case TIMESCALE.MINUTES:
        t.base.setSeconds(0)
      default:
    }
    return t
  }

  getUnit(tscale: TIMESCALE): number {
    switch (tscale) {
      case TIMESCALE.YEARS:
        return this.base.getFullYear()

      case TIMESCALE.MONTHS:
        return this.base.getMonth()

      case TIMESCALE.DAYS:
        return this.base.getDate() - 1

      case TIMESCALE.HOURS:
        return this.base.getHours()

      case TIMESCALE.MINUTES:
        return this.base.getMinutes()

      case TIMESCALE.SECONDS:
        return this.base.getSeconds()

      default:
        break
    }
    return 0
  }

  rank(tscale: TIMESCALE, units: number = 1) {
    for (let lscale = TIMESCALE.SECONDS; lscale > tscale; lscale--) {
      if (this.getUnit(lscale) !== 0) {
        return false
      }
    }
    return this.getUnit(tscale) % units === 0
  }
  msecsTo(source: EnhancedDate) {
    return source.getTime() - this.getTime()
  }
  secsTo(source: EnhancedDate) {
    return Math.floor((source.getTime() - this.getTime()) / 1000)
  }

  toISOString() {
    return this.base.toISOString()
  }
} // end EnhancedDate

export function formatDisplayTime(time: Date, forceDate = false, now = new Date()) {
  if (!time) {
    return time
  }
  let meridian = time.getHours() <= 11 ? 'AM' : 'PM'

  let hours12
  if (time.getHours() === 0) {
    hours12 = 12
  } else if (time.getHours() > 12) {
    hours12 = time.getHours() - 12
  } else {
    hours12 = time.getHours()
  }

  const timeStr = sprintf('%02d:%02d:%02d %s', hours12, time.getMinutes(), time.getSeconds(), meridian)

  if (
    forceDate ||
    Math.abs(time.getTime() - now.getTime()) > MSECONDS_PER_DAY ||
    time.getDay() !== now.getDay()
  ) {
    return sprintf('%02d/%02d/%d %s', time.getMonth() + 1, time.getDate(), time.getFullYear(), timeStr)
  } else {
    return timeStr
  }
}
