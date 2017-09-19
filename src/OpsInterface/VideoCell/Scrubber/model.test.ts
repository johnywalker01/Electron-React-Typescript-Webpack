import { assert } from 'chai'

import { ScrubberModel } from './model'
import ViewCamera from '../../ViewCamera'

// tslint:disable:no-string-literal

describe('ScrubberModel', () => {
  it('exercise', function() {
    let engine = {}
    engine['getBookmarks'] = function() {
      return this._bookmarks
    }
    let camera = {}
    engine['_bookmarks'] = []
    camera['bookmarkEngine'] = engine

    let bookmarkStartPoints = []
    let context = {}
    context['beginPath'] = function() {; }
    context['moveTo'] = function(x, y) {
      bookmarkStartPoints.push([x, y])
    }
    context['lineTo'] = function() {; }
    context['closePath'] = function() {; }
    context['stroke'] = function() {; }
    context['fill'] = function() {; }
    context['clientWidth'] = 1000
    let canvas = {}
    canvas['getContext'] = function(ctx: string) {
      return context
    }
    canvas['clientWidth'] = 1000

    let scrubber = new ScrubberModel(camera as ViewCamera)
    scrubber.setCanvas(canvas as HTMLCanvasElement)

    const scrubberStart = scrubber.DisplayStartTime
    const scrubberEnd = scrubber.DisplaySliderTime
    const scrubberSize = scrubberStart.secsTo(scrubberEnd)

    for (let i = 0; i < 10; i++) {
      // steps 0.05 to 0.95
      const step = 0.05 + 0.1 * i
      const odd = i % 2 === 1
      const createMockBookmark = offset => {
        return {
          time: scrubberStart.addSecs(offset).toISOString(),
          lock: {
            enabled: odd,
            start_time: scrubberStart.addSecs(offset - 5).toISOString(),
            end_time: scrubberStart.addSecs(offset + 5).toISOString(),
          },
        }
      }

      // These shouldn't be displayed since they are too early
      engine['_bookmarks'].push(createMockBookmark(scrubberSize * (step - 2)))

      // These shouldn't be displayed since they are too late
      engine['_bookmarks'].push(createMockBookmark(scrubberSize * (step + 2)))

      // These should be displayed since they are just right
      // One bookmarkStartPoint for each bookmark +
      // One bookmarkStartPoint for each locked bookmark (the odd ones)
      engine['_bookmarks'].push(createMockBookmark(scrubberSize * step))
    }

    scrubber.drawBookmarks()
    assert.equal(bookmarkStartPoints.length, 10 + 5)
  })
})
