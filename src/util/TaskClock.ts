export class TaskClock {
  intervalID?: number
  func?: () => {}
  msecs: number = 0
  targetTime: number
  constructor(func) {
    this.func = func
    this.intervalID = null
  }

  isActive() {
    return this.intervalID !== null
  }

  start(msecs: number) {
    if (this.intervalID) {return}
    this.msecs = msecs
    this.targetTime = Date.now() + this.msecs
    this.intervalID = window.setInterval(this.func, this.msecs)
  }

  updateTargetTime() {
    this.targetTime = Date.now() + this.msecs
  }

  late() {
    return Date.now() - this.targetTime
  }

  stop() {
    clearInterval(this.intervalID)
    this.intervalID = null
  }
}
