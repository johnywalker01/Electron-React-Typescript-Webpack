import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../util/palette'

class Props {
  className: string
  id: string
  name: string
  onChange: (newValue: string) => void
  value: string
}

export class Select extends React.Component<Props, {}> {

  render() {
    return (
      <select
        className={`${css(styles.select)} ${this.props.className}`}
        id={this.props.id}
        name={this.props.name}
        onChange={this.handleChange}
        value={this.props.value}>
          {this.props.children}
      </select>
    )
  }

  handleChange = (event: React.FormEvent<HTMLSelectElement>) => {
    this.props.onChange(event.currentTarget.value)
  }
}

const styles = StyleSheet.create({
  select: {
    background: `${palette.d4} url(${require('../../resources/triangle-dn-8x6-b1.png')}) no-repeat top 9px right 7px`,
    border: `1px solid ${palette.d1}`,
    color: palette.b1,
    padding: '3px 0 4px 6px',
    textIndent: 1,
    textOverflow: 'ellipsis',
    appearance: 'none',  // Removes native dropdown arrow styling
    '-webkit-appearance': 'none',
    '-moz-appearance': 'none',
    '::-ms-expand': {  // Removes native dropdown arrow in IE
      display: 'none',
    },
    ':-moz-focusring': {  // Removes weird focus outline in firefox
      color: 'transparent !important',
      textShadow: `0 0 0 ${palette.b1} !important`,
    },
    ':focus': {
      borderColor: palette.active_a,
    },
    ':hover': {
      background: `${palette.d3} url(${require('../../resources/triangle-dn-8x6-a.png')}) no-repeat top 9px right 7px`,
      color: palette.a,
    },
    ':active': {
      background: `url(${require('../../resources/triangle-dn-8x6-active_a.png')}) no-repeat top 9px right 7px`,
      backgroundColor: palette.d2,
      borderColor: palette.active_a,
      color: palette.active_a,
    },
  },
})
