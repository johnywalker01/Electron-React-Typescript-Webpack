import * as React from 'react'
import palette from '../../util/palette'
import { StyleSheet, css } from 'aphrodite/no-important'
import { Layout } from '../model'

interface Props {
  layout: Layout
  onPopupSelection: React.MouseEventHandler<any>
}
interface State {
  buttonIsFocused: boolean
  buttonIsHovered: boolean
  buttonIsPressed: boolean
}

export default class LayoutButton extends React.Component<Props, State> {

  constructor() {
    super()
    this.state = {buttonIsFocused : false, buttonIsHovered : false, buttonIsPressed : false}
  }

  render() {
    let popupButtonStyles = this.generatePopupButtonStyles()
    let hoverText: string = this.props.layout.replace('x', ' x ')
    return (
      <button id={`LayoutButton_${this.props.layout}`}
        value={this.props.layout}
        onClick={this.props.onPopupSelection}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handlePopupSelection}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onFocus={this.handleMouseFocus}
        onBlur={this.handleMouseBlur}
        title={hoverText}
        className={css(popupButtonStyles.buttonStyle)} />
    )
  }

  handleMouseFocus = () => {
    this.setState({ buttonIsFocused : true,
      buttonIsHovered : this.state.buttonIsHovered,
      buttonIsPressed : this.state.buttonIsPressed})
  }

  handleMouseBlur = () => {
    this.setState({ buttonIsFocused : false,
      buttonIsHovered : this.state.buttonIsHovered,
      buttonIsPressed : this.state.buttonIsPressed})
  }

  handleMouseEnter = () => {
    this.setState({ buttonIsFocused : this.state.buttonIsFocused,
      buttonIsHovered : true,
      buttonIsPressed : this.state.buttonIsPressed })
  }

  handleMouseLeave = () => {
    this.setState({ buttonIsFocused : this.state.buttonIsFocused,
      buttonIsHovered : false,
      buttonIsPressed : false })
  }

  handleMouseDown = () => {
    this.setState({ buttonIsFocused : this.state.buttonIsFocused,
      buttonIsHovered : this.state.buttonIsHovered,
      buttonIsPressed : true })
  }

  handlePopupSelection = (event) => {
    this.setState({ buttonIsFocused : false,
      buttonIsHovered : false,
      buttonIsPressed : false })
    this.props.onPopupSelection(event)
  }

  generatePopupButtonStyles() {
      let layoutKey: string = this.props.layout.replace('x', '_')
      let theBackgroundUrl, theBackground, theBorder, theColor  // tslint:disable-line:one-variable-per-declaration

      if (this.state.buttonIsPressed) {
        theBackgroundUrl = require(`../../../resources/grid-${layoutKey}-26x26-active_a.png`)
        theBackground = `${palette.b5} url(${theBackgroundUrl}) no-repeat center center`
        theBorder = `1px solid ${palette.active_b1}`
        theColor = palette.active_a

      } else if (this.state.buttonIsHovered) {
        theBackgroundUrl = require(`../../../resources/grid-${layoutKey}-26x26-d3.png`)
        theBackground = `${palette.b3} url(${theBackgroundUrl}) no-repeat center center`
        theBorder = `1px solid ${palette.c1}`
        theColor = palette.d3

      } else if (this.state.buttonIsFocused) {
        theBackgroundUrl = require(`../../../resources/grid-${layoutKey}-26x26-c1.png`)
        theBackground = `${palette.b4} url(${theBackgroundUrl}) no-repeat center center`
        theBorder = `1px solid ${palette.active_a}`
        theColor = palette.c1

      } else {
        theBackgroundUrl = require(`../../../resources/grid-${layoutKey}-26x26-c1.png`)
        theBackground = `${palette.b4} url(${theBackgroundUrl}) no-repeat center center`
        theBorder = `1px solid ${palette.b4}`
        theColor = palette.c1
      }

      return (
        StyleSheet.create({
          buttonStyle: {
            background: theBackground,
            border: theBorder,
            color: theColor,
            cursor: 'pointer',
            display: 'inline-block',
            height: '42px',
            padding: 0,
            margin: '2px',
            width: '42px',
          } as React.CSSProperties,
        })
      )
    }
}
