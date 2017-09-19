import * as React from 'react'
import { observer } from 'mobx-react'
import { StyleSheet } from 'aphrodite/no-important'

import StateStyledButton from '../components/StateStyledButton'

/* tslint:disable:no-var-requires */
const closeIconA = require('../../resources/close-x-10x10-a.png')
const closeIconActiveA = require('../../resources/close-x-10x10-active_a.png')
const closeIconB1 = require('../../resources/close-x-10x10-b1.png')
const closeIconC1 = require('../../resources/close-x-10x10-c1.png')
/* tslint:enable:no-var-requires */

interface Props {
  id?: string
  isActiveTab: boolean
  onClick: any
  backgroundColor?: string
}

@observer
export default class StateStyledCloseButton extends React.Component<Props, {}> {
  render() {
    return <StateStyledButton id={this.props.id}
              inputType='button'
              tabIndex={-1}
              normalStyle={this.props.isActiveTab ? styles.closeButtonNormalActive : styles.closeButtonNormalInactive}
              hoverStyle={styles.closeButtonHover}
              focusStyle={styles.closeButtonFocus}
              pressStyle={styles.closeButtonPress}
              onClick={this.props.onClick}
              />
  }
}

const styles = StyleSheet.create({
  closeButtonNormalActive: {
    position: 'relative',
    display: 'inline-block',
    bottom: '1px',
    marginLeft: '-12px',
    border: 'none',
    width: '10px',
    height: '10px',
    backgroundImage: `url(${closeIconB1})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: 'transparent',
  },
  closeButtonNormalInactive: {
    position: 'relative',
    display: 'inline-block',
    bottom: '1px',
    marginLeft: '-12px',
    border: 'none',
    width: '10px',
    height: '10px',
    backgroundImage: `url(${closeIconC1})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: 'transparent',
  },
  closeButtonHover: {
    cursor: 'pointer',
    backgroundImage: `url(${closeIconA})`,
  },
  closeButtonFocus: {
    backgroundImage: `url(${closeIconActiveA})`,
  },
  closeButtonPress: {
    backgroundImage: `url(${closeIconActiveA})`,
  },
})
