import { CInterval, RECORDTYPE } from './interval'
import { TaskClock } from 'src/util/TaskClock'
import { DataSource } from 'src/serenity/resources'
import { ClipsFilter } from '../../../serenity/index'
import { Clip } from 'src/serenity/resources'
import { MSECONDS_PER_HOUR, MSECONDS_PER_SECOND, MSECONDS_PER_MINUTE } from '../../../util/constants'
import logs from '../../../util/logs'

export class IntervalSet {
  heads: CInterval[]
  count = 0
  readyToLoad = false
  hasPendingRequest = false
  sentPendingRequest: Date
  foundOldestClip = false
  includeStartTime = true
  source: DataSource
  clipsToProcess: Clip[]
  clipFilterStartTime: Date
  clipFilterEndTime: Date
  clipRange: ClipsFilter = {}

  constructor(source) {
    this.source = source
    this.heads = new Array<CInterval>(RECORDTYPE.MAX)
    for (let i = 0; i < RECORDTYPE.MAX; i++) {
      this.heads[i] = null
    }
    this.clipsToProcess = new Array()
  }

  AddRecordInterval(pInterval: CInterval) {
    let recType = pInterval.type
    pInterval.AddNext(this.heads[recType])
    if (pInterval.bAddHead) {
      this.heads[recType] = pInterval
    }
    this.count++
  }
  GetIntervalHead(category: number) { return this.heads[category] }

  startLoading() {
    if (this.count === 0) {
      this.clipFilterEndTime = new Date()
      this.clipFilterStartTime = new Date()
      this.readyToLoad = true
    }
  }

  processResponse(filter: ClipsFilter, clips: Clip[]) {
    if (clips.length) {
      // add response data to clip queue
      logs.TIMELINE.trace(`clipStore response source[${this.source.name}] # of clips[${clips.length}]`)
      this.clipsToProcess = this.clipsToProcess.concat(clips)
    } else {
      // if request was for old clips (had end_time)
      if (filter.search_end_time) {
        // don't include start_time on next request for old clips
        this.includeStartTime = false
      }
    }

    // if no start_time specified
    if (!filter.search_start_time) {
      // we have received the oldest clip, don't try to get older clips
      this.foundOldestClip = true
    }

    // remove pending request
    this.hasPendingRequest = false
  }

  processClip() {
    let clip = this.clipsToProcess.pop()
    if (clip) {this.AddRecordInterval(new CInterval(clip))}
  }

  getNextFilter() {
    let now = new Date()
    let filter: ClipsFilter
    let startTime: Date
    let endTime: Date
    // if there has never been a request
    if (!this.sentPendingRequest) {
      // make request for last 12h
      startTime = new Date(now.getTime() - (12 * MSECONDS_PER_HOUR))
      filter = {search_start_time: startTime.toISOString()}
    // else if no clips covering last 30 seconds
    } else if ((now.getTime() - this.clipFilterEndTime.getTime()) > (30 * MSECONDS_PER_SECOND)) {
      // make request for latest 10m (no end_time)
      startTime = new Date(now.getTime() - (10 * MSECONDS_PER_MINUTE))
      filter = {search_start_time: startTime.toISOString()}
    // else if need older clips
    } else if (!this.foundOldestClip) {
      endTime = new Date(this.clipFilterStartTime.getTime() + (10 * MSECONDS_PER_MINUTE))
      filter = {search_end_time: endTime.toISOString()}
      // if we are still getting results
      if (this.includeStartTime) {
        // make request for 12h window before last old request (with slight overlap)
        startTime = new Date(endTime.getTime() - (12 * MSECONDS_PER_HOUR))
        filter.search_start_time = startTime.toISOString()
      }
      // else make request for all old clips (no start_time)
    }
    if (filter) {
      // remember pending request 
      this.hasPendingRequest = true
      this.sentPendingRequest = new Date()
      if (!endTime) {this.clipFilterEndTime = now}
    }
    if (startTime && (startTime < this.clipFilterStartTime)) {this.clipFilterStartTime = startTime}
    return filter
  }

  getClip(time: Date) {
    for (let recType = 0; recType < RECORDTYPE.MAX; recType++) {
      let pInterval = this.GetIntervalHead(recType)
      if (!pInterval) {continue}
      pInterval = pInterval.FirstSegLevelOwner(0, time)
      if (!pInterval) {continue}
      pInterval = pInterval.SegLevelOwner(0)
      if (!pInterval) {continue}
      pInterval = pInterval.pSegBegins[0]
      if (!pInterval) {continue}
      while (pInterval) {
        if (pInterval.startTimeUTC <= time && time <= pInterval.endTimeUTC) {
          return pInterval.clip
        }
        pInterval = pInterval.pNext
      }
    }
    return null
  }
}

class ClipResponse {
  constructor(public intervalSet: IntervalSet, public filter: ClipsFilter, public clips: Clip[]) {}
  process() {
    this.intervalSet.processResponse(this.filter, this.clips)
  }
}

export default class ClipStore {
  intervalSets: Map<string, IntervalSet>
  timer: TaskClock
  responses: Array<ClipResponse>

  constructor() {
    this.responses = new Array()
    this.intervalSets = new Map()
    this.timer = new TaskClock(() => {this.clipTick()})
  }

  get(source: DataSource) {
    let intervalSet = this.intervalSets.get(source.id)
    if (!intervalSet) {
      intervalSet = new IntervalSet(source)
      this.intervalSets.set(source.id, new IntervalSet(source))
    }
    intervalSet.startLoading()
    this.timer.start(50)
    return intervalSet
  }

  getReadySet(): IntervalSet {
    let intervals = Array.from(this.intervalSets.values()).filter(interval => interval.source.getClips)
    let readySets = intervals.filter(interval => interval.clipsToProcess.length)
    if (readySets.length === 0) {
      readySets = intervals.filter(interval => !interval.hasPendingRequest && interval.readyToLoad)
    }
    if (readySets.length > 0) {return readySets[Math.floor(Math.random() * readySets.length)]}
  }

  clipTick() {
    // if response
    while (this.responses.length) {
      let response = this.responses.pop()
      response.process()
    }
    // if pending request and it has been too long
      // forget it so you can send another

    let readySet = this.getReadySet()
    // if a set needs something done
    if (readySet) {
      // if we have clips to process
      if (readySet.clipsToProcess.length) {
        // while our time since the last tick is what we requested
        logs.TIMELINE.trace(`clipStore: this.timer.late()[${this.timer.late()}]`)
        while (readySet.clipsToProcess.length && (this.timer.late() < 1)) {
          // process clips
          readySet.processClip()
        }
        // if our time since the last tick is almost what we requested
        if (readySet.clipsToProcess.length && (this.timer.late() < 2)) {
          // process 1 clip
          readySet.processClip()
        }
        // else
          // get it when we are less busy
      // else if an interval has no pending request
      } else {
        let filter = readySet.getNextFilter()
        if (filter) {
          logs.TIMELINE.trace(`clipStore request filter:`)
          logs.TIMELINE.trace(filter)
          readySet.source.getClips(filter).then((clips) => {
            let response: ClipResponse = new ClipResponse(readySet, filter, clips.clips)
            this.responses.push(response)
          })
        }
      }
    }
    this.timer.updateTargetTime()
  }
}
