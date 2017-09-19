import AppState from '../../../src/AppState'
import { Logs } from '../../../src/util/logs'

declare global {
  interface BrowserInfo {
    name: string
    version: number
  }
  interface Window {
    appState: AppState
    logs: Logs
    browserInfo: BrowserInfo
  }
}
