import { VideoCell } from './VideoCell'
import { MSECONDS_PER_MINUTE, MSECONDS_PER_SECOND, MSECONDS_PER_DAY } from '../util/constants'
import { TaskClock } from 'src/util/TaskClock'
import { observable, ObservableMap, computed } from 'mobx'

import { DataSessionSettings } from '../serenity'
import { DataSourceBox } from '../util/DataSourceBox'
import jpegSize = require('jpeg-size')
import logs from '../util/logs'
import palette from '../util/palette'
import messages from './VideoCell/messages'
import { DataSession } from 'src/serenity/resources'
import { ScrubberModel } from 'src/OpsInterface/VideoCell/Scrubber/model'
import BookmarkEngine from '../util/BookmarkEngine'
import { formatDisplayTime } from 'src/util/EnhancedDate'

const SESSION_TIMEOUT = MSECONDS_PER_MINUTE / 2
const IMAGE_TIMEOUT = MSECONDS_PER_SECOND / 2
const IMAGE_REQUEST_TIMEOUT = MSECONDS_PER_SECOND * 10

enum VideoCellState {
  EMPTY,
  VIDEO,
  LOADING_OVER_EMPTY,
  LOADING_OVER_VIDEO
}

export enum SPEED_OPTIONS {
  REVERSE,
  STEP_BACK,
  TOGGLE_PAUSE,
  STEP_FORWARD,
  FAST_FORWARD,
  JUMP_TO_LIVE,
  JUMP_BACK_30_SECS
}

class TimeSpeedData {
  base: Date
  origOffset: number
  offset: number
  speed: number

  constructor(time?: Date, speed: number = 1) {
    let now = new Date()
    this.base = time || now
    this.origOffset = now.getTime() - this.base.getTime()
    if (this.origOffset < (3 * MSECONDS_PER_SECOND)) {
      this.origOffset = 0
      this.base = now
    }
    this.offset = this.origOffset
    this.speed = speed
  }

  getDate(): Date {
    const now = new Date()
    let diff = (now.getTime() - (this.base.getTime() + this.offset)) * (this.speed - 1)
    return new Date(now.getTime() - this.offset + diff)
  }

  getTimeSpeedSettings(force: boolean) {
    let settings: DataSessionSettings = {}
    if (this.origOffset > 0) {
      settings.time = this.getDate().toISOString()
      settings.speed = this.speed
    } else if (force) {
      settings.time = null
    }
    return settings
  }

  setTimestamp(timestamp: Date) {
    let offset = timestamp.getTime() - this.getDate().getTime()
    if (this.speed === 1) {
      this.offset -= offset
    } else {
      this.offset -= offset / (this.speed - 1)
    }
  }
}

type ImageSizeData = {width?: number, height?: number}

export default class ViewCamera {
  // Stable properties
  dataSourceMap: ObservableMap<DataSourceBox>
  cell: VideoCell
  scrubberModel: ScrubberModel
  timer: TaskClock

  // Source state
  @observable sourceBox: DataSourceBox

  // Session state
  @observable session: DataSession
  imageSizeDesired: ImageSizeData = {}
  timeSpeedDesired: TimeSpeedData
  imageSizeSession: ImageSizeData = {}

  sessionRequestPendingSince: Date = null
  sessionRequestFailedAt: Date = null
  sessionNotValid = true
  sessionNeedsUpdate = true

  // Video state
  @observable imageSizeActual: ImageSizeData = {}
  imageSizeScaled: ImageSizeData = {}
  @observable imageUrl: string = null
  imageBlob: Blob = null
  revokableUrls: Array<string> = new Array()
  timeSpeedActual: TimeSpeedData
  @observable imageTimestamp: Date

  imageRequestAt = new Date(0)
  imageRequestSuccededAt = new Date(0)
  imageDataReceivedAt = new Date(0)
  imageRequestPendingSince: Date = null

  // Calculations/results
  @observable displayTime: string = ''
  @observable displaySpeed: number = 0
  @observable displayIsLive: boolean = true

  hasPausedImage = false

  @observable isVideo = false
  @observable isLoading = false

  @observable visible = false
  @observable isFullScreen = false
  @observable isTakingSnapshot = false

  // Used while creating bookmarks
  // Stored here so both the dialog and the canvas can use the data
  @observable bookmarkEngine = new BookmarkEngine()

  @computed get connected(): boolean {
    return !!this.sourceBox
  }

  @computed get name(): string {
    return this.sourceBox && this.sourceBox.source.name
  }

  @computed get endpoint() {
    return this.sourceBox.endpoint
  }

  constructor(dataSourceMap: ObservableMap<DataSourceBox>) {
    this.dataSourceMap = dataSourceMap
    this.scrubberModel = new ScrubberModel(this)
    this.timer = new TaskClock(() => { this.tick() })
  }

  connect(sourceId: string) {
    if (!this.dataSourceMap.has(sourceId)) {
      // bad drop
      return
    }
    if (this.cell) { this.cell.reset() }
    this.isLoading = true
    if (this.sourceBox) { this.sourceBox.removeViewCamera(this) }
    this.sourceBox = this.dataSourceMap.get(sourceId)
    this.sourceBox.addViewCamera(this)
    this.bookmarkEngine.connect(this.sourceBox)
    this.sessionRequestPendingSince = null
    this.sessionRequestFailedAt = null
    this.sessionNotValid = true
    this.isVideo = true
    this.displayIsLive = true
    this.imageSizeActual = {}
    this.timeSpeedDesired = new TimeSpeedData()
    this.calculateDisplayTime()
    this.timer.start(50)
  }

  disconnect() {
    if (this.sourceBox) { this.sourceBox.removeViewCamera(this) }
    this.sourceBox = null
    this.bookmarkEngine.disconnect()
    this.isVideo = false
    this.isLoading = false
    this.isFullScreen = false
    this.sessionRequestFailedAt = null
    this.timer.stop()
  }

  requestNewSession(time?: Date, speed = 1) {
    logs.TIMELINE.debug(`requestNewSession (${time ? time.toISOString() : 'now'}, ${speed})`)
    this.isLoading = true
    this.timeSpeedDesired = new TimeSpeedData(time, speed)
    this.displayIsLive = this.timeSpeedDesired.offset === 0
    this.sessionNeedsUpdate = true
    this.sessionRequestFailedAt = null
    this.calculateDisplayTime()
  }

  changeSpeed(delta: SPEED_OPTIONS) {
    let newSpeed = 1
    let newTimeDelta = 0
    let oldSpeed = this.getDesiredVideoSpeed()
    let newDate = this.getDesiredVideoTime()
    switch (delta) {
      default:
        break
      case SPEED_OPTIONS.JUMP_TO_LIVE:
        // handle separately
        this.requestNewSession()
        return
      case SPEED_OPTIONS.REVERSE:
        let lastPlaybackTime = (new Date()).getTime() - 30 * MSECONDS_PER_SECOND
        if (newDate.getTime() >= lastPlaybackTime) {
          newTimeDelta = lastPlaybackTime - newDate.getTime()
        }
        if (oldSpeed === 1 ) {
          newSpeed = -1
        } else if (oldSpeed >= 0.5 ) {
          newSpeed = oldSpeed / 2
        } else if (oldSpeed < 0.5 && oldSpeed >= 0.25) {
          newSpeed = -0.25
        } else if (oldSpeed < 0.25 && oldSpeed >= -0.25) {
          // probably paused
          newSpeed = 1
        } else if (oldSpeed < -0.25 && oldSpeed >= -64) {
          newSpeed = oldSpeed * 2
        } else if (oldSpeed < -64) {
          newSpeed = oldSpeed
        }
        break
      case SPEED_OPTIONS.STEP_BACK:
        newTimeDelta = -MSECONDS_PER_SECOND / 2
        newSpeed = 0
        break
      case SPEED_OPTIONS.TOGGLE_PAUSE:
        if (oldSpeed !== 0) { newSpeed = 0 }
        break
      case SPEED_OPTIONS.STEP_FORWARD:
        newTimeDelta = MSECONDS_PER_SECOND / 2
        newSpeed = 0
        break
      case SPEED_OPTIONS.FAST_FORWARD:
        if (oldSpeed <= -0.5 ) {
          newSpeed = oldSpeed / 2
        } else if (oldSpeed > -0.5 && oldSpeed <= -0.25) {
          newSpeed = 0.25
        } else if (oldSpeed > -0.25 && oldSpeed <= 0.25) {
          // probably paused
          newSpeed = 1
        } else if (oldSpeed > 0.25 && oldSpeed <= 64) {
          newSpeed = oldSpeed * 2
        } else if (oldSpeed > 64) {
          newSpeed = oldSpeed
        }
        break
      case SPEED_OPTIONS.JUMP_BACK_30_SECS:
        newTimeDelta = -MSECONDS_PER_SECOND * 30
        newSpeed = oldSpeed
        break
    }
    if (newTimeDelta) {
      newDate = new Date(newDate.getTime() + newTimeDelta)
    }
    this.requestNewSession(newDate, newSpeed)
  }

  setVisible(visible: boolean) {
    this.visible = visible
    if (!visible) { this.setFullScreen(false) }
    this.updateImage()
  }

  setDimensions(cell: VideoCell, width: number, height: number) {
    this.cell = cell
    this.imageSizeDesired.width = width
    this.imageSizeDesired.height = height
    logs.VIDEO.debug(`setDimensions ${width}x${height}`)
    if (!this.isLoading) {
      this.updateImage()
    }
  }

  setFullScreen(fullScreen) { this.isFullScreen = fullScreen }

  @computed get canCreateBookmarks(): boolean {
    return this.sourceBox &&
      this.sourceBox.bookmarks() &&
      this.sourceBox.bookmarks().postAddBookmark !== undefined
  }
  @computed get canCreateLockedBookmarks(): boolean {
    return this.sourceBox &&
      this.sourceBox.bookmarks() &&
      this.sourceBox.bookmarks().postAddLockedBookmark !== undefined
  }
  get canCreateBookmarkHere(): boolean {
    return this.scrubberModel.inClip
  }

  updateImage() {
    if (!(this.imageSizeActual &&
          this.imageUrl &&
          this.visible)) { return }
    let imgWidth = this.imageSizeDesired.width
    let imgHeight = this.imageSizeDesired.height
    let size = this.imageSizeActual
    if (size) {
      const imageRatio = size.height / size.width
      const cellRatio = this.imageSizeDesired.height / this.imageSizeDesired.width
      const ratioRatio = imageRatio / cellRatio
      // If the image is taller than the cell
      if (ratioRatio >= 1) {
        imgWidth = Math.floor(this.imageSizeDesired.width / ratioRatio)
        imgHeight = this.imageSizeDesired.height
      } else {
        imgWidth = this.imageSizeDesired.width
        imgHeight = Math.floor(this.imageSizeDesired.height * ratioRatio)
      }
    }
    this.imageSizeScaled.width = imgWidth
    this.imageSizeScaled.height = imgHeight
    logs.VIDEO.debug(`updateImage   ${imgWidth}x${imgHeight}`)
    if (this.hasResolutionChanged()) {
      this.sessionNeedsUpdate = true
    }
  }

  hasResolutionChanged() {
    if (this.isLoading) {return false}
    if (!this.imageSizeSession) { return true }
    if (!this.imageSizeSession.width) { return true }
    // This calculates a logical distance between two resolutions to
    // prevent excessive session requests when resizing
    let distance = 0
    distance += Math.abs(Math.log(this.imageSizeSession.width / this.imageSizeScaled.width))
    distance += Math.abs(Math.log(this.imageSizeSession.height / this.imageSizeScaled.height))
    // A distance of 0.05 is approximately the change from 1000x1000 to 975x975
    return (distance > 0.05)
  }

  getDesiredVideoSpeed () {
    // check desired first, to reflect user wishes
    if (this.timeSpeedDesired) {return this.timeSpeedDesired.speed}
    if (this.timeSpeedActual) {return this.timeSpeedActual.speed}
    return 0
  }

  getDesiredVideoTime() {
    // check desired first, to reflect user wishes
    if (this.timeSpeedDesired) {return this.timeSpeedDesired.getDate()}
    if (this.timeSpeedActual) {return this.timeSpeedActual.getDate()}
    return new Date()
  }

  getVideoTime() {
    if (this.timeSpeedActual) {return this.timeSpeedActual.getDate()}
    if (this.timeSpeedDesired) {return this.timeSpeedDesired.getDate()}
    return new Date()
  }

  getClips() {
    return this.sourceBox.clipStore.get(this.sourceBox.source)
  }

  tick() {
    if (!this.visible) {return}
    this.calculateDisplayTime()
    this.updateSessionIfNeeded()
    this.updateImageDataIfNeeded()
  }

  @computed get displayTimestamp() {
    if (this.displayIsLive || (!this.imageTimestamp)) { return null }
    return this.imageTimestamp
  }

  @computed get displayTimestampOptions() {
    if (this.displayIsLive || (!this.imageTimestamp)) { return null }
    return this.formatDisplayOptions(this.imageTimestamp)
  }

  calculateDisplayTime() {
    this.displaySpeed = this.getDesiredVideoSpeed()
    this.displayTime = formatDisplayTime(this.getDesiredVideoTime())
  }

  formatDisplayOptions(time: Date) {
    let now = new Date()
    let options: Intl.DateTimeFormatOptions = {
      second: '2-digit',
      minute: '2-digit',
      hour: '2-digit',
      hour12: true,
    }
    if ((Math.abs(time.getTime() - now.getTime()) > MSECONDS_PER_DAY) || (time.getDay() !== now.getDay())) {
      options = {
        ...options,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    }
    return options
  }

  formatDisplayTime(time: Date) {
    if (!time) {
      return
    }
    return time.toLocaleString('en-US', this.formatDisplayOptions(time))
  }

/**
 * When do we need a new session?
 * - If our session isn't valid.
 *   - camera source changed or session timed out
 * - If our session needs an update.
 *   - time change
 *   - speed change
 *   - resolution change
 * * Only if we're not currently getting a new session.
 */
  updateSessionIfNeeded() {
    let requestTime = new Date()
    let threshold = requestTime.getTime() - SESSION_TIMEOUT
    if (!((this.sessionNotValid || this.sessionNeedsUpdate) &&
      !(this.sessionRequestPendingSince && this.sessionRequestPendingSince.getTime() >= threshold) &&
      !(this.sessionRequestFailedAt && this.sessionRequestFailedAt.getTime() >= threshold)
    )) { return }
    this.sessionRequestPendingSince = requestTime
    let settings = (this.timeSpeedDesired || this.timeSpeedActual).getTimeSpeedSettings(this.sessionNeedsUpdate)
    if (!this.isLoading) {
      settings.x_resolution = Math.floor(this.imageSizeScaled.width)
      settings.y_resolution = Math.floor(this.imageSizeScaled.height)
    }
    logs.VIDEO.debug(`Creating session for ${this.name}:`)
    if (this.sessionNotValid) {
      this.sourceBox.serenity.dataSession(this.endpoint, settings).then((response) => {
        if (this.endpoint === response.endpoint &&
            settings === response.settings) {
          this.storeSession(response.session, settings)
        }
      })
      .catch(this.storeSessionError)
    } else {
      this.sourceBox.serenity.dataSessionPatch(this.session, settings).then((response) => {
        if (this.session.id === response.session.id &&
            settings === response.settings) {
          this.storeSession(this.session, settings)
        }
      })
      .catch(this.storeSessionError)
    }
  }

  storeSession(session: DataSession, settings: DataSessionSettings) {
    // prevent new sessions after a disconnect
    if (!this.sourceBox) {return}
    logs.VIDEO.debug(settings)
    let imageSizeData: ImageSizeData = {}
    if (settings.x_resolution) { imageSizeData.width = settings.x_resolution }
    if (settings.y_resolution) { imageSizeData.height = settings.y_resolution }
    this.imageSizeSession = imageSizeData
    this.sessionRequestPendingSince = null
    this.sessionRequestFailedAt = null
    let newSession = this.session ? (this.session.id !== session.id) : true
    this.session = session
    this.sessionNotValid = false
    this.sessionNeedsUpdate = false
    this.hasPausedImage = false
    this.imageDataReceivedAt = new Date(0)
    if (this.timeSpeedDesired) {
      if (this.timeSpeedDesired.offset) {
        this.timeSpeedActual = this.timeSpeedDesired
      } else {
        this.timeSpeedActual = new TimeSpeedData()
      }
      if (this.timeSpeedDesired.speed !== 1 && newSession) {
        this.sessionNeedsUpdate = true
      } else {
        this.timeSpeedDesired = null
      }
    }
  }

  storeSessionError = () => {
    this.sessionNotValid = true
    // prevent new errors after a disconnect
    if (this.sourceBox) {
      this.sessionRequestFailedAt = this.sessionRequestPendingSince
    }
    if (this.imageUrl) {
      window.URL.revokeObjectURL(this.imageUrl)
      this.imageBlob = null
      this.imageUrl = null
    }

    this.sessionRequestPendingSince = null
  }

/**
 * When do we need a new image?
 * - Not if we have an image a paused session
 * - The session is valid.
 *   - It's ok if the session needs an update.
 * - We're not currently requesting an image.
 *   - Give the server until IMAGE_REQUEST_TIMEOUT if it hangs.
 * - If it has been long enough since our last image received or requested.
 *   - This throttles both failed and successful requests.
 */
  updateImageDataIfNeeded() {
    let requestTime = new Date()
    let threshold = requestTime.getTime() - IMAGE_TIMEOUT
    let sessionThreshold = requestTime.getTime() - IMAGE_REQUEST_TIMEOUT
    if (!(!this.hasPausedImage &&
          !this.sessionNotValid &&
          !(this.imageRequestPendingSince && this.imageRequestPendingSince.getTime() >= sessionThreshold) &&
          (this.imageRequestAt.getTime() < threshold) &&
          (this.imageRequestSuccededAt.getTime() < threshold)  )) {return}
    // If we haven't received a valid image for a long time, for whatever reason, treat it as a session error
    if (!this.sessionNeedsUpdate &&
        this.imageDataReceivedAt.getTime() > 0 &&
        this.imageDataReceivedAt.getTime() < (requestTime.getTime() - SESSION_TIMEOUT)) {
      this.storeSessionError()
      return
    }
    this.imageRequestPendingSince = requestTime
    this.imageRequestAt = requestTime
    this.sourceBox.serenity.dataSessionData(this.session).then((imageobj) => {
      this.imageRequestPendingSince = null
      // prevent new images after a disconnect
      if (!this.sourceBox) {return}
      if (this.session.id !== imageobj.session.id) {return}
      if (imageobj.code === 404) {
        this.sessionNotValid = true
        return
      }
      this.imageRequestSuccededAt = new Date()
      if (imageobj.data) {
        this.imageDataReceivedAt = new Date()
        if (this.imageUrl) {
          this.revokableUrls.push(this.imageUrl)
          if (this.revokableUrls.length > 2) {
            window.URL.revokeObjectURL(this.revokableUrls.shift())
          }
        }
        if (this.timeSpeedActual.speed === 0) {
          this.hasPausedImage = true
        }
        if (imageobj.timestamp) {
          this.imageTimestamp = imageobj.timestamp
          this.timeSpeedActual.setTimestamp(imageobj.timestamp)
        } else {
          this.imageTimestamp = this.timeSpeedActual.getDate()
        }

        let blob = new Blob([imageobj.data], {type: 'image/jpeg'})
        let url = window.URL.createObjectURL(blob)
        let size = jpegSize(new Uint8Array(imageobj.data))
        logs.VIDEO.debug(`getData imgUrl updated`)
        this.imageBlob = blob
        this.imageUrl = url
        this.imageSizeActual = size
        this.updateImage()
        this.isLoading = false
        this.isVideo = true
      }
    })
  }

  errorMessage() {
    if (this.sessionRequestFailedAt) {
      if (this.displayIsLive) {
        return messages.errorCannotConnect
      } else {
        return messages.errorNoRecordingExists
      }
    }
    return null
  }

  @computed get backgroundColor() {
    return this.isVideo ? palette.d0 : palette.d3
  }

  @computed get inSnapshot() {
    return false
  }

  saveSnapshotInternal(snapshotData) {
    let blob = new Blob([snapshotData], { type: 'image/jpeg' })
    let url = window.URL.createObjectURL(blob)
    try {
      let name = `${this.name}_${this.displayTime}.jpg`
      if (window.browserInfo.name === 'InternetExplorer' || window.browserInfo.name === 'Edge') {
        navigator.msSaveBlob(blob, name)
      } else {
        let a = document.createElement('a')
        a.href = url
        a.download = name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    } finally {
      window.URL.revokeObjectURL(url)
    }
  }

  async saveSnapshot() {
    try {
      this.isTakingSnapshot = true
      if (this.displayIsLive) {
        let snapshotData = await this.sourceBox.source.getSnapshot()
        if (snapshotData) {
          this.saveSnapshotInternal(snapshotData)
        }
      } else {
        let desiredTime = new Date(this.getDesiredVideoTime().getTime() -
          (this.getDesiredVideoSpeed() * 5 * MSECONDS_PER_SECOND))
        let settings: DataSessionSettings = {
          time: desiredTime.toISOString(),
          speed: 0,
        }
        let response = await this.sourceBox.serenity.dataSession(this.endpoint, settings)
        let imageobj = await this.sourceBox.serenity.dataSessionData(response.session)
        this.saveSnapshotInternal(imageobj.data)
      }
    } finally {
      this.isTakingSnapshot = false
    }
  }
}
