import { Events } from './resources'
import {expect} from 'chai'

const mockSerenity = null

function makeEventsData(totalCount: number, pageSize: number, remaining: number = totalCount) {
  const eventsArray = []
  for (; remaining > 0 && eventsArray.length < pageSize; remaining--) {
    eventsArray.push({id: '' + remaining})
  }
  const events =  Events.create({
    collection_header: {
      total_items: totalCount,
    },
    events: eventsArray,
  }, mockSerenity)

  if (remaining > 0) {
    events.getNext = (params?: any) => { return Promise.resolve(makeEventsData(totalCount, pageSize, remaining)) }
  }

  return events
}

describe('makeEventsData', () => {
  it ('generates two pages', async () => {
    const events1 = makeEventsData(3, 2)
    expect(events1.events).to.have.length(2)
    const events2 = await events1.getNext()
    expect(events2.events).to.have.length(1)
  })
})

describe('forEachX', () => {
  it('iterates all results from one page', async () => {
    const events = makeEventsData(2, 2)
    const ids = []
    await events.forEachEvent(e => ids.push(e.id))
    expect(ids).to.deep.equal(['2', '1'])
  })

  it('iterates all results from two pages', async () => {
    const events = makeEventsData(3, 2)
    const ids = []
    await events.forEachEvent(e => ids.push(e.id))
    expect(ids).to.deep.equal(['3', '2', '1'])
  })
})

describe('getAllX', () => {
  it('collects all results from one page', async () => {
    const events = makeEventsData(2, 2)
    const allEvents = await events.getAllEvents()
    const ids = allEvents.map(e => e.id)
    expect(ids).to.deep.equal(['2', '1'])
  })

  it('collects all results from two pages', async () => {
    const events = makeEventsData(3, 2)
    const allEvents = await events.getAllEvents()
    const ids = allEvents.map(e => e.id)
    expect(ids).to.deep.equal(['3', '2', '1'])
  })
})
