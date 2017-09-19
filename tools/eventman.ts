import * as yargs from 'yargs'

import Serenity from '../src/serenity'
import { NewEventData } from '../src/serenity/resources'
import { SituationType } from '../src/serenity/situations'
import UrlParser from './tycli/UrlParser'

// tslint:disable:no-console

const serenity = new Serenity()
const urlParser = new UrlParser()

yargs
  .demandCommand(1, 'Missing command')
  .option('url', {
    description: 'The base url of the REST API including username and password',
    alias: 'u',
    global: true,
    default: 'http://admin:pel2899100@localhost:9091',
  })
  .command({
    command: ['list [count]', '*'],
    describe: 'List all events',
    handler: list,
  })
  .command({
    command: 'banner [count]',
    describe: 'List all events appropriate for a banner',
    handler: banner,
  })
  .command({
    command: 'send <situation-type> [count]',
    describe: 'Send a new event with the given situation type',
    handler: send,
  })
  .help()
  .argv

interface Args {
  url: string
}

async function list(args: Args & {count: number}) {
  await _list(args)
}

async function banner(args: Args & {count: number}) {
  await _list({...args, notifies: true, ack_state: 'ack_needed'})
}

async function _list(args: Args & {count: number, ack_state?: 'ack_needed', notifies?: true}) {
  try {
    urlParser.parse(args.url)
    let currentCount = 0
    let count = args.count || 20
    const pageSize = 10
    const system = await serenity.login(urlParser.url, urlParser.username, urlParser.password)
    let events = await system.getEvents({...args, count: pageSize})
    await events.forEachEvent(e => {
      console.log(`[${e.severity}] ${e.situation_type} ${e.time.toISOString()}`
        + ` ${e.ack_state}@${e.ack_time} (dsid: ${e.properties.data_source_id})`)
      if (++currentCount >= count) {
        throw new Error('Done')
      }
    })
  } catch (err) {
    if (err.message !== 'Done') {
      console.error(err)
    }
  }
}

async function send(args: Args & {situationType: SituationType, count: number}) {
  try {
    urlParser.parse(args.url)
    const system = await serenity.login(urlParser.url, urlParser.username, urlParser.password)

    const dataSources = await system.getDataSources({sort: 'name-asc'})
    const firstDataSourceId = dataSources.data_sources.find(it => true).id

    const events = await system.getEvents()

    const count = args.count || 1

    let addEventPromises = []

    for (let i = 0; i < count; i++) {
      const newEvent: NewEventData = {
        situation_type: args.situationType,
        source_device_id: 'eventman',
        time: new Date(),
        properties: {
          'Created': 'By eventman script',
          'data_source_id': firstDataSourceId,
        },
      }

      addEventPromises.push(events.postAddEvent(newEvent))
    }

    await Promise.all(addEventPromises)

    console.log('Sent', count, args.situationType, 'events')
  } catch (err) {
    console.error(err)
  }
}
