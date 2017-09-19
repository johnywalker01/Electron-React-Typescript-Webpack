import * as React from 'react'
import { css } from 'aphrodite/no-important'

class Props {
  className?: React.CSSProperties
  onClick?: any
}

export default class DropdownTrigger extends React.Component<Props, {}> {
  defaultProps = { className: '' }

  render() {
    return (
      <a className={css(this.props.className)} onClick={this.props.onClick}>
        {this.props.children}
      </a>
    )
  }
}
