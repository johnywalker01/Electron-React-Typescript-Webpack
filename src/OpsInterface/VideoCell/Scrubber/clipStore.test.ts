import {assert} from 'chai'
import { Clip } from 'src/serenity/resources'
import { RecordType } from 'src/serenity/primitives'
import {MSECONDS_PER_HOUR} from '../../../util/constants'
import {IntervalSet} from './clipStore'

function makeClip(start: Date, end: Date, event?: RecordType): Clip {
  let clip = {
    data_source_id: '',
    event: 'manual',
    start_time: new Date('2017-01-01T00:00:00.000Z'),
    end_time: new Date('2017-01-02T00:00:00.000Z'),
  }
  if (event) {clip.event = event}
  if (start) {clip.start_time = start}
  if (end) {clip.end_time = end}
  return <Clip> clip
}

describe('IntervalSet', () => {
  it('exercise', function() {
    let set = new IntervalSet('')
    assert.equal(set.readyToLoad, false)
    set.startLoading()
    assert.equal(set.readyToLoad, true)
    assert.equal(set.hasPendingRequest, false)
    let filter = set.getNextFilter()
    assert.equal(set.hasPendingRequest, true)
    assert.isDefined(filter)
    assert.isDefined(filter.search_start_time)
    let start = new Date(filter.search_start_time)
    assert.isDefined(start)
    assert.isAtMost(start.getTime(), (new Date()).getTime()  - (12 * MSECONDS_PER_HOUR))
    let clips = []
    for (let i = 0; i < 1000; i++) {
      let currTime = i + 10
      clips.push(makeClip(new Date(currTime), new Date(currTime + 2)))
    }
    set.processResponse(filter, clips)
    assert.equal(set.hasPendingRequest, false)
    assert.equal(set.count, 0)
    while (set.clipsToProcess.length) {
      let oldCount = set.clipsToProcess.length
      set.processClip()
      assert.isAbove(oldCount, set.clipsToProcess.length)
    }
  })

})
