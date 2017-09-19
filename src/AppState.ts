import Axios from 'axios'
import { action, runInAction, observable, ObservableMap } from 'mobx'

import Serenity from './serenity'
import { DataSourceBox } from './util/DataSourceBox'
import logs from './util/logs'
import ClipStore from './OpsInterface/VideoCell/Scrubber/clipStore'
import { deleteCookie } from './util/cookie'
import BookmarkEngine from 'src/util/BookmarkEngine'
import { ViewsTabState } from 'src/OpsInterface/model'
import { Bookmark, Tag } from 'src/serenity/resources'
import {EventListPopupEngine} from 'src/OpsInterface/Sidebar/Events/EventListPopupEngine'
import {SituationsEngine} from 'src/OpsInterface/Sidebar/Events/SituationsEngine'

export default class AppState {
  @observable username: string = null
  @observable password: string = null
  @observable serverIp: string = null
  @observable isAdminRole: boolean = false
  @observable version: string = null
  @observable showAuthFailedDialog: boolean = false
  @observable dataSourceMap: ObservableMap<DataSourceBox> = new ObservableMap<DataSourceBox>()
  @observable bookmarkMap: ObservableMap<Bookmark> = new ObservableMap<Bookmark>()
  @observable tags: Array<Tag>
  serenity: Serenity = new Serenity()
  clipStore: ClipStore
  viewsTabState: ViewsTabState = null
  eventListPopupEngine: EventListPopupEngine = new EventListPopupEngine(this.serenity, this.dataSourceMap)
  situationsEngine: SituationsEngine = new SituationsEngine(this.serenity)

  constructor() {
    Axios.get('version')
      .then((response) => {
        const data: {version: string} = response.data
        this.version = data.version
        logs.STATE.info('Detected portal version: ', this.version)
      })
      .catch((error) => {
        logs.STATE.warn('Unable to detect portal version', error)
      })
  }

  @action
  async login(username: string, password: string, serverIp:string) {
    logs.SESSION.debug(`Logging in ${username}/${password.replace(/./g, '*')}`)

    this.serenity
      .onAuthFailure(this.sessionExpired)

    this.clipStore = new ClipStore()

    // appends server with http protocol and port id
    serverIp = 'http://' + serverIp + ':9091'
    await this.serenity.login(serverIp, username, password)
    this.username = username
    this.password = password
    this.serverIp = serverIp

    const system = await this.serenity.system()
    let user = await system.getUser({embed: {'/pelco/rel/roles': {}}})
    let embeddedRoles = user._embedded && user._embedded['/pelco/rel/roles']
    this.isAdminRole = embeddedRoles && embeddedRoles.roles.some(role => role.name === 'administrator')

    // Propably using a cookie if username isn't provided, then get name from the user call.
    if (!username) {
      this.username = user.name
    }

    this.updateDataSources(null)
    this.updateBookmarks(null)
    BookmarkEngine.startListeningForNotifications(this)

    this.situationsEngine = new SituationsEngine(this.serenity)
    this.situationsEngine.refresh()

    this.eventListPopupEngine = new EventListPopupEngine(this.serenity, this.dataSourceMap)
    this.eventListPopupEngine.initialize()
  }

  @action
  sessionExpired = () => {
    logs.SESSION.info('Auth failure during session')
    this.showAuthFailedDialog = true
    this.logout()
  }

  @action
  logout() {
    logs.SESSION.debug('Logging out')
    this.username = null
    this.password = null
    deleteCookie('auth_token')
  }

  @action
  updateDataSources = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.stopPropagation()
    }

    logs.SOURCE_LIST.debug('Refreshing source list')
    const system = await this.serenity.system()
    const dataSources = await system.getDataSources()

    runInAction('update dataSources', () => {
      logs.SOURCE_LIST.debug('DataSources', dataSources)

      const newDataSourceIds = new Set<String>()

      dataSources.data_sources.forEach(dataSource => {
        dataSource.data_interfaces.forEach(dataInterface => {
          if (dataInterface.protocol === 'mjpeg-pull') {
            newDataSourceIds.add(dataSource.id)
            let box = this.dataSourceMap.get(dataSource.id)
            if (box) {
              box.source = dataSource
            } else {
              box = new DataSourceBox(dataSource, this.serenity, this.clipStore)
              this.dataSourceMap.set(dataSource.id, box)
            }
          }
        })
      })

      // Remove data sources that are now absent
      this.dataSourceMap.keys().forEach(dataSourceId => {
        if (!newDataSourceIds.has(dataSourceId)) {
          this.dataSourceMap.delete(dataSourceId)
        }
      })
      this.dataSourceMap.forEach(box => box.clearTags())
    })

    const tags = await system.getTags({embed: {'/pelco/rel/resources': {}}})
    this.tags = observable(tags.tags)
    runInAction('update tags', () => {
      // console.log(tags)
      logs.SOURCE_LIST.debug('Tags', tags)
      tags.tags.forEach(async tag => {
        let resources = tag._embedded['/pelco/rel/resources']
        // if (!resources) = await tag.getResources()
        resources.resources.forEach((dataSource) => {
          let box = this.dataSourceMap.get(dataSource.id)
          if (box) { box.tags.push(tag) }
        })
      })
    })

  }

  @action
  updateBookmarkList = async (bookmarkList) => {
    bookmarkList.forEach(action((bookmark: Bookmark) => {
      this.bookmarkMap.set(bookmark.id, bookmark)
    }))
  }

  updateBookmarks = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.stopPropagation()
    }

    logs.BOOKMARK_LIST.debug('Refreshing bookmark list')
    this.bookmarkMap.clear()
    const system = await this.serenity.system()
    let bookmarks = await system.getBookmarks({count: 250})
    this.updateBookmarkList(bookmarks.bookmarks)
    while (bookmarks.getNext) {
      bookmarks = await bookmarks.getNext()
      this.updateBookmarkList(bookmarks.bookmarks)
    }
  }
}
