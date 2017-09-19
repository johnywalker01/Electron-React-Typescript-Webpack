import * as React from 'react'
import { observer } from 'mobx-react'
import AppState from '../AppState'
import ViewsTabBar from './ViewsTabBar'
import VideoCells from './VideoCells'
import Sidebar from './Sidebar'
import {ViewsTabState} from './model'
import VideoToolbar from './VideoToolbar'
import { StyleSheet, css } from 'aphrodite/no-important'
import standardStyles from '../util/standard-styles'

@observer
export default class OpsInterface extends React.Component<{ appState: AppState }, {}> {
  viewsTabState: ViewsTabState

  constructor(props) {
    super(props)
    this.viewsTabState = new ViewsTabState({
      dataSourceMap: this.props.appState.dataSourceMap,
    })
    this.viewsTabState.addTab('Tab 1', '2x2')
    this.viewsTabState.tabs[0].setVisible(true)
    this.props.appState.viewsTabState = this.viewsTabState
  }

  render() {
    const viewTab = this.viewsTabState.selected()

    return <div id='layoutContainer' className={css(standardStyles.flexOne, standardStyles.flexVertical)}>
      <ViewsTabBar appState={this.props.appState} viewsTabState={this.viewsTabState} />

      <div id='tabContent' className={css(standardStyles.flexOne, standardStyles.flexHorizontal, styles.main)}>
        <div className={css(standardStyles.flexOne, standardStyles.flexVerticalNot100Width, styles.leftSide)}>
          <VideoToolbar viewTab={viewTab} />
          <VideoCells viewTab={viewTab} />
        </div>
        <Sidebar
          appState={this.props.appState}
          viewsTabState={this.viewsTabState}
        />
      </div>
    </div>
  }
}

const styles = StyleSheet.create({
  main: {
    position: 'relative',
  },
  leftSide: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 380,
    top: 0,
    width: 'auto',
  },
})
