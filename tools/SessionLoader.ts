// Run using ts-node

import Serenity, { DataSessionSettings } from '../src/serenity'
import {MSECONDS_PER_HOUR} from '../src/util/constants'
import {BASE_URL} from '../src/util/constants'


// tslint:disable:no-console
class SessionLoader {
  serenity: Serenity
  async getData(session) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    let sessionData = await this.serenity.dataSessionData(session)
    console.log(sessionData.data ? sessionData.data.length : sessionData.code)
    console.log(sessionData.timestamp)
    return sessionData
  }
  async doStuff() {
    this.serenity = new Serenity()
    const system = await this.serenity.login(BASE_URL, 'admin', 'pel2899100')
    let dataSources = await system.getDataSources()
    let dataSource = dataSources.data_sources.find(ds => ds.name.startsWith('D5118'))
    const mjpegDataInterface = dataSource.data_interfaces.find(di => di.protocol === 'mjpeg-pull')
    let sessionInfo = await this.serenity.dataSession(mjpegDataInterface._links['/pelco/rel/endpoint'], {})
    console.log(sessionInfo)
    let sessionData = await this.getData(sessionInfo.session)
    sessionData = await this.getData(sessionData.session)
    sessionData = await this.getData(sessionData.session)
    let settings: DataSessionSettings = {}
    let earlier = new Date((new Date()).getTime() - MSECONDS_PER_HOUR)
    settings.time = earlier.toISOString()
    let patchData = await this.serenity.dataSessionPatch(sessionData.session, settings)
    console.log(`Patch code: ${patchData.settings}`)
    sessionData = await this.getData(patchData.session)
    console.log(`Session code: ${sessionData.code}`)
    settings = {}
    settings.time = null
    patchData = await this.serenity.dataSessionPatch(sessionData.session, settings)
    console.log(`Patch code: ${patchData.settings}`)
    sessionData = await this.getData(patchData.session)
    console.log(`Session code: ${sessionData.code}`)
  }
}

if (require.main === module) {
  let c = new SessionLoader()
  c.doStuff()
}
