import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'
import * as onClickOutside from 'react-onclickoutside'

class Props {
  isActive?: boolean
  onHide?: any
  onShow?: any
  className?: React.CSSProperties
}

class State {
  isActive: boolean
}

/*
 * Converted from https://github.com/Fauntleroy/react-simple-dropdown.
 * Wanted to have more control of component. 
 */
// tslint:disable-next-line:class-name - Wrapped below with onClickOutside HOC
export class _Dropdown extends React.Component<Props, State> {

  constructor(props) {
    super(props)
    this.state = { isActive: false }
  }

  render() {
    const isActive = this.isActive()
    const boundChildren = React.Children.map(this.props.children, (child, index) => {
      let childAsElement = child as any

      // Add callback on trigger element
      if (index === 0) {
        const originalOnClick = childAsElement.props.onClick
        child = React.cloneElement(childAsElement, {
          onClick: (event) => {
            event.preventDefault()
            event.stopPropagation()
            this.onToggleClick(event)
            if (originalOnClick) {
              originalOnClick.apply(child, arguments)
            }
          },
        })
      } else if (index === 1) {
        // Add class based on isActive state.
        child = React.cloneElement(childAsElement, {
          isActive: isActive,
        })
      } else {
        throw new Error('Only DropdownTrigger and DropdownContent are allowed in the Dropdown structure.')
      }

      return child
    })
    return (
      <div
        className={css(styles.dropdown, this.props.className)}>
        {boundChildren}
      </div>
    )
  }

  isActive() {
    return (typeof this.props.isActive === 'boolean')
      ? this.props.isActive
      : this.state.isActive
  }

  hide() {
    this.setState({ isActive: false })
    if (this.props.onHide) {
      this.props.onHide()
    }
  }

  show() {
    this.setState({ isActive: true })
    if (this.props.onShow) {
      this.props.onShow()
    }
  }

  onToggleClick = (event) => {
    event.preventDefault()
    if (this.isActive()) {
      this.hide()
    } else {
      this.show()
    }
  }

  handleClickOutside = (event) => {
    this.setState({isActive: false})
  }
}

const styles = StyleSheet.create({
  dropdown: {
    display: 'inline-block',
  },
})

const Dropdown = onClickOutside(_Dropdown)
export default Dropdown
