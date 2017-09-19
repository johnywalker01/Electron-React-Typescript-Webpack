import { observable } from 'mobx'
import {MSECONDS_PER_SECOND} from './constants'

type ExpirableGetAndStore<T> = (e: Expirable<T>) => void
export default class Expirable<T> {
  @observable item: T = null
  storedTime: Date = new Date(0)
  getTime: Date = new Date(0)
  expiresAfter: number
  getAndStore: ExpirableGetAndStore<T>

  constructor(expiresAfter: number, getAndStore: ExpirableGetAndStore<T>) {
    this.expiresAfter = expiresAfter
    if (getAndStore) { this.getAndStore = getAndStore }
  }

  store(item: T) {
    this.item = item
    this.storedTime = new Date()
  }

  expired() {
    let now = new Date()
    if ((now.getTime() - this.getTime.getTime()) <= MSECONDS_PER_SECOND) {return false}
    if ((now.getTime() - this.storedTime.getTime()) >= this.expiresAfter) {return true}
    return false
  }

  get() {
    if (this.expired()) {
      this.getTime = new Date()
      this.getAndStore(this)
    }
    return this.item
  }

  forceExpire() {
    this.storedTime = new Date(0)
  }

}
