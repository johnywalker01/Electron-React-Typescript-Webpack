// tslint:disable:no-console
import * as yargs from 'yargs'

import Serenity from '../src/serenity'
import UrlParser from './tycli/UrlParser'

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
    command: ['change <new-password>', '* <new-password>'],
    describe: 'Change the password',
    handler: change,
  })
  .help()
  .argv

async function change(args: {url: string, newPassword: string}) {
  try {
    urlParser.parse(args.url)
    try {
      await serenity.login(urlParser.url, urlParser.username, urlParser.password)
    } catch (loginError) {
      // ignore
    }
    await serenity.changePassword(urlParser.password, args.newPassword)
    console.log('New password changed to', args.newPassword)
  } catch (err) {
    console.error(err)
  }
}
