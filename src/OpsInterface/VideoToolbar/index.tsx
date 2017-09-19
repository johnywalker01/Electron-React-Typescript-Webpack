import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'
import { observer } from 'mobx-react'
import {ViewTab, Layout } from 'src/OpsInterface/model'
import LayoutDropdownButton from 'src/OpsInterface/VideoToolbar/LayoutDropdownButton'
import palette from 'src/util/palette'
import logs from 'src/util/logs'

@observer
export default class VideoToolbar extends React.Component<{ viewTab: ViewTab}, {menuIsShowing: boolean}> {
  constructor() {
    super()
    this.state = {menuIsShowing: false}
  }

  render() {
    return <div className={css(styles.toolbarStyle)}>
      <LayoutDropdownButton currentLayout={this.props.viewTab.layout}
        onLayoutSelected={this.handleLayoutSelected} />
    </div>
  }

  handleLayoutSelected = (selectedLayout: Layout) => {
    if (selectedLayout) {
      logs.TABS.debug(`New layout selected: ${selectedLayout}`)
      this.props.viewTab.layout = selectedLayout
      this.setState({menuIsShowing: false})
    }
  }
}

const styles = StyleSheet.create({
  toolbarStyle: {
    background: palette.defaultBorderColor,
    borderTop: `1px solid ${palette.d5}`,
    marginTop: '-2px',
    maxHeight: '34px',
    flex: 1,
  } as React.CSSProperties,
})
