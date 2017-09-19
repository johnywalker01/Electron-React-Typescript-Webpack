import * as loglevel from 'loglevel'

export class Logs {
  ROOT = loglevel

  BOOKMARK_LIST = loglevel.getLogger('BOOKMARK_LIST')
  BUILD = loglevel.getLogger('BUILD')
  CELLS = loglevel.getLogger('CELLS')
  COMPONENTS = loglevel.getLogger('COMPONENTS')
  DEV_SERVER = loglevel.getLogger('DEV_SERVER')
  EVENTS = loglevel.getLogger('EVENTS')
  I18N = loglevel.getLogger('I18N')
  SERENITY = loglevel.getLogger('SERENITY')
  SESSION = loglevel.getLogger('SESSION')
  SOURCE_LIST = loglevel.getLogger('SOURCE_LIST')
  STATE = loglevel.getLogger('STATE')
  TABS = loglevel.getLogger('TABS')
  TEST = loglevel.getLogger('TEST')
  TIMELINE = loglevel.getLogger('TIMELINE')
  VIDEO = loglevel.getLogger('VIDEO')

}

const logs = new Logs()

export function initializeDefaultLogLevels() {
  logs.ROOT.setLevel('info')
  logs.ROOT.info('Setting default log levels')

  logs.BOOKMARK_LIST.setLevel('debug')
  logs.BUILD.setLevel('debug')
  logs.CELLS.setLevel('info')
  logs.COMPONENTS.setLevel('info')
  logs.DEV_SERVER.setLevel('info')
  logs.EVENTS.setLevel('info')
  logs.I18N.setLevel('info')
  logs.SERENITY.setLevel('info')
  logs.SESSION.setLevel('info')
  logs.SOURCE_LIST.setLevel('debug')
  logs.STATE.setLevel('debug')
  logs.TABS.setLevel('debug')
  logs.TEST.setLevel('debug')
  logs.TIMELINE.setLevel('debug')
  logs.VIDEO.setLevel('info')
}

export function initializeTestLogLevels() {
  initializeDefaultLogLevels()
}

export default logs
