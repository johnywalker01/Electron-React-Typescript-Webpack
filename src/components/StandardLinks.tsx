import * as React from 'react'
import { CSSProperties, EventHandler, MouseEvent } from 'react'

import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../util/palette'
import { GreyColor } from '../util/palette'

interface Props {
  id?: string
  href?: string
  onClick?: EventHandler<MouseEvent<HTMLAnchorElement>>
  hidden?: boolean
  style?: CSSProperties
}

export class Link extends React.Component<Props, {}> {
  render() {
    const normalizedStyle = palette.normalizeStyle(this.props.style)

    return <a id={this.props.id}
      href={this.props.href}
      onClick={this.props.onClick}
      className={css(styles.a, this.props.hidden && styles.hidden)}
      style={normalizedStyle}>
      {this.props.children}
    </a>
  }
}

export class LinkSeparator extends React.Component<{color: GreyColor, style?: CSSProperties}, {}> {
  render() {
    const normalizedStyle = palette.normalizeStyle(this.props.style)

    return <div className={css(styles.linkSeparator)}
      style={{ borderColor: palette[this.props.color], ...normalizedStyle }} />
  }
}

const styles = StyleSheet.create({
  a: {
    display: 'inline-block',
    color: palette.active_c1,
    cursor: 'pointer',
    textDecoration: 'none',
    ':hover': {
      color: palette.a,
    },
    ':active': {
      color: palette.active_a,
    },
  },
  linkSeparator: {
    height: 18,
    borderRight: '1px solid',
    borderLeft: '1px solid',
    marginRight: 12,
    marginLeft: 12,
  },
  hidden: {
    visibility: 'hidden',
  },
})
