// Implements http://uxg.pelco.org/styles/videoxpert/#p=transport_controls_-_oc
import * as React from 'react'
import { observer } from 'mobx-react'
import { StyleSheet } from 'aphrodite/no-important'
// import logs from '../../util/logs'
import StateStyledButton from '../../components/StateStyledButton'
import palette from '../../util/palette'

interface VideoButtonProps {
  handleClick: any
  name: string
  width: number
  height: number
  checkState?: string | true
  state?: boolean
  activeSuffix?: string
  activeHoverSuffix?: string
  disabled?: boolean
  disabledSuffix?: string
  hidden?: boolean
}

@observer
export class VideoButton extends React.Component<VideoButtonProps, {}> {
  offStyles = null
  onStyles = null
  constructor(props) {
    super(props)
    const { name, checkState, width, height } = props

    const resourcePath = `${name}-${width}x${height}`

    const iconRegular = require(`../../../resources/${resourcePath}-b1.png`)
    const iconHover = require(`../../../resources/${resourcePath}-a.png`)
    const iconMouseDown = require(`../../../resources/${resourcePath}-active_a.png`)

    let iconDisabled = require(`../../../resources/${resourcePath}-${this.props.disabledSuffix || 'b1'}.png`)
    let iconResult = iconRegular
    let iconResultHover = iconHover
    let iconResultMouseDown = iconMouseDown

    if (checkState === true) {
      iconResult = require(`../../../resources/${resourcePath}-${this.props.activeSuffix || 'status_a'}.png`)
      iconResultHover = require(`../../../resources/${resourcePath}-${this.props.activeHoverSuffix || 'status_b1'}.png`)
      // result mousedown unchanged
    } else if (checkState) {
      const onPath = `${checkState}-${width}x${height}`
      iconResult = require(`../../../resources/${onPath}-b1.png`)
      iconResultHover = require(`../../../resources/${onPath}-a.png`)
      iconResultMouseDown = require(`../../../resources/${onPath}-active_a.png`)
    }
    const MOUSE_STYLE: React.CSSProperties = {
      outlineStyle: 'solid',
      outlineOffset: 3,
      outlineWidth: 1,
    }
    const NORMAL_STYLE: React.CSSProperties = {
      border: 'none',
      width: width,
      height: height,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      marginRight: 10,
      paddingLeft: 8,
      paddingRight: 8,
      backgroundColor: 'transparent',
    }
    this.offStyles = StyleSheet.create({
      normal: {
        backgroundImage: `url(${iconRegular})`,
        ...NORMAL_STYLE,
      },
      disabled: {
        backgroundImage: `url(${iconDisabled})`,
        ...NORMAL_STYLE,
      },
      hover: {
        outlineColor: palette.a,
        cursor: 'pointer',
        backgroundImage: `url(${iconHover})`,
        ...MOUSE_STYLE,
      },
      press: {
        outlineColor: palette.active_a,
        backgroundImage: `url(${iconMouseDown})`,
        ...MOUSE_STYLE,
      },
    })

    this.onStyles = StyleSheet.create({
      normal: {
        backgroundImage: `url(${iconResult})`,
        ...NORMAL_STYLE,
      },
      disabled: {
        backgroundImage: `url(${iconResult})`,
        ...NORMAL_STYLE,
      },
      hover: {
        outlineColor: palette.a,
        cursor: 'pointer',
        backgroundImage: `url(${iconResultHover})`,
        ...MOUSE_STYLE,
      },
      press: {
        outlineColor: palette.active_a,
        backgroundImage: `url(${iconResultMouseDown})`,
        ...MOUSE_STYLE,
      },
    })
  }

  render () {
    const { handleClick, state, disabled, hidden, name } = this.props
    if (hidden) { return null }
    let styles = state ? this.onStyles : this.offStyles
    return <StateStyledButton
              id={`VideoButton_${name}`}
              inputType='button'
              tabIndex={-1}
              normalStyle={styles.normal}
              hoverStyle={styles.hover}
              focusStyle={styles.hover}
              pressStyle={styles.press}
              disableStyle={styles.disabled}
              onClick={handleClick}
              disabled={disabled}
              />
  }
}
