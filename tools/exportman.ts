import Serenity from 'src/serenity'
import * as yargs from 'yargs'

import { Export, NewExportData } from '../src/serenity/resources'
import { EnhancedDate } from '../src/util/EnhancedDate'
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
    describe: 'List all exports',
    handler: list,
  }, )
  .command({
    command: 'clear',
    describe: 'Clear all exports',
    handler: clear,
  })
  .command({
    command: 'create',
    describe: 'Create a new export',
    builder: {
      id: {
        describe: 'ID of DataSource for which to create the export',
      },
      seconds: {
        describe: 'Duration of export',
        default: 60,
      },
      count: {
        describe: 'Number of exports to create',
        default: 1,
      },
    },
    handler: create,
  })
  .help()
  .argv

interface Args {
  url: string
}

async function list(args: Args & {count: number}) {
  try {
    urlParser.parse(args.url)
    let currentCount = 0
    let count = args.count || 20
    const pageSize = 2
    const system = await serenity.login(urlParser.url, urlParser.username, urlParser.password)
    let exports = await system.getExports({...args, count: pageSize})
    await exports.forEachExport(e => {
      printExport(e)
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

async function clear(args: Args) {
  try {
    urlParser.parse(args.url)
    const pageSize = 10
    const system = await serenity.login(urlParser.url, urlParser.username, urlParser.password)
    let exports = await system.getExports({...args, count: pageSize})
    let allExports = await exports.getAllExports()
    for (let e of allExports) {
      await e.delete()
    }
  } catch (err) {
    console.error(err)
  }
}

async function create(args: Args & {id: string, seconds: number, count: number}) {
  try {
    urlParser.parse(args.url)
    const system = await serenity.login(urlParser.url, urlParser.username, urlParser.password)

    const params: any = {sort: 'name-asc'}
    if (args.id) {
      params.id = args.id
    }

    const dataSources = await system.getDataSources(params)
    const firstDataSourceId = dataSources.data_sources.find(() => true).id

    const exports = await system.getExports()

    const count = args.count || 1

    let now = new EnhancedDate(new Date())

    let addExportPromises = []

    for (let i = 0; i < count; i++) {
      const newExportData: NewExportData = {
        format: 'application/vnd.pelco.mkvzip',
        name: 'eventman-' + i,
        export_clips: [
          {
            data_source_id: firstDataSourceId,
            start_time: now.addSecs(-5 - args.seconds).base,
            end_time: now.addSecs(-5).base,
          },
        ],
      }

      addExportPromises.push(exports.postAddExport(newExportData).then(printExport))
    }

    await Promise.all(addExportPromises)

    console.log('Created', count, 'exports for', firstDataSourceId)
  } catch (err) {
    console.error(err)
  }
}

function printExport(e: Export) {
  console.log(`${e.name} ${e.owner} ${e.status} ${e.status_reason || ''}`)
}
