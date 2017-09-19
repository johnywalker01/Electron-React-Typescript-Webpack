import * as React from 'react'
import palette from '../../util/palette'
import { StyleSheet, css } from 'aphrodite/no-important'
import { Layout } from '../model'
import LayoutButton from './LayoutButton'

interface Props {
  isOpen: boolean
  onLayoutSelected: (layout: Layout) => void
}

export default class LayoutDropdownMenu extends React.Component<Props, {}> {
  render() {
    return <div style={{ display: this.props.isOpen ? 'block' : 'none' }}
      className={css(styles.dropdownPanel)}>

      <div className={css(styles.triangleUpFauxBorder)}>
        <div className={css(styles.triangleUp)} />
      </div>

      <div className={css(styles.layoutButtonContainer)}>
        <LayoutButton layout='1x1' onPopupSelection={this.handlePopupSelection} />
        <LayoutButton layout='1x2' onPopupSelection={this.handlePopupSelection} />
        <LayoutButton layout='2x1' onPopupSelection={this.handlePopupSelection} />
        <LayoutButton layout='2x2' onPopupSelection={this.handlePopupSelection} />
        <LayoutButton layout='3x3' onPopupSelection={this.handlePopupSelection} />
        <LayoutButton layout='4x4' onPopupSelection={this.handlePopupSelection} />
      </div>
    </div>
  }

  handlePopupSelection = (event: React.MouseEvent<any>) => {
    let selectedLayout: Layout  = event.currentTarget.value
    if (selectedLayout) {
      this.props.onLayoutSelected(selectedLayout)
    }
  }
}

const styles = StyleSheet.create({
  dropdownPanel: {
    background: palette.c1,
    display: 'none',
    margin: '0',
    minWidth: '174px',
    overflow: 'auto',
    border: `1px solid ${palette.d3}`,
    padding: '0 8px 8px 8px',  // 8px padding gives the faux border
    position: 'absolute',
    zIndex: 11,
  } as React.CSSProperties,
  triangleUpFauxBorder: {
    width: 0,
    height: 0,
    marginLeft: '12px',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${palette.d3}`,
  },
  triangleUp: {
    position: 'relative',
    top: '1px',
    left: '-8px',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: `8px solid ${palette.b4}`,
    backgroundColor: 'transparent',
  },
  layoutButtonContainer: {
    background: palette.b4,
    border: `1px solid ${palette.d3}`,
    padding: '8px',
  } as React.CSSProperties,
})
