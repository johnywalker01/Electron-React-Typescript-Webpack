import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../../util/palette'
import { FormattedMessage } from 'react-intl'
import messages from './messages'
import { ErrorEntity } from '../../serenity/index'

class Props {
  id: number
  ptzErrorEntity: ErrorEntity
  onClick: () => void
}

export class WarningMessageBox extends React.Component<Props, {}> {

  render() {
    return (
      <div className={css(styles.container, this.props.ptzErrorEntity ? styles.show : styles.hide)}>
        <img src={require('../../../resources/warning-16x14-warn_a.png')} className={css(styles.img)}/>
        <span className={css(styles.message)}>
          <FormattedMessage {...this.handleUpdateMessage()} />
        </span>
        <button className={css(styles.button)} onClick={this.handleClick}
                id={`VideoCell_WarningMessageBox_${this.props.id}`}>
          <FormattedMessage {...messages.ok} />
        </button>
      </div>
    )
  }

  handleClick = () => {
    this.props.onClick()
  }

  handleUpdateMessage() {
    if (this.props.ptzErrorEntity == null) {
      return messages.ptzLockedGeneralError
    }

    switch (this.props.ptzErrorEntity.code) {
      case 'CameraLocked':
        return messages.ptzLockedHigherPriortyUserError
      case 'NeedOverride':
        return messages.ptzLockedOverrideError
      default:
        return messages.ptzLockedGeneralError
    }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ccbe88',
    bottom: 0,
    border: '1px solid black',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    alignContent: 'center',
    height: 30,
    left: 0,
    right: 0,
    position: 'absolute',
    transition: 'bottom 500ms ease 0s',
  },
  img: {
    paddingRight: 10,
    paddingLeft: 10,
  },
  message: {
    color: palette.d3,
    flexGrow: 1,
    fontSize: 12,
    marginRight: 6,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  button: {
    border: `1px solid ${palette.d3}`,
    color: palette.d3,
    fontSize: 12,
    marginRight: 10,
    width: 60,
    ':hover': {
      backgroundColor: palette.tooltip_a,
    },
    ':active': {
      backgroundColor: '#ccbe88',
    },
  },
  hide: {
    bottom: -30,
    transition: 'bottom 500ms ease 0s',
  },
  show: {
    bottom: 0,
    transition: 'bottom 500ms ease 0s',
  },
})
