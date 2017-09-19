import * as React from 'react'
import { observer } from 'mobx-react'
import { css } from 'aphrodite/no-important'

import AppState from './AppState'
import LoginScreen from './LoginScreen'
import OpsInterface from './OpsInterface'
import standardStyles from './util/standard-styles'

/**
 * Top-level component that is rendered to the div with id=app in index.html
 */
@observer
export default class App extends React.Component<{ appState: AppState }, {}> {
  constructor() {
    super()
  }

  render() {
    return <div id='App' className={css(standardStyles.flexVertical)}>
      {
        (this.props.appState.showAuthFailedDialog || this.props.appState.username == null)
          ? <LoginScreen appState={this.props.appState} />
          : <OpsInterface appState={this.props.appState} />
      }
    </div>
  }
};
