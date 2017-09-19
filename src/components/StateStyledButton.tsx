import * as React from 'react'
import { css } from 'aphrodite/no-important'

import logs from '../util/logs'

export type InputType = 'button' | 'submit'

interface Props {
  id?: string
  value?: string
  disabled?: boolean
  inputType: InputType
  tabIndex?: number
  onClick: React.MouseEventHandler<HTMLElement>
  normalStyle: React.CSSProperties
  hoverStyle: React.CSSProperties
  focusStyle: React.CSSProperties
  pressStyle: React.CSSProperties
  disableStyle?: React.CSSProperties
}

interface State {
  isHovered?: boolean
  isFocused?: boolean
  isPressed?: boolean
}

export default class StateStyledButton extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {
      isHovered: false,
      isFocused: false,
      isPressed: false,
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.disabled) {
      this.setState({
        isHovered: false,
        isPressed: false,
        isFocused: false,
      })
    }
  }

  render() {
    logs.COMPONENTS.debug(`StateStyledButton render: disabled: ${this.props.disabled}
      isHovered: ${this.state.isHovered} isFocused: ${this.state.isFocused} isPressed: ${this.state.isPressed}`)

    return <input id={this.props.id}
      type={this.props.inputType}
      value={this.props.value}
      disabled={this.props.disabled}
      tabIndex={this.props.tabIndex}
      className={css(
        this.props.normalStyle,
        this.state.isHovered && this.props.hoverStyle,
        this.state.isFocused && this.props.focusStyle,
        this.state.isPressed && this.props.pressStyle,
        this.props.disabled && this.props.disableStyle,
      )}
      onFocus={this.handleFocus}
      onBlur={this.handleBlur}
      onMouseEnter={this.handleMouseEnter}
      onMouseLeave={this.handleMouseLeave}
      onMouseDown={this.handleMouseDown}
      onMouseUp={this.handleMouseUp}
      onKeyDown={this.handleKeyDown}
      onKeyUp={this.handleKeyUp}
      onClick={this.handleClick}
      />
  }

  handleFocus = (event) => {
    if (this.props.disabled) { return }

    logs.COMPONENTS.debug('StateStyledButton event: Focus')
    this.setState({
      isFocused: true,
    })
  }

  handleBlur = (event) => {
    if (this.props.disabled) { return }

    logs.COMPONENTS.debug('StateStyledButton event: Blur')
    this.setState({
      isFocused: false,
    })
  }

  handleMouseEnter = (event) => {
    if (this.props.disabled) { return }

    logs.COMPONENTS.debug('StateStyledButton event: MouseEnter')
    this.setState({
      isHovered: true,
    })
  }

  handleMouseLeave = (event) => {
    if (this.props.disabled) { return }

    logs.COMPONENTS.debug('StateStyledButton event: MouseLeave')
    this.setState({
      isHovered: false,
      isPressed: false,
      isFocused: false,
    })
  }

  handleMouseDown = (event: React.MouseEvent<any>) => {
    if (this.props.disabled) { return }

    // Only respond to left clicks
    if (event.button !== 0) { return }

    logs.COMPONENTS.debug('StateStyledButton event: MouseDown')
    this.setState({
      isPressed: true,
    })
  }

  handleMouseUp = (event) => {
    if (this.props.disabled) { return }

    // Only respond to left clicks
    if (event.button !== 0) { return }

    logs.COMPONENTS.debug('StateStyledButton event: MouseUp')
    this.setState({
      isPressed: false,
    })
  }

  handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (this.props.disabled) { return }

    // Only respond to space bar
    if (event.keyCode !== 0x20) { return }

    logs.COMPONENTS.debug('StateStyledButton event: KeyDown')
    this.setState({
      isPressed: true,
    })
  }

  handleKeyUp = (event) => {
    if (this.props.disabled) { return }

    // Only respond to space bar
    if (event.keyCode !== 0x20) { return }

    logs.COMPONENTS.debug('StateStyledButton event: KeyUp')
    this.setState({
      isPressed: false,
    })
  }

  handleClick = (event) => {
    event.preventDefault()

    if (!this.props.disabled) {
      this.props.onClick(event)
    }
  }
}
