import * as React from 'react'
import VideoSources from './VideoSources'
import { ViewsTabState } from '../model'
import { StyleSheet, css } from 'aphrodite/no-important'
import AppState from '../../AppState'

class SidebarProps {
  appState: AppState
  viewsTabState: ViewsTabState
}

export default class Sidebar extends React.Component<SidebarProps, {}> {
  render () {
    return <div className={css(styles.main)}>
        <VideoSources {...this.props}/>
    </div>
  }
}

const styles = StyleSheet.create({
  main: {
    bottom: 0,
    display: 'flex',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '375px',
  },
})
