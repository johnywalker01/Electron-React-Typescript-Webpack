import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../util/palette'
import { GreyColor } from '../util/palette'

interface Props {
  id?: string
  label?: string | JSX.Element
  isOpen?: boolean
  parentBgColor?: GreyColor
}

interface State {
  isOpen: boolean
}

export default class CollapsibleBox extends React.Component<Props, State> {

  constructor(props) {
    super(props)

    this.state = ({ isOpen: props.isOpen })
  }

  render() {
    return (
      <div>
        <div id={this.props.id}
          onClick={this.handleClick}
          className={css(this.computedStyles.containerHeader)}>
          <div className={css(styles.triangle, this.state.isOpen && styles.triangleDown)} />
          <span>{this.props.label}</span>
        </div>
        <div className={this.state.isOpen ? css(styles.show) : css(styles.hide)}>
          {this.props.children}
        </div>
      </div>
    )
  }

  handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    this.setState({ isOpen: !this.state.isOpen })
  }

  get computedStyles() {
    return StyleSheet.create({
      containerHeader: {
        backgroundColor: palette[palette.greyStep(this.props.parentBgColor, 1)],
        border: `1px solid ${palette[palette.greyStep(this.props.parentBgColor, 2)]}`,
        cursor: 'pointer',
      },
    })
  }
}

const styles = StyleSheet.create({
  triangle: {
    background: `url(${require('../../resources/triangle-rt-6x8-b1.png')}) center no-repeat`,
    border: 'none',
    display: 'inline-block',
    height: 8,
    margin: '2px 6px',
    transition: 'transform 250ms',
    width: 6,
    ':hover': {
      backgroundImage: `url(${require('../../resources/triangle-rt-6x8-a.png')})`,
    },
    ':active': {
      backgroundImage: `url(${require('../../resources/triangle-rt-6x8-active_a.png')})`,
    },
  },
  triangleDown: {
    transform: 'rotate(90deg)',
  },
  show: {
    display: 'block',
  },
  hide: {
    display: 'none',
  },
})
