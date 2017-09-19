// Translated from 
//    http://svn.pelco.org/repos/endura_gui/trunk/GUI/Common/Include/SearchCommon.h
//    http://svn.pelco.org/repos/endura_gui/trunk/GUI/Plugins/ViewServices/Common/Include/EvSearchData.h
//    http://svn.pelco.org/repos/endura_gui/trunk/GUI/Plugins/ViewServices/Common/Include/EvSearchDisplay.h
//    http://svn.pelco.org/repos/endura_gui/trunk/GUI/Engine/SearchCommon.cpp
//    http://svn.pelco.org/repos/endura_gui/trunk/GUI/Plugins/ViewServices/VSrvSearchGraphPlugin/EvSearchData.cpp
//    http://svn.pelco.org/repos/endura_gui/trunk/GUI/Plugins/ViewServices/VSrvSearchGraphPlugin/EvSearchDisplay.cpp
// I've deleted what I am sure won't be needed and commented out what I haven't translated over.  

// import { observable } from 'mobx'
import logs from 'src/util/logs'
import palette from 'src/util/palette'
import { RECORDTYPE } from './interval'
import ViewCamera from '../../ViewCamera'
import * as common from './common'
import { Bookmark } from 'src/serenity/resources'
import { TaskClock } from 'src/util/TaskClock'
import { TIMESCALE, SECONDS_PER_DAY, SECONDS_PER_MINUTE} from 'src/util/constants'
import { TIMEDISPLAYSIZE } from './common'
import { EnhancedDate } from 'src/util/EnhancedDate'

export const RECORDING_CATEGORIES = 5
const SEG_LEVELS = 5

export const scrubberTotalHeight = 75
const indicatorLabelStart = 0
const indicatorLabelHeight = 20
const indicatorHeight = 9
const sectionHeight = 14
const tickBoxTop = sectionHeight + indicatorLabelHeight
const roomForDescenders = 5
const textTopPos = tickBoxTop + sectionHeight - roomForDescenders
const textBottomPos = textTopPos + sectionHeight
const tickTextStart = textTopPos + 3
const fillClipsStart = scrubberTotalHeight - sectionHeight
const tickClipsStart = fillClipsStart + 5

const textBottomMargin = 3

const nLeftOffset = 0
const nRightOffset = 0

class TimeDisplayThreshold {
  size: TIMEDISPLAYSIZE
  tickScale: TIMESCALE
  tickStep: number
  dispScale: TIMESCALE
  dispStep: number
  topScale: TIMESCALE

  constructor(size: TIMEDISPLAYSIZE, tickScale: TIMESCALE, tickStep: number,
              dispScale: TIMESCALE, dispStep: number, topScale: TIMESCALE) {
    this.size = size
    this.tickScale = tickScale
    this.tickStep = tickStep
    this.dispScale = dispScale
    this.dispStep = dispStep
    this.topScale = topScale
  }
}

const TimeDisplayThresholds: TimeDisplayThreshold[] = [
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.SHORT,  TIMESCALE.MONTHS,   1,  TIMESCALE.YEARS,    1, TIMESCALE.YEARS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.SHORT,  TIMESCALE.MONTHS,   1,  TIMESCALE.MONTHS,   1, TIMESCALE.YEARS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.TICKS,  TIMESCALE.DAYS,     7,  TIMESCALE.MONTHS,   1, TIMESCALE.YEARS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.SHORT,  TIMESCALE.DAYS,     1,  TIMESCALE.DAYS,     1, TIMESCALE.MONTHS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.MEDIUM, TIMESCALE.HOURS,    6,  TIMESCALE.DAYS,     1, TIMESCALE.MONTHS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.HOURS,    6,  TIMESCALE.DAYS,     1, TIMESCALE.MONTHS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.HOURS,    3,  TIMESCALE.HOURS,    6, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.HOURS,    1,  TIMESCALE.HOURS,    4, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.HOURS,    1,  TIMESCALE.HOURS,    4, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.MINUTES, 30,  TIMESCALE.HOURS,    2, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.MINUTES, 15,  TIMESCALE.HOURS,    1, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.MINUTES, 10,  TIMESCALE.HOURS,    1, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.MINUTES,  5,  TIMESCALE.MINUTES, 30, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.MINUTES,  5,  TIMESCALE.MINUTES, 15, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.MINUTES,  3,  TIMESCALE.MINUTES, 15, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.MINUTES,  1,  TIMESCALE.MINUTES,  5, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.SECONDS, 15,  TIMESCALE.MINUTES,  1, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.SECONDS, 10,  TIMESCALE.SECONDS, 30, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.SECONDS,  5,  TIMESCALE.SECONDS, 15, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.SECONDS,  1,  TIMESCALE.SECONDS,  5, TIMESCALE.DAYS),
  new TimeDisplayThreshold(TIMEDISPLAYSIZE.LONG,   TIMESCALE.SECONDS,  0,  TIMESCALE.SECONDS,  0, TIMESCALE.DAYS),
]

// ============================================================================
// Class Declarations
// ============================================================================

export class ScrubberModel {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  blockClickEvent: boolean
  shortCaptions: Object[]
  timeDeepPast: EnhancedDate
  timeDeepFuture: EnhancedDate
  camera: ViewCamera
  nSliderXPos: number
  fontTickMarks: string
  DisplaySliderTime: EnhancedDate
  DisplayStartTime: EnhancedDate
  MSecPerPx: number
  SecPerPxFloat: number
  scrollTimer: TaskClock
  refreshTimer: TaskClock
  refreshNeeded = true

  nScrollOffset: number
  nScrollDelaySteps: number
  nScrollOffsetBase: number
  nScrollOffsetInterval: number
  dragZoom: boolean
  mouseDown: boolean
  TickTimeNext: EnhancedDate
  TickTimePrev: EnhancedDate

  dtMinQT: EnhancedDate
  dtMaxQt: EnhancedDate

  MinSliderTime: EnhancedDate
  MaxSliderTime: EnhancedDate

  lastWidth: number
  inClip: boolean
  drawnBookmarks: Array<Array<number>>

  constructor(camera: ViewCamera) {
    this.camera = camera

    this.blockClickEvent = false
    this.shortCaptions = [[], [], [], [], [], [], []]

    let nowUTC: EnhancedDate = new EnhancedDate(new Date())

    // EnhancedDate Limits
    this.dtMaxQt = nowUTC.addYears(2)
    this.dtMinQT = nowUTC.addYears(-4)

    this.MinSliderTime    = this.dtMinQT
    this.MaxSliderTime    = this.dtMaxQt

    this.nScrollOffset = 0
    this.nScrollDelaySteps = 0
    this.mouseDown = false
    this.inClip = false

    this.SecPerPxFloat = SECONDS_PER_MINUTE * 6
    let fontSize = 11 // Math.floor(11 * window.devicePixelRatio)
    this.fontTickMarks = '' + fontSize + 'px Arial'

    this.drawnBookmarks = new Array()

    this.scrollTimer = new TaskClock(() => {this.scrollView()})
    this.refreshTimer = new TaskClock(() => {this.refresh()})
  }

  setCanvas(canvas: HTMLCanvasElement) {
    if (!canvas) { return }
    if (this.canvas !== canvas) {
      this.canvas = canvas
      this.ctx = this.canvas.getContext('2d')
      this.lastWidth = this.width()
      this.nSliderXPos = Math.floor(this.width() * 0.6667)
      this.setMSecPerPx()

      let nowUTC: EnhancedDate = new EnhancedDate(new Date())
      this.DisplaySliderTime = nowUTC
      this.DisplayStartTime = this.GetNextPrevTimeAt(0)

      this.refreshTimer.start(33)
    }
    this.paintEvent()
  }

  height = () => Math.floor(this.canvas.clientHeight) // * window.devicePixelRatio)
  width = () => Math.floor(this.canvas.clientWidth) // * window.devicePixelRatio)

  setCamera(camera) {
    this.camera = camera
    this.paintEvent()
  }

  refresh() {
    if (this.width() !== this.lastWidth) {
      this.lastWidth = this.width()
      this.nSliderXPos = Math.floor(this.width() * 0.6667)
      this.setPosFromTime(this.DisplaySliderTime)
    }
    this.setPosFromTime(this.camera.getDesiredVideoTime())
    if (!this.refreshNeeded && !this.camera.bookmarkEngine.isDisplayingBookmark) {return}
    this.refreshNeeded = false
    this.timeDeepPast = this.GetNextPrevTimeAt(-2500)
    this.timeDeepFuture = this.GetNextPrevTimeAt(5000)
    this.setMSecPerPx()
    this.drawTimeline()
  }

  paintEvent() {
    this.refreshNeeded = true
  }

  drawNewTickSet() {
    let threshPos = 0
    let endTime = this.GetNextPrevTimeAt(this.width())
    let captionTime = new EnhancedDate(this.DisplayStartTime)
    captionTime.setToFirst(TIMESCALE.YEARS)
    captionTime = captionTime.addSecs(-1)
    while (TimeDisplayThresholds[threshPos].dispStep > 0) {
      const tdisp = TimeDisplayThresholds[threshPos]
      let segmentTime = this.DisplayStartTime.addUnits(tdisp.dispScale, tdisp.dispStep)
      if (segmentTime < endTime) {
        let tickTime = this.DisplayStartTime.addUnits(tdisp.tickScale, tdisp.tickStep)
        let tickWidth = this.GetPosFromTime(tickTime)
        if (tickWidth < 5) {
          break
        }
        let testCaption = this.makeCaption(captionTime, tdisp.dispScale, tdisp.size)
        let captionWidth = this.ctx.measureText(testCaption).width
        let segmentWidth = this.GetPosFromTime(segmentTime)

        if ((captionWidth + 6) > segmentWidth) {
          break
        }
      }
      threshPos++
    }
    threshPos--
    // logs.TIMELINE.info('threshPos: ' + threshPos)

    // Keeps the threshPos index valid, in case it gets to negative number.
    if (threshPos < 0) {
      threshPos = 0
    }

    const disp = TimeDisplayThresholds[threshPos]

    let cursorUTC = this.getOffsetTimeFromPos()
    const localStart = this.getOffsetTimeFromPos() // this.DisplayStartTime // cursorUTC.toLocalTime(); ???
    let cursorLocal = new EnhancedDate(localStart)

    let bBigSteps = ((disp.tickScale <= TIMESCALE.DAYS) ||
      ((disp.tickScale === TIMESCALE.HOURS && disp.tickStep > 1)))
    cursorLocal = cursorLocal.moveBackward(disp.topScale)

    let backShift: number
    let segMSec = 1000 * disp.tickStep
    let intPx

    if (bBigSteps) {
      backShift = localStart.secsTo(cursorLocal)
      cursorUTC = cursorUTC.addSecs(backShift)

      // Check for division by zero
      if ((this.MSecPerPx / 1000) === 0) {return}

      intPx = backShift / (this.MSecPerPx / 1000)
    } else {
      backShift = localStart.msecsTo(cursorLocal)
      cursorUTC = cursorUTC.addMSecs(backShift)

      switch (disp.tickScale) {
        case TIMESCALE.HOURS:
          segMSec *= 60
        case TIMESCALE.MINUTES:
          segMSec *= 60
        default:
          break
      }

      intPx = backShift / this.MSecPerPx
    }

    if (!bBigSteps && intPx < -150) {
      let segmentsToSkip = Math.floor((-150 * this.MSecPerPx - backShift) / segMSec)
      cursorUTC = cursorUTC.addUnits(disp.tickScale, disp.tickStep * segmentsToSkip)
      backShift += segMSec * segmentsToSkip
      intPx = backShift / this.MSecPerPx
      cursorLocal = new EnhancedDate(cursorUTC) // .toLocalTime() ???
    }

    let lastTop = -20
    let lastMid = -20
    let midDate = disp.dispScale <= TIMESCALE.DAYS

    let caption: string
    let lastTopTime = new EnhancedDate(cursorLocal)
    let lastMidTime = new EnhancedDate(cursorLocal)

    let bFoundNextTickTime = false
    while (intPx < (this.width() + 50)) {
      if (bBigSteps) {
        cursorLocal = cursorLocal.moveForward(disp.tickScale, disp.tickStep)
        cursorUTC = new EnhancedDate(cursorLocal) // .toUTC() ????
        intPx = this.getOffsetPosFromDate(cursorUTC.base) // GetPosFromTime(cursorUTC)
      } else {
        cursorUTC = cursorUTC.addUnits(disp.tickScale, disp.tickStep)
        backShift += segMSec
        intPx = backShift / this.MSecPerPx
        cursorLocal = new EnhancedDate(cursorUTC) // .toLocalTime() ???
      }
      intPx = Math.floor(intPx)
      if (intPx < -150) {
        continue
      }

      if (cursorUTC < this.DisplaySliderTime) {
        this.TickTimePrev = new EnhancedDate(cursorUTC)
      } else if ((!bFoundNextTickTime) && (cursorUTC > this.DisplaySliderTime)) {
        this.TickTimeNext = new EnhancedDate(cursorUTC)
        bFoundNextTickTime = true
      }

      // console.log(cursorLocal)
      if (cursorLocal.rank(disp.topScale)) {
        this.drawTickLine(intPx, tickBoxTop)

        captionTime = new EnhancedDate(lastTopTime)
        caption = this.makeCaption(captionTime, disp.topScale, TIMEDISPLAYSIZE.LONG)
        let textStart = lastTop + 5
        if (lastTop < 0) {
          textStart = 5
        }
        if ((textStart + 80) > intPx) {
          textStart = intPx - 80
        }

        this.ctx.fillStyle = palette.b1
        this.ctx.fillText(caption, textStart, textTopPos)
        // logs.TIMELINE.info('fillText(' + caption + ', ' + textStart + ', ' + textTopPos + ')')

        lastTop = intPx
        lastTopTime = new EnhancedDate(cursorLocal)
      }

      if (cursorLocal.rank(disp.dispScale, disp.dispStep)) {
        if (midDate) {
          this.drawTickLine(intPx, tickTextStart)
          caption = this.makeCaption(lastMidTime, disp.dispScale, disp.size)
          this.fillTextCenter(caption, lastMid, textBottomPos, intPx - lastMid)
        } else if (!cursorLocal.rank(disp.topScale)) {
          this.drawTickLine(intPx, tickTextStart)
          caption = this.makeCaption(cursorLocal, disp.dispScale, TIMEDISPLAYSIZE.LONG)
          this.ctx.fillStyle = palette.b1
          this.ctx.fillText(caption, intPx + textBottomMargin, textBottomPos)
        }

        lastMid = intPx
        lastMidTime = new EnhancedDate(cursorLocal)

      } else {
        this.drawTickLine(intPx, tickClipsStart)
      }
    }

    if (lastTop !== intPx) {
      captionTime = cursorLocal.moveBackward(disp.topScale)
      caption = this.makeCaption(captionTime, disp.topScale, TIMEDISPLAYSIZE.LONG)
      let textStart = (lastTop + 5)
      if (lastTop < 0) {
        textStart = 5
      }
      this.ctx.fillStyle = palette.b1
      this.ctx.fillText(caption, textStart, textTopPos)
      // logs.TIMELINE.info('last fillText(' + caption + ', ' + textStart + ', ' + textTopPos + ')')
    }
  }

  drawTickLine(x: number, top: number) {
    this.drawVerticalLine(palette.d5, x, top)
  }

  drawVerticalLine(style: string, x: number, top: number, bottom = scrubberTotalHeight) {
    let oldStrokeStyle = this.ctx.strokeStyle
    this.ctx.strokeStyle = style
    this.ctx.beginPath()
    this.ctx.moveTo(Math.floor(x), Math.floor(top))
    this.ctx.lineTo(Math.floor(x), Math.floor(bottom))
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.strokeStyle = oldStrokeStyle
  }

  fillTextCenter(text: string, x, y, boxWidth) {
    let textWidth = this.ctx.measureText(text).width
    let margin = (boxWidth - textWidth) / 2
    let offCenter = Math.floor(x + margin)
    this.ctx.fillStyle = palette.b1
    this.ctx.fillText(text, offCenter, y)
  }

  drawTimeline() {
    this.ctx.clearRect(0, 0, this.width(), this.height())
    if (!this.camera.connected) {return}

    this.ctx.font = this.fontTickMarks
    this.ctx.strokeStyle = palette.b1 // ' rgba(176, 176, 176, 0.5)'
    this.ctx.lineWidth = 1

    // Draw the timeline and fill with backgroundColor
    // this.ctx.strokeRect(0, 0, this.width(), tickBoxHeight)
    this.ctx.fillStyle = palette.d3
    this.ctx.fillRect(0, tickBoxTop, this.width(), scrubberTotalHeight)

    this.drawGraph()
    this.drawNewTickSet()
    this.drawBookmarks()
    this.drawFuture()
    this.drawSliderLine()
  }

  drawFuture() {
    let oldFillStyle = this.ctx.fillStyle
    let livePos = Math.min(this.getOffsetPosFromDate(new Date()) - 2, this.width())
    if (livePos < this.width()) {
      this.ctx.fillStyle = palette.d3
      this.ctx.fillRect(livePos, tickBoxTop, this.width() - livePos, fillClipsStart)
      let endPos = Math.min(this.width(), livePos + 4)
      this.fillInterval(palette.d0, livePos, endPos - livePos)
      if (endPos < this.width()) {
        this.fillInterval(palette.b1, endPos, this.width() - endPos)
      }
    }
    this.ctx.fillStyle = oldFillStyle
  }

  GetSegmentLevel(msecPerPx: number) {
    let secPerPx = msecPerPx / 1000.0
    let level = SEG_LEVELS - 1
    while (common.GAP_WIDTHS[level] > secPerPx) {
      level--
    }
    return level
  }

  drawGraph() {
    let oldFillStyle = this.ctx.fillStyle
    let livePos = Math.min(this.getOffsetPosFromDate(new Date()), this.width())
    this.fillInterval(palette.d0, 0, livePos)

    let intervalWidth: number
    let yPos: number

    const displayStartTime = this.getOffsetTimeFromPos() // new EnhancedDate(this.DisplayStartTime)
    let nScreenWidth = this.width() - nRightOffset + nLeftOffset
    const displayEndTime = this.getOffsetTimeFromPos(this.width())

    let intervalsDrawn = 0

    // The recDataFound flag is used to hide the Please wait message
    // as soon as the first rec interval is found.
    let recDataFound = false

    let clipSet = this.camera.getClips()
    this.inClip = clipSet.getClip(this.DisplaySliderTime) !== null
    for (let recType = 0; recType < RECORDTYPE.MAX; recType++) {
      let pInterval = clipSet.GetIntervalHead(recType)
      if (!pInterval) {continue}
      recDataFound = true
      let segLevel = this.GetSegmentLevel(this.MSecPerPx)
      pInterval = pInterval.FirstSegLevelOwner(segLevel, displayStartTime)
      while (pInterval) {
        let recordedStartTime = pInterval.SegStartTime(segLevel)
        let recordedEndTime = pInterval.SegStopTime(segLevel)

        let x1

        if (recordedStartTime < displayStartTime && recordedEndTime < displayStartTime) {break}
        if (recordedStartTime > displayEndTime && recordedEndTime > displayEndTime) {break}
        if (recordedStartTime < displayStartTime) {
          x1 = nLeftOffset
        } else {
          x1 = this.getOffsetPosFromDate(recordedStartTime)
          if ( x1 > nScreenWidth) {
            break
          } else if ( x1 < nLeftOffset ) {
            x1 = nLeftOffset
          }
        }

        let x2 = this.getOffsetPosFromDate(recordedEndTime)
        if (recordedEndTime > displayEndTime) {
          x2 = nScreenWidth
        } else if (x2 > nScreenWidth) {
          x2 = ((this.width() - (nLeftOffset) ) )
        }

        intervalWidth = Math.abs(x2 - x1)
        yPos = 0

        if ( intervalWidth < 3 ) {
          intervalWidth = 3
        }

        this.fillInterval(recType, x1, intervalWidth)

        pInterval = pInterval.NextSegLevelOwner(segLevel)
        intervalsDrawn++
      }
    }
    // logs.TIMELINE.debug('Intervals drawn: ' + intervalsDrawn)

    this.ctx.fillStyle = oldFillStyle
  }

  bookmarkPos(bookmark) {
    const time = new EnhancedDate(new Date(bookmark.time))
    const pos = this.getOffsetPosFromDate(time)
    let markPos = 0
    if (bookmark.lock && bookmark.lock.enabled) {
      const startTime = new EnhancedDate(new Date(bookmark.lock.start_time))
      const endTime = new EnhancedDate(new Date(bookmark.lock.end_time))
      const startPos = this.getOffsetPosFromDate(startTime)
      const endPos = this.getOffsetPosFromDate(endTime)
      markPos = pos
      if ((endPos - startPos) > 7) {
        return [startPos, markPos, endPos]
      }
    }
    return [pos - 3, markPos, pos + 3]
  }

  drawBookmarks() {
    const bookmarks = this.camera.bookmarkEngine.getBookmarks(true)
    const markTop = fillClipsStart + 1
    let newBookmarks = new Array()
    if (bookmarks) {
      bookmarks.forEach(bookmark => {
        const positions = this.bookmarkPos(bookmark)
        const [startPos, markPos, endPos] = positions
        if ((endPos <= 0) || (startPos >= this.width())) { return }
        newBookmarks.push([...positions, markTop + 2])
        const points = [
          [endPos, markTop],
          [endPos, markTop + 8],
          [endPos - 3, markTop + 5],
          [startPos + 3, markTop + 5],
          [startPos, markTop + 8],
          [startPos, markTop],
        ]
        this.drawShape(points, 3, palette.a, palette.d0)
        if (markPos) {
          this.drawShape([
            [markPos + 1, markTop],
            [markPos, markTop + 1],
            [markPos - 1, markTop],
          ], 3, palette.d0, palette.d0)
        }
      })
      this.drawnBookmarks = newBookmarks
    } else if (this.drawnBookmarks.length > 0) {
      this.drawnBookmarks = new Array()
    }
  }

  fillInterval(style: RECORDTYPE | string, x: number, width: number) {
    if (typeof(style) === 'number') {
      style = this.getRecordTypeColor(style)
    }
    this.ctx.fillStyle = style as string
    this.ctx.fillRect(x, fillClipsStart, width, scrubberTotalHeight - fillClipsStart)
  }

  drawTriangle(bx, by, dx1, dy1, dx2, dy2, lineWidth, fill, stroke?) {
    const points = [[bx, by], [bx + dx1, by + dy1], [bx + dx2, by + dy2]]
    this.drawShape(points, lineWidth, fill, stroke)
  }

  drawShape(points, lineWidth, fill, stroke?) {
    let oldFillStyle = this.ctx.fillStyle
    let oldStrokeStyle = this.ctx.strokeStyle
    this.ctx.fillStyle = fill
    this.ctx.strokeStyle = stroke || fill
    this.ctx.lineWidth = lineWidth
    this.ctx.beginPath()
    const firstPoint = points.pop(0)
    this.ctx.moveTo(firstPoint[0], firstPoint[1])
    points.forEach((point) => {
      this.ctx.lineTo(point[0], point[1])
    })
    this.ctx.closePath() // draws last line of the triangle
    this.ctx.stroke()
    this.ctx.fill()
    this.ctx.lineWidth = 1
    this.ctx.fillStyle = oldFillStyle
    this.ctx.strokeStyle = oldStrokeStyle
  }

  drawSliderLine() {
    let lineWidth = 5
    let sliderTop = indicatorLabelHeight + indicatorHeight + (lineWidth - 1) / 2
    let triangleHalfWidth = 5
    this.drawTriangle(this.nSliderXPos, sliderTop,
                      triangleHalfWidth, -indicatorHeight,
                      -triangleHalfWidth, -indicatorHeight,
                      5, palette.a, palette.d0)
    this.drawVerticalLine(palette.a, this.nSliderXPos, sliderTop - 1)

    this.ctx.strokeStyle = palette.status_a
    this.ctx.font = '14px Arial'
    let timeWidth = this.ctx.measureText(this.camera.displayTime).width
    let spacingValues: Array<number> = [6, timeWidth, 6]
    let spacingItems: Array<string> = [null, this.camera.displayTime, null]
    let arrowWidth = 0
    let speedWidth = 0
    let speedText = ''
    let speed = this.camera.displaySpeed
    if (speed !== 1 && speed !== 0) {
      arrowWidth = 8
      let absSpeed = Math.abs(speed)
      if (absSpeed < 1) {
        speedText = `1/${Math.floor(1 / absSpeed)}X`
      } else {
        speedText = `${Math.floor(absSpeed)}X`
      }
      speedWidth = this.ctx.measureText(speedText).width
      if (speed < 0) {
        spacingValues.push(6, arrowWidth, 3, speedWidth, 6)
        spacingItems.push(null, '<', null, speedText, null)
      } else {
        spacingValues.push(6, speedWidth, 3, arrowWidth, 6)
        spacingItems.push(null, speedText, null, '>', null)
      }
    }
    let spacing = 0
    spacingValues.forEach(value => spacing += value)

    let currPos = this.nSliderXPos - (spacing / 2)
    this.ctx.fillStyle = palette.d0
    this.ctx.fillRect(currPos, indicatorLabelStart, spacing, indicatorLabelHeight)
    let halfArrowHeight = arrowWidth / 2
    for (let i = 0; i < spacingValues.length; i++) {
      switch (spacingItems[i]) {
        case null:
          break
        case '<':
          this.drawTriangle(currPos, indicatorLabelHeight / 2,
                            arrowWidth, -halfArrowHeight,
                            arrowWidth, halfArrowHeight,
                            1, this.ctx.strokeStyle)
          break
        case '>':
          this.drawTriangle(currPos + arrowWidth, indicatorLabelHeight / 2,
                            -arrowWidth, -halfArrowHeight,
                            -arrowWidth, halfArrowHeight,
                            1, this.ctx.strokeStyle)
          break
        default:
          this.ctx.fillStyle = palette.status_a
          this.ctx.fillText(spacingItems[i], currPos, indicatorLabelHeight - roomForDescenders)
      }
      currPos += spacingValues[i]
    }
  }

  handleClickEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    let posY = e.clientY - e.currentTarget.getBoundingClientRect().top
    if (posY < tickBoxTop) { return }
    let posX = e.clientX - e.currentTarget.getBoundingClientRect().left
    // logs.TIMELINE.info('clickEvent blockClickEvent: ' + this.blockClickEvent)
    if (!this.blockClickEvent) {
      let clickTime = this.GetNextPrevTimeAt(posX)
      let now = new Date()
      if (clickTime.base.getTime() > now.getTime()) {
        clickTime.base.setTime(now.getTime())
      }
      this.camera.requestNewSession(clickTime.base)
      this.paintEvent()
    }
    this.blockClickEvent = false
  }

  mouseFilter(e: React.MouseEvent<HTMLCanvasElement>, handler: (posx, posy, buttons?) => void) {
    let posX = e.clientX - e.currentTarget.getBoundingClientRect().left
    let posY = e.clientY - e.currentTarget.getBoundingClientRect().top
    handler(posX, posY, e.buttons)
  }

  mouseHoverEvent(e: React.MouseEvent<HTMLCanvasElement>) {
    this.mouseFilter(e, this.mouseHoverXY)
  }

  mouseHoverXY = (posX: number, posY: number) => {
    const markTop = fillClipsStart + 1
    if (posY < markTop) {
      this.camera.bookmarkEngine.clearDisplayingBookmark()
      return
    }
    const hoverBookmark = this.camera.bookmarkEngine.getBookmarks(false).find(bookmark => {
        const positions = this.bookmarkPos(bookmark)
        return ((positions[0] <= posX) && (posX <= positions[2]))
    }) as Bookmark
    if (hoverBookmark) {
      this.camera.bookmarkEngine.displayingBookmark(hoverBookmark)
    } else {
      this.camera.bookmarkEngine.clearDisplayingBookmark()
    }
  }

  mouseDragEvent(e: React.MouseEvent<HTMLCanvasElement>) {
    let posY = e.clientY - e.currentTarget.getBoundingClientRect().top
    if (posY < tickBoxTop) { return }
    let posX = e.clientX - e.currentTarget.getBoundingClientRect().left
    if (e.buttons === 1) {
      // logs.TIMELINE.info('mouseMoveEvent posX: ' + posX)

      if (this.nScrollDelaySteps <= 0) {
        this.scrollTimer.start(40)
        this.nScrollOffsetBase = posX
        this.nScrollOffsetInterval = this.SecPerPxFloat
        this.nScrollOffset = 0
        this.dragZoom = e.shiftKey
      } else {
        if (this.dragZoom) {
          const origDistance = this.nSliderXPos - this.nScrollOffsetBase
          const newDistance = this.nSliderXPos - posX
          this.zoomToInterval(this.nScrollOffsetInterval / newDistance * origDistance )
        } else {
          this.nScrollOffset = this.nScrollOffsetBase - posX
          let livePos = this.getOffsetPosFromDate(new Date())
          if (this.nSliderXPos > livePos) {
            let tooFar = Math.floor(this.nSliderXPos - livePos)
            this.nScrollOffsetBase -= tooFar
            this.nScrollOffset = this.nScrollOffsetBase - posX
          }
        }
      }
      this.nScrollDelaySteps = 10
      this.paintEvent()
    }
  }

  getOffsetPosFromDate(date: Date) {
    return this.GetPosFromTime(new EnhancedDate(date)) - this.nScrollOffset
  }

  getOffsetTimeFromPos(pos = 0) {
    return this.GetNextPrevTimeAt(pos + this.nScrollOffset)
  }

  scrollView() {
    this.nScrollDelaySteps--
    // Decide that this is a timeline move, rather that a mouse event in a click
    if (Math.abs(this.nScrollOffset) > 3 || (this.nScrollDelaySteps < 5)) {
      this.blockClickEvent = true
    }
    if (this.nScrollDelaySteps <= 0) {
      this.scrollTimer.stop()
      if (!this.dragZoom) {
        this.setSliderPos(this.nScrollOffset + this.nSliderXPos, false)
        this.camera.requestNewSession(this.DisplaySliderTime.base)
      }
      this.nScrollOffset = 0
    }
  }

  updateTimerInterval() {
    // We might only need to do this
    this.setMSecPerPx()
  }

  GetNextPrevTimeAt(xPos: number): EnhancedDate {
    let msecs = (xPos - this.nSliderXPos) * this.MSecPerPx
    let selected = this.DisplaySliderTime.addMSecs( msecs )
    return selected.forceInRange(this.dtMinQT, this.dtMaxQt)
  }

  GetPosFromTime(utc: EnhancedDate) {
    if (utc < this.timeDeepPast) {return -2500}
    if (utc > this.timeDeepFuture) {return 5000}
    if (this.MSecPerPx > 400000) {
      let secsFromSelect = this.DisplayStartTime.secsTo(utc)
      return secsFromSelect / (this.MSecPerPx / 1000)
    }

    let msecsFromSelect = this.DisplayStartTime.msecsTo(utc)
    return msecsFromSelect / this.MSecPerPx
  }

  zoomZoom(zoomDir) {
    let factor = zoomDir * 0.01
    this.zoomToInterval(this.SecPerPxFloat *= factor)
  }

  zoomToInterval(newInterval) {
    newInterval = Math.max(newInterval, 0.4)
    newInterval = Math.min(newInterval, SECONDS_PER_DAY * 5.0)
    this.SecPerPxFloat = newInterval
    this.updateTimerInterval()

    // Adjust the start time
    this.DisplayStartTime = this.GetNextPrevTimeAt(0)
    this.paintEvent()
  }

  setPosFromTime(sliderTime: Date) {
    this.DisplaySliderTime = new EnhancedDate(sliderTime)
    this.DisplayStartTime = this.GetNextPrevTimeAt(0)
  }

  setSliderPos(newPos: number, bUpdate: boolean): boolean {
    let bInRange = false
    // Calculate the selected time
    this.DisplaySliderTime = this.GetNextPrevTimeAt(newPos)
    if (this.DisplaySliderTime < this.MinSliderTime) {
      this.DisplaySliderTime = new EnhancedDate(this.MinSliderTime)
    } else if (this.DisplaySliderTime > this.MaxSliderTime) {
      this.DisplaySliderTime = new EnhancedDate(this.MaxSliderTime)
    } else {
      bInRange = true
    }

    // If the new position wasn't simply a move...
    // (currently, almost always a move)
    if (!bInRange || newPos !== this.nSliderXPos) {
      // Adjust the start time
      this.DisplayStartTime = this.GetNextPrevTimeAt(0)
    }

    if (bUpdate) {
      this.paintEvent()
    }

    return bInRange
  }

  setMSecPerPx() {
    this.MSecPerPx = Math.floor((this.SecPerPxFloat * 1000))
  }

  makeShortCaption(t: EnhancedDate, tscale: TIMESCALE) {
    if (this.shortCaptions[tscale][t.getUnit(tscale)]) {
      return this.shortCaptions[tscale][t.getUnit(tscale)]
    }
    let caption = ''
    let options: Intl.DateTimeFormatOptions = {}
    switch (tscale) {
      case TIMESCALE.YEARS:
        options.year = 'numeric'
        break

      case TIMESCALE.MONTHS:
        options.month = 'short'
        break

      case TIMESCALE.DAYS:
        options.day = 'numeric'
        break

      case TIMESCALE.HOURS:
        options.hour = '2-digit'
        options.hour12 = true
        break

      case TIMESCALE.MINUTES:
        options.minute = '2-digit'
        break

      case TIMESCALE.SECONDS:
        options.second = '2-digit'
        break

      default:
        break
    }

    caption = t.base.toLocaleString('en-US', options)
    if (tscale === TIMESCALE.HOURS) {
      caption = caption.toLocaleLowerCase()
    }
    logs.TIMELINE.trace(`new caption (tscale[${tscale}], units[${t.getUnit(tscale)}], caption[${caption}])` )
    this.shortCaptions[tscale][t.getUnit(tscale)] = caption
    return caption
  }

  makeCaption(t: EnhancedDate, tscale: TIMESCALE, tsize: TIMEDISPLAYSIZE) {
    let caption = this.makeShortCaption(t, tscale)
    if (tsize <= TIMEDISPLAYSIZE.SHORT) {return caption}
    let options: Intl.DateTimeFormatOptions = {}

    // Removed fix WS5000-2832 japanese date format. May be needed
    switch (tscale) {
      default:
      case TIMESCALE.YEARS:
      case TIMESCALE.MINUTES:
      case TIMESCALE.SECONDS:
      case TIMESCALE.HOURS:
        break

      case TIMESCALE.MONTHS:
          caption = caption + ' ' + this.makeShortCaption(t, TIMESCALE.YEARS)
        break

      case TIMESCALE.DAYS:
          options.weekday = 'short'
          caption = t.base.toLocaleString('en-US', options) + ' ' + caption
        break
    }

    if (tsize <= TIMEDISPLAYSIZE.MEDIUM) {return caption}

    options = {}
    switch (tscale) {
      default:
      case TIMESCALE.YEARS:
      case TIMESCALE.MONTHS:
        break

      case TIMESCALE.DAYS:
        options.weekday = 'short'
        return t.base.toLocaleString('en-US', options) + ' ' +
                this.makeShortCaption(t, TIMESCALE.MONTHS) + ' ' +
                this.makeShortCaption(t, tscale)

      case TIMESCALE.SECONDS:
        options.second = '2-digit'
      case TIMESCALE.MINUTES:
        options.minute = '2-digit'
      case TIMESCALE.HOURS:
        options.hour = '2-digit'
        options.hour12 = true
        return t.base.toLocaleString('en-US', options).toLocaleLowerCase()
    }

    return caption
  }

  getRecordTypeColor(recType: RECORDTYPE) {
    switch (recType) {
      default: return palette.d0
      case RECORDTYPE.CONTINUOUS:
        return palette.status_a
      case RECORDTYPE.MOTION:
        return palette.active_c1
      case RECORDTYPE.ALARM:
        return palette.alert_c1
      case RECORDTYPE.MANUAL:
        return palette.warn_a
      case RECORDTYPE.ANALYTIC:
        return palette.actstat_a
    }
  }

  handlers() {
    return {
      onClick: this.handlerWrapper(this.handleClickEvent),
      onMouseDown: this.handlerWrapper(this.handleMouseDown),
      onMouseUp: this.handlerWrapper(this.handleMouseUp),
      onMouseLeave: this.handlerWrapper(this.handleMouseLeave),
      onWheel: this.handlerWrapper(this.handleOnWheel),
      onMouseMove: this.handlerWrapper(this.handleMouseMove),
    }
  }

  handlerWrapper( method: (event: React.MouseEvent<HTMLCanvasElement>) => void ) {
    return (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault()
      if (this.camera.connected) { method(event) }
    }
  }

  handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    this.mouseDown = true
  }

  handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    this.mouseDown = false
  }

  handleMouseLeave = (event: React.MouseEvent<HTMLCanvasElement>) => {
    this.mouseDown = false
    this.camera.bookmarkEngine.clearDisplayingBookmark()
  }

  handleOnWheel = (event) => {
    this.zoomZoom(event.deltaY  < 0 ? 90 : 111)
  }

  handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (this.mouseDown) {
      this.mouseDragEvent(event)
    } else {
      this.mouseHoverEvent(event)
    }
  }
}
