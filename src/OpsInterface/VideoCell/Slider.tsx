import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../../util/palette'

export const MIN_WIDTH_FOR_SLIDER = 320

const MIN_PARENT_WIDTH = 75
const BUTTON_WIDTHS = 60
const MIN_ZOOM = 100

class Props {
  id: number
  max: number
  min: number
  onClick: (value: number) => void
  parentWidth: number
  initialZoomLevel: number
}

class State {
  value: number
}

export class Slider extends React.Component<Props, State> {
  min: number = MIN_ZOOM

  constructor(props) {
    super(props)
    this.state = { value: undefined }
  }

  componentWillReceiveProps() {
    this.setState({value: this.props.initialZoomLevel || this.state.value})
  }

  render() {
    this.min = Math.max(this.props.min, MIN_ZOOM)
    let containerWidth = (this.props.parentWidth > MIN_WIDTH_FOR_SLIDER)
      ? this.props.parentWidth / 2 - BUTTON_WIDTHS
      : this.props.parentWidth - BUTTON_WIDTHS
    let shouldHideTrack = containerWidth < MIN_PARENT_WIDTH

    return (
      <span className={css(styles.container)} ref='container' style={{width: containerWidth}}>
        <button className={css(styles.buttonZoomOut)} onClick={this.handleDecrement} />
        <input type='range'
               min={this.min}
               max={this.props.max}
               id={`VideoCell_Slider_${this.props.id}`}
               value={this.state.value}
               className={css(styles.input, shouldHideTrack && styles.hide)}
               onMouseUp={this.handleSliderChange}
               onChange={this.handleSliderChange}
               onKeyUp={this.handleSliderChange} />
        <button className={css(styles.buttonZoomIn)} onClick={this.handleIncrement} />
      </span>
    )
  }

  handleDecrement = (event) => {
    let step = Math.ceil((this.props.max - this.min) / 10)
    // keep value above camera ptz min limit
    let newValue: number =  Math.max(this.state.value - step, this.min)
    this.setState({value: newValue})
    this.props.onClick(newValue)
  }

  handleIncrement = (event) => {
    let step = Math.ceil((this.props.max - this.min) / 10)
    // keep value below camera ptz max limit
    let newValue: number =  Math.min(this.state.value + step, this.props.max)
    this.setState({value: newValue})
    this.props.onClick(newValue)
  }

  handleSliderChange = (event) => {
    let target = event.currentTarget
    const newValue =  parseInt(target.value, 10)
    // Only want to send the api call on mouse release, or keyboard events.
    // but still update the slider position on other change events
    if (event.type === 'mouseup' || event.type === 'keyup') {
      this.props.onClick(newValue)
    }
    this.setState({value: newValue})
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 40,
    paddingTop: 3,
  },
  input: {
    '-webkit-appearance': 'none',
    border: 'none',
    borderRadius: 0,
    width: 'calc(100% - 40px)',
    maxWidth: 288,
    '::-webkit-slider-runnable-track': {
      backgroundColor: palette.b1,
      border: 'none',
      borderRadius: 0,
      cursor: 'pointer',
      height: 4,
      marginBottom: 3,
    },
    '::-webkit-slider-thumb': {
      '-webkit-appearance': 'none',
      background: `url(${require('../../../resources/slider-handle-6x18-b1.png')}) center no-repeat`,
      cursor: 'pointer',
      width: 6,
      height: 18,
      marginTop: -7, /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
      ':hover': {
        backgroundImage: `url(${require('../../../resources/slider-handle-6x18-a.png')})`,
      },
      ':active': {
        backgroundImage: `url(${require('../../../resources/slider-handle-6x18-active_a.png')})`,
      },
    },
    '::-moz-range-track': {
      backgroundColor: palette.b1,
      border: 'none',
      cursor: 'pointer',
      height: 4,
    },
    '::-moz-range-thumb': {
      background: `url(${require('../../../resources/slider-handle-6x18-b1.png')}) center no-repeat`,
      border: 'none',
      borderRadius: 0,
      cursor: 'pointer',
      width: 6,
      height: 18,
      ':hover': {
        backgroundImage: `url(${require('../../../resources/slider-handle-6x18-a.png')})`,
      },
      ':active': {
        backgroundImage: `url(${require('../../../resources/slider-handle-6x18-active_a.png')})`,
      },
    },
    '::-ms-fill-lower': {
        backgroundColor: palette.b1,
        border: 'none',
    },
    '::-ms-fill-upper': {
        backgroundColor: palette.b1,
        border: 'none',
    },
    '::-ms-track': {
      backgroundColor: 'transparent',
      borderWidth: '6px 0',
      borderColor: 'transparent',
      color: 'transparent',
      cursor: 'pointer',
      height: 4,
    },
    '::-ms-thumb': {
      background: `url(${require('../../../resources/slider-handle-6x18-b1.png')}) center no-repeat`,
      border: 'none',
      borderRadius: 0,
      cursor: 'pointer',
      marginBottom: -5,
      width: 6,
      height: 18,
      ':hover': {
        backgroundImage: `url(${require('../../../resources/slider-handle-6x18-a.png')})`,
      },
      ':active': {
        backgroundImage: `url(${require('../../../resources/slider-handle-6x18-active_a.png')})`,
      },
    },
    '::-ms-tooltip': {
      display: 'none',
    },
  },
  buttonZoomOut: {
    backgroundImage: `url(${require('../../../resources/slider-minus-20x20-b1.png')})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    border: 'none',
    cursor: 'pointer',
    height: 20,
    marginBottom: 3,
    width: 20,
    ':hover': {
      backgroundImage: `url(${require('../../../resources/slider-minus-20x20-a.png')})`,
    },
    ':active': {
      backgroundImage: `url(${require('../../../resources/slider-minus-20x20-active_a.png')})`,
    },
  },
  buttonZoomIn: {
    backgroundImage: `url(${require('../../../resources/slider-plus-20x20-b1.png')})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    border: 'none',
    cursor: 'pointer',
    height: 20,
    marginBottom: 3,
    width: 20,
    ':hover': {
      backgroundImage: `url(${require('../../../resources/slider-plus-20x20-a.png')})`,
    },
    ':active': {
      backgroundImage: `url(${require('../../../resources/slider-plus-20x20-active_a.png')})`,
    },
  },
  hide: {
    display: 'none',
  },
})
