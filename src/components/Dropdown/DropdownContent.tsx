import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'

class Props {
  className?: React.CSSProperties
  isActive?: boolean
}

export default class DropdownContent extends React.Component<Props, {}> {
  defaultProps = { className: '' }

  render() {
    let content: Array<React.CSSProperties> = [styles.dropdownContent, this.props.className]
    if (this.props.isActive) {
      content.push(styles.dropdownContentActive)
    }

    return (
      <div className={css(content)}>
        {this.props.children}
      </div>
    )
  }
}

const styles = StyleSheet.create({
  dropdownContent: {
    display: 'none',
    position: 'absolute',
    zIndex: 101,
  },
  dropdownContentActive: {
    display: 'inline-block',
  },
})
