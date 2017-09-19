import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import * as lodash from 'lodash'
import { LocaleProvider } from 'antd'

import { initializeDefaultLogLevels } from './util/logs'
import logs from './util/logs'

// Import resources to make webpack include them in the dist
import 'file-loader?name=[name].[ext]!./favicon.ico'
import 'file-loader?name=[name]!../version'
import '../index.less'

/** Refresh logging */
function updateLogging() {
  logs.ROOT.info('Re-initializing Logging')
  const windowLogs = <any> require('./util/logs').default
  if (window.logs == null) {
    initializeDefaultLogLevels()
  }
  window.logs = windowLogs
}

/** Refresh AppState module and set global state */
function updateAppState() {
  logs.ROOT.info('Re-initializing AppState')
  const AppState = <any> require('./AppState').default
  // window.appState = new AppState()
  window.appState = lodash.assign(new AppState(), window.appState)
}

function getLocaleProviderLocale(locale: string) {
  switch (locale) {
    case 'de':
    case 'de-DE':
      return require('antd/lib/locale-provider/de_DE')
    default:
      return require('antd/lib/locale-provider/en_US')
  }
}

/** Render the application to the DOM */
function renderApp() {
  logs.ROOT.info('Re-initializing App')
  const App = <any> require('./App').default
  const i18n = <any> require('./i18n').default

  const fullLocale = navigator.language
  const locale = fullLocale.replace(/-.*$/, '')
  const messages = i18n[locale]
  logs.ROOT.info(`Detected locale: ${fullLocale}`)
  ReactDOM.render(
    React.createElement(LocaleProvider, {locale: getLocaleProviderLocale(fullLocale)},
      React.createElement(IntlProvider as React.ComponentClass<IntlProvider.Props>, { locale, messages },
        React.createElement(App, { appState: window.appState })
    )),
    document.getElementById('app-container')
  )
}

updateLogging()
updateAppState()
renderApp()

// Setup hot reloading
interface HotNodeModule extends NodeModule {hot: any}
declare var module: HotNodeModule
if (module.hot) {
  module.hot.accept('./App', () => {
    renderApp()
  })
  module.hot.accept('./util/logs', () => {
    renderApp()
  })
  module.hot.accept('./i18n', () => {
    renderApp()
  })
  module.hot.accept('./AppState', () => {
    updateAppState()
    renderApp()
  })
}
