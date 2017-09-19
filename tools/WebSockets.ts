// Run using ts-node

import Serenity from '../src/serenity'
import {NotificationRequestData} from '../src/serenity/resources'
import * as WebSocket from 'ws'
import { SituationType } from '../src/serenity/situations'
import { BASE_URL } from '../src/util/constants'

// tslint:disable:no-console
class WebSocketsScratchpad {
  serenity: Serenity
  async doStuff() {
    this.serenity = new Serenity()
    await this.serenity.login(BASE_URL, 'admin', 'pel2899100')
    let system = await this.serenity.system()
    console.log(system._links['/pelco/rel/event_wss'])
    let request: NotificationRequestData = {
      situation_types: ['admin/role_added', 'admin/role_modified', 'admin/role_removed'] as Array<SituationType>,
      user_notification: true,
    }
    let wss: string = await system.postEventWss(request, { returnLocation: true })
    console.log('ws://localhost:5280' + wss)
    console.log('Building socket')
    let socket = new WebSocket('ws://localhost:5280' + wss, {
      origin: 'http://localhost:5280',
      headers: {
        cookie: this.serenity.getCookie(),
      },
    } as WebSocket.IClientOptions)
    socket.on('open', () => { console.log('socket connected') })
    socket.on('message', (message) => {
      console.log(message.length)
      if (message.length > 3) { console.log(JSON.parse(message)) }
    })
  }
}

if (require.main === module) {
  let c = new WebSocketsScratchpad()
  c.doStuff()
}
