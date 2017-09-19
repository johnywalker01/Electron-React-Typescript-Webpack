import * as React from 'react'
import palette from '../../util/palette'
import { StyleSheet, css } from 'aphrodite/no-important'
import { Layout } from '../model'
import { observer } from 'mobx-react'
import * as onClickOutside from 'react-onclickoutside'
import LayoutDropdownMenu from './LayoutDropdownMenu'

interface Props {
  currentLayout: Layout
  onLayoutSelected: (Layout) => void
}

interface State {
  isFocus?: boolean
  isHover?: boolean
  isActive?: boolean
}

@observer
// tslint:disable-next-line:class-name - Wrapped below with onClickOutside HOC
class _LayoutDropdownButton extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {
      isFocus: false,
      isHover: false,
      isActive: false,
    }
  }

  render() {
    return <div className={css(styles.menuContainer)}>

      <button id='LayoutDropdownButton'
        onClick={this.handleMenuClicked}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        className={css(this.stateSpecificButtonStyle, styles.buttonCommon)} />

      <LayoutDropdownMenu isOpen={this.state.isActive}
        onLayoutSelected={this.handleLayoutSelected} />
    </div>
  }

  handleLayoutSelected = (layout: Layout) => {
    this.setState({isActive: false})
    this.props.onLayoutSelected(layout)
  }

  handleMenuClicked = () => {
    this.setState({isActive: !this.state.isActive})
  }

  handleFocus = () => {
    this.setState({isFocus: true})
  }

  handleBlur = () => {
    this.setState({isFocus: false})
  }

  handleMouseEnter = () => {
    this.setState({isHover: true})
  }

  handleMouseLeave = () => {
    this.setState({isHover: false})
  }

  handleMouseDown = (event) => {
    this.setState({isActive: !this.state.isActive})
  }

  handleMouseUp = () => {
    // Toggling the state on mouseUp is a hack to make mouseDown and click not cancel each other out
    this.setState({isActive: !this.state.isActive})
  }

  handleClickOutside = (event) => {
    this.setState({isActive: false})
  }

  get stateSpecificButtonStyle() {
    let cssProperties: React.CSSProperties

    const layoutFileKey: string = this.props.currentLayout.replace('x', '_')

    if (this.state.isActive) {
      const layoutIconUrl = require(`../../../resources/grid-${layoutFileKey}-26x26-active_a.png`)
      const triangleIconUrl = require('../../../resources/triangle-dn-8x6-active_a.png')
      cssProperties = {
        backgroundImage: `url(${layoutIconUrl}), url(${triangleIconUrl})`,
        backgroundColor: `${palette.d3}`,
        border: `1px solid ${palette.active_b1}`,
        color: palette.active_a,
      }
    } else if (this.state.isHover) {
      const layoutIconUrl = require(`../../../resources/grid-${layoutFileKey}-26x26-a.png`)
      const triangleIconUrl = require('../../../resources/triangle-dn-8x6-a.png')
      cssProperties = {
        backgroundImage: `url(${layoutIconUrl}), url(${triangleIconUrl})`,
        backgroundColor: `${palette.c1}`,
        border: `1px solid ${palette.d2}`,
        color: palette.a,
      }
    } else {
      const layoutIconUrl = require(`../../../resources/grid-${layoutFileKey}-26x26-b1.png`)
      const triangleIconUrl = require('../../../resources/triangle-dn-8x6-b1.png')
      cssProperties = {
        backgroundImage: `url(${layoutIconUrl}), url(${triangleIconUrl})`,
        backgroundColor: `${palette.d5}`,
        border: `1px solid ${palette.d3}`,
        color: palette.b1,
      }
    }

    if (this.state.isFocus) {
      cssProperties.border = `1px solid ${palette.active_a}`
    }

    return StyleSheet.create({style: cssProperties}).style
  }
}

const styles = StyleSheet.create({
  menuContainer: {
    background: palette.d5,
    float: 'right',
    height: '28px',
    margin: '4px 12px 3px 3px',
    width: '48px',
  } as React.CSSProperties,
  buttonCommon: {
    backgroundRepeat: 'no-repeat, no-repeat',
    backgroundPosition: 'left 6px center, right 6px center',
    backgroundSize: '18px, 8px 6px',
    cursor: 'pointer',
    height: '28px',
    padding: 0,
    width: '48px',
  } as React.CSSProperties,
})

const LayoutDropdownButton = onClickOutside(_LayoutDropdownButton)
export default LayoutDropdownButton
