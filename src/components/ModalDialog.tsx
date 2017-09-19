import * as React from 'react'
import { observer } from 'mobx-react'
import { StyleSheet, css } from 'aphrodite/no-important'
import ReactModal = require('react-modal')

import palette from '../util/palette'

@observer
export default class ModalDialog extends React.Component<{isOpen: boolean, contentLabel: string}, {}> {
  render() {
    return <ReactModal
      isOpen={this.props.isOpen}
      contentLabel={this.props.contentLabel}
      overlayClassName={css(styles.overlay)}
      className={css(styles.fauxBorder)}>
      <div className={css(styles.contentWrapper)}>
        {this.props.children}
      </div>
    </ReactModal>
  }
}

export const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    zIndex: 99999,
  } as React.CSSProperties,
  fauxBorder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    borderRadius: 0,
    outline: 'none',
    padding: 0,
    backgroundColor: palette.c1,
    opacity: 1,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  contentWrapper: {
    border: `1px solid ${palette.d3}`,
    backgroundColor: palette.b4,
    color: palette.c1,
    margin: '6px',
    padding: '10px 8px 10px 8px',
  },
})
